export type DiscoveryResult = {
	artistId: string;
	artistName: string;
	image: string | null;
	topTrackPreviewUrl: string | null;
	genres: string[];
	reason: string;
	trackName?: string;
	trackId?: string;
};
