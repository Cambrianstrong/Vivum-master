export type Video = {
  id: string;
  title: string;
  description?: string;
  src: string; // Video URL (mp4/webm/hls)
  thumbnail?: string; // Poster image URL
  tags: string[];
  durationSeconds?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:5';
  createdAt?: string; // ISO date string
};
