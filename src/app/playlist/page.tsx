'use client';

import { useEffect, useState } from 'react';
import { loadPlaylist, removeFromPlaylist } from '@/lib/playlist';

export default function PlaylistPage() {
	const [items, setItems] = useState(loadPlaylist());

	useEffect(() => {
		setItems(loadPlaylist());
	}, []);

	return (
		<main className="p-4 space-y-4">
			<h1 className="text-xl font-semibold">Your Playlist</h1>
			{items.length === 0 ? (
				<div className="text-sm text-neutral-400">No items yet. Discover and add tracks.</div>
			) : (
				<ul className="space-y-3">
					{items.map((t) => (
						<li key={t.trackId ?? `${t.artistId}-${t.artistName}`} className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
							<div className="flex gap-3">
								<div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-800">
									{t.image ? <img src={t.image} alt="" className="h-full w-full object-cover" /> : null}
								</div>
								<div className="min-w-0 flex-1">
									<div className="truncate text-sm text-neutral-400">{t.artistName}</div>
									<div className="truncate text-base font-medium">{t.trackName ?? 'Track'}</div>
									{t.topTrackPreviewUrl ? <audio className="mt-2 w-full" src={t.topTrackPreviewUrl} controls preload="none" /> : null}
									<div className="mt-2 flex gap-2">
										<button
											className="rounded-md bg-neutral-800 px-3 py-1.5 text-sm"
											onClick={() => setItems(removeFromPlaylist(t.trackId ?? ''))}
										>
											Remove
										</button>
									</div>
                                </div>
							</div>
						</li>
					))}
				</ul>
			)}
			<button
				className="w-full rounded-md bg-emerald-500 px-3 py-2 font-medium text-emerald-950"
				onClick={() => alert('Stub: Export to Spotify')}
			>
				Export to Spotify
			</button>
		</main>
	);
}