import type { DiscoveryResult } from '@/types/discovery';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

type TokenState = { accessToken?: string; expiresAt?: number };
const tokenState: TokenState = {};

async function getSpotifyAccessToken(): Promise<string> {
	if (!CLIENT_ID || !CLIENT_SECRET) throw new Error('Missing SPOTIFY_CLIENT_ID/SECRET');
	const now = Math.floor(Date.now() / 1000);
	if (tokenState.accessToken && tokenState.expiresAt && tokenState.expiresAt - 30 > now) {
		return tokenState.accessToken;
	}
	const resp = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
		},
		body: 'grant_type=client_credentials',
	});
	if (!resp.ok) throw new Error('Failed to get Spotify token');
	const json = await resp.json();
	tokenState.accessToken = json.access_token;
	tokenState.expiresAt = now + json.expires_in;
	return tokenState.accessToken!;
}

async function spotifyGet<T>(url: string, init?: RequestInit): Promise<T> {
	const token = await getSpotifyAccessToken();
	const res = await fetch(url, {
		...init,
		headers: {
			...(init?.headers || {}),
			Authorization: `Bearer ${token}`,
		},
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Spotify error ${res.status}: ${text}`);
	}
	return res.json() as Promise<T>;
}

export async function availableGenreSeeds(): Promise<Set<string>> {
	const data = await spotifyGet<{ genres: string[] }>('https://api.spotify.com/v1/recommendations/available-genre-seeds');
	return new Set(data.genres);
}

export async function searchArtistIdsByNames(names: string[]): Promise<{ id: string; name: string; genres: string[] }[]> {
	const results: { id: string; name: string; genres: string[] }[] = [];
	for (const name of names.slice(0, 5)) {
		const q = encodeURIComponent(name);
		const data = await spotifyGet<{ artists: { items: { id: string; name: string; genres: string[] }[] } }>(
			`https://api.spotify.com/v1/search?type=artist&limit=1&q=${q}`
		);
		const found = data.artists.items[0];
		if (found) results.push({ id: found.id, name: found.name, genres: found.genres });
	}
	return results;
}

export async function fetchArtistById(id: string): Promise<{ id: string; name: string; genres: string[]; images: { url: string }[] }> {
	return spotifyGet(`https://api.spotify.com/v1/artists/${id}`);
}

interface SpotifyTrack {
	id: string;
	name: string;
	preview_url: string | null;
	artists: { id: string; name: string }[];
	album?: { images?: { url: string }[] };
}

export async function getRecommendations(params: {
	seed_artists?: string[];
	seed_genres?: string[];
	target?: { energy?: number; valence?: number; tempo?: number };
	limit?: number;
}): Promise<SpotifyTrack[]> {
	const qs = new URLSearchParams();
	qs.set('limit', String(params.limit ?? 20));
	if (params.seed_artists?.length) qs.set('seed_artists', params.seed_artists.slice(0, 5).join(','));
	if (params.seed_genres?.length) qs.set('seed_genres', params.seed_genres.slice(0, 5).join(','));
	if (params.target?.energy !== undefined) qs.set('target_energy', String(params.target.energy));
	if (params.target?.valence !== undefined) qs.set('target_valence', String(params.target.valence));
	if (params.target?.tempo !== undefined) qs.set('target_tempo', String(params.target.tempo));

	const data = await spotifyGet<{ tracks: SpotifyTrack[] }>(`https://api.spotify.com/v1/recommendations?${qs.toString()}`);
	return data.tracks ?? [];
}

export async function buildDiscoveryResultsFromTracks(
	tracks: SpotifyTrack[],
	rationale: string
): Promise<DiscoveryResult[]> {
	// Filter tracks with preview_url to satisfy acceptance
	const playable = tracks.filter((t) => t.preview_url);
	const artistIds = Array.from(new Set<string>(playable.map((t) => t.artists?.[0]?.id).filter(Boolean)));
	// Batch fetch artist genres (Spotify allows up to 50 ids, but we’ll fetch sequentially for simplicity)
	const artistGenres = new Map<string, { name: string; genres: string[] }>();
	for (const id of artistIds) {
		try {
			const a = await fetchArtistById(id);
			artistGenres.set(id, { name: a.name, genres: a.genres ?? [] });
		} catch {
			// ignore
		}
	}
	return playable.slice(0, 20).map((t) => {
		const a = t.artists?.[0];
		const albumImg: string | null = t.album?.images?.[0]?.url ?? null;
		const ag = a?.id ? artistGenres.get(a.id) : undefined;
		return {
			artistId: a?.id ?? 'unknown',
			artistName: ag?.name ?? a?.name ?? 'Unknown Artist',
			image: albumImg,
			topTrackPreviewUrl: t.preview_url ?? null,
			genres: ag?.genres ?? [],
			reason: rationale,
			trackName: t.name,
			trackId: t.id,
		};
	});
}
