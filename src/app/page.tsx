'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import type { DiscoveryResult } from '@/types/discovery';
import { addToPlaylist } from '@/lib/playlist';

type ApiResponse = { results?: DiscoveryResult[]; error?: string; note?: string; hint?: string };

export default function DiscoverPage() {
	const [prompt, setPrompt] = useState('');
	const [image, setImage] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [note, setNote] = useState<string | null>(null);
	const [results, setResults] = useState<DiscoveryResult[]>([]);
	const formRef = useRef<HTMLFormElement>(null);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setNote(null);
		setResults([]);

		try {
			const form = new FormData();
			form.set('prompt', prompt);
			if (image) form.set('image', image);

			const res = await fetch('/api/discover', {
				method: 'POST',
				body: form,
			});
			const data: ApiResponse = await res.json();
			if (!res.ok) {
				setError(data.error || 'Failed to fetch results');
			} else {
				setResults(data.results || []);
				if (data.note) setNote(data.note);
			}
		} catch (e: unknown) {
			setError((e as Error)?.message || 'Unknown error');
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="p-4 space-y-4">
			<h1 className="text-xl font-semibold">Discover</h1>
			<form ref={formRef} className="space-y-3" onSubmit={onSubmit}>
				<input
					className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-600"
					placeholder='e.g., "new rappers in Atlanta"'
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
				/>
				<label className="block">
					<span className="text-sm text-neutral-400">Optional image (vibe tags via vision if configured)</span>
					<input
						type="file"
						accept="image/*"
						onChange={(e) => setImage(e.target.files?.[0] ?? null)}
						className="mt-1 block w-full text-sm text-neutral-300 file:mr-4 file:rounded-md file:border-0 file:bg-neutral-800 file:px-3 file:py-2 file:text-neutral-200 hover:file:bg-neutral-700"
					/>
				</label>
				<button
					type="submit"
					disabled={loading || !prompt}
					className="w-full rounded-md bg-white px-3 py-2 font-medium text-neutral-900 disabled:opacity-50"
				>
					{loading ? 'Searching…' : 'Search vibe'}
				</button>
			</form>

			{error && <div className="rounded-md border border-red-800 bg-red-950 p-3 text-sm text-red-200">{error}</div>}
			{note && !results.length && <div className="rounded-md border border-neutral-800 bg-neutral-900 p-3 text-sm text-neutral-300">{note}</div>}
			{!loading && !error && results.length === 0 && (
				<div className="text-sm text-neutral-400">Try: “new rappers in Atlanta”, “sounds like SZA”, or “something soulful for late night”.</div>
			)}

			<ul className="space-y-3">
				{results.map((r) => (
					<li key={`${r.artistId}-${r.trackId ?? r.artistName}`} className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
						<div className="flex gap-3">
							<div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-800">
								{r.image ? <img src={r.image} alt={r.artistName} className="h-full w-full object-cover" /> : null}
							</div>
							<div className="min-w-0 flex-1">
								<div className="truncate text-sm text-neutral-400">{r.artistName}</div>
								<div className="truncate text-base font-medium">{r.trackName ?? 'Top track'}</div>
								{r.topTrackPreviewUrl ? (
									<audio className="mt-2 w-full" src={r.topTrackPreviewUrl} controls preload="none" />
								) : (
									<div className="mt-2 text-xs text-neutral-500">No preview available</div>
								)}
								<div className="mt-2 text-xs text-neutral-400">
									<span className="font-medium">Why</span>: {r.reason}
								</div>
								<div className="mt-2 flex gap-2">
									<Link href={`/artist/${r.artistId}`} className="rounded-md bg-neutral-800 px-3 py-1.5 text-sm">
										Open Profile
									</Link>
									<button
										className="rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-emerald-950"
										onClick={() => {
											const items = addToPlaylist(r);
											if (items) {
												// feedback is optional
											}
										}}
									>
										Add to Playlist
									</button>
									<Link href={`/share/${r.artistId}`} className="rounded-md bg-neutral-800 px-3 py-1.5 text-sm">
										Share
									</Link>
								</div>
							</div>
						</div>
					</li>
				))}
			</ul>
		</main>
	);
}
