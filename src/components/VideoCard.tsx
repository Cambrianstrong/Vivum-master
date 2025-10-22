"use client";

import Image from 'next/image';
import { useState } from 'react';
import type { Video } from '@/types/video';
import Link from 'next/link';

export function VideoCard({ video, onOpen }: { video: Video; onOpen?: (v: Video) => void }) {
  const [hovered, setHovered] = useState(false);
  const ratioClass = video.aspectRatio === '9:16' ? 'aspect-[9/16]' : video.aspectRatio === '1:1' ? 'aspect-square' : 'aspect-video';

  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/share/video/${video.id}`} className={`block w-full ${ratioClass} bg-neutral-800`}>
        {video.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnail}
            alt={video.title}
            className={`h-full w-full object-cover transition-transform duration-300 ${hovered ? 'scale-105' : ''}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-500">No thumbnail</div>
        )}
      </Link>

      <div className="absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{video.title}</div>
          {video.tags?.length ? (
            <div className="mt-0.5 truncate text-xs text-neutral-400">{video.tags.join(' • ')}</div>
          ) : null}
        </div>
        <div className="ml-auto flex gap-2">
          <button
            className="rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-neutral-900 hover:bg-white"
            onClick={() => onOpen?.(video)}
          >
            Play
          </button>
        </div>
      </div>
    </div>
  );
}
