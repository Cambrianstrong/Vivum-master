"use client";

import { useState } from 'react';
import type { Video } from '@/types/video';
import { VideoCard } from './VideoCard';
import { PlayerModal } from './player/PlayerModal';

export function VideoGrid({ videos }: { videos: Video[] }) {
  const [current, setCurrent] = useState<Video | null>(null);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} onOpen={setCurrent} />
        ))}
      </div>

      <PlayerModal video={current} onClose={() => setCurrent(null)} />
    </div>
  );
}
