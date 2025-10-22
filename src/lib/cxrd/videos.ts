import type { Video } from '@/types/video';

export const cxrdVideos: Video[] = [
  {
    id: 'cxrd-sora-01',
    title: 'Neon City Drift',
    description: 'A cyberpunk rider glides through neon-soaked avenues. Generated with Sora.',
    src: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
    thumbnail: 'https://placehold.co/1200x675/0b0b0b/eee?text=Neon+City+Drift',
    tags: ['sora', 'neon', 'cyberpunk', 'city', 'night'],
    durationSeconds: 5,
    aspectRatio: '16:9',
    createdAt: '2025-10-01T00:00:00.000Z',
  },
  {
    id: 'cxrd-sora-02',
    title: 'Midnight Studio',
    description: 'Intimate performance with moody lighting and film grain.',
    src: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
    thumbnail: 'https://placehold.co/1200x675/0b0b0b/eee?text=Midnight+Studio',
    tags: ['sora', 'studio', 'moody', 'grain', 'performance'],
    durationSeconds: 5,
    aspectRatio: '16:9',
    createdAt: '2025-10-02T00:00:00.000Z',
  },
  {
    id: 'cxrd-sora-03',
    title: 'Desert Mirage',
    description: 'A surreal mirage dances above dunes at golden hour.',
    src: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
    thumbnail: 'https://placehold.co/1200x675/0b0b0b/eee?text=Desert+Mirage',
    tags: ['sora', 'desert', 'surreal', 'golden-hour'],
    durationSeconds: 5,
    aspectRatio: '16:9',
    createdAt: '2025-10-03T00:00:00.000Z',
  },
  {
    id: 'cxrd-sora-04',
    title: 'Underwater Bloom',
    description: 'Slow-motion coral bloom with ethereal particles.',
    src: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
    thumbnail: 'https://placehold.co/1200x675/0b0b0b/eee?text=Underwater+Bloom',
    tags: ['sora', 'underwater', 'organic', 'ambient'],
    durationSeconds: 5,
    aspectRatio: '16:9',
    createdAt: '2025-10-04T00:00:00.000Z',
  },
  {
    id: 'cxrd-sora-05',
    title: 'Analog Dreams',
    description: 'VHS textures and dreamlike color bleed.',
    src: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
    thumbnail: 'https://placehold.co/1200x675/0b0b0b/eee?text=Analog+Dreams',
    tags: ['sora', 'vhs', 'vintage', 'dreamy'],
    durationSeconds: 5,
    aspectRatio: '16:9',
    createdAt: '2025-10-05T00:00:00.000Z',
  },
  {
    id: 'cxrd-sora-06',
    title: 'Skyline Cascade',
    description: 'Rain-washed skyline with reflective puddles and light trails.',
    src: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
    thumbnail: 'https://placehold.co/1200x675/0b0b0b/eee?text=Skyline+Cascade',
    tags: ['sora', 'rain', 'city', 'bokeh'],
    durationSeconds: 5,
    aspectRatio: '16:9',
    createdAt: '2025-10-06T00:00:00.000Z',
  },
];

export function getCxrdVideoById(id: string): Video | undefined {
  return cxrdVideos.find((v) => v.id === id);
}
