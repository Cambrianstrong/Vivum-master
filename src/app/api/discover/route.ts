import { NextResponse } from 'next/server';
import { parsePromptToIntent } from '@/lib/llm';
import { extractVibeTagsFromImage } from '@/lib/vision';
import { availableGenreSeeds, searchArtistIdsByNames, getRecommendations, buildDiscoveryResultsFromTracks } from '@/lib/spotify';

export async function POST(req: Request) {
	try {
		const contentType = req.headers.get('content-type') || '';
		let prompt = '';
		let imageBlob: Blob | undefined;

		if (contentType.includes('multipart/form-data')) {
			const form = await req.formData();
			prompt = String(form.get('prompt') || '').trim();
			const file = form.get('image');
			if (file && file instanceof Blob && file.size > 0) {
				imageBlob = file as Blob;
			}
		} else {
			const body = await req.json().catch(() => ({}));
			prompt = String(body.prompt || '').trim();
		}
		if (!prompt) {
			return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
		}

		let tags: string[] | undefined;
		if (imageBlob) {
			tags = await extractVibeTagsFromImage(imageBlob).catch(() => undefined);
		}

		const intent = await parsePromptToIntent(prompt, tags);
		const seedsSet = await availableGenreSeeds().catch(() => new Set<string>());
		const seedGenres = (intent.seedGenres || []).map((g) => g.toLowerCase()).filter((g) => seedsSet.has(g));

		const seedArtists = await searchArtistIdsByNames(intent.seedArtistNames || []);
		const seedArtistIds = seedArtists.map((a) => a.id);

		const tracks = await getRecommendations({
			seed_artists: seedArtistIds,
			seed_genres: seedGenres,
			target: intent.target,
			limit: 30,
		});

		const results = await buildDiscoveryResultsFromTracks(tracks, intent.rationale);
		if (!results.length) {
			return NextResponse.json({ results: [], note: 'No playable previews found for this query.' }, { status: 200 });
		}
		return NextResponse.json({ results }, { status: 200 });
	} catch (e: unknown) {
		const msg = (e as Error)?.message || 'Unknown error';
		const needsSpotify = /SPOTIFY_CLIENT_ID/.test(msg) || /token/.test(msg);
		const status = needsSpotify ? 501 : 500;
		return NextResponse.json({ error: msg, hint: needsSpotify ? 'Set SPOTIFY_CLIENT_ID/SECRET in env.' : undefined }, { status });
	}
}