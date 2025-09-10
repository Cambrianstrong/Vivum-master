import type { DiscoveryResult } from '@/types/discovery';

const KEY = 'supa_vibe_playlist_v1';

export function loadPlaylist(): DiscoveryResult[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(KEY);
		return raw ? (JSON.parse(raw) as DiscoveryResult[]) : [];
	} catch {
		return [];
	}
}

export function savePlaylist(items: DiscoveryResult[]) {
	if (typeof window === 'undefined') return;
	localStorage.setItem(KEY, JSON.stringify(items));
}

export function addToPlaylist(item: DiscoveryResult) {
	const items = loadPlaylist();
	const exists = items.some((i) => i.trackId === item.trackId);
	if (!exists) {
		items.push(item);
		savePlaylist(items);
	}
	return items;
}

export function removeFromPlaylist(trackId: string) {
	const items = loadPlaylist().filter((i) => i.trackId !== trackId);
	savePlaylist(items);
	return items;
}
