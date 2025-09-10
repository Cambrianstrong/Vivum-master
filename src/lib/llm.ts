type Intent = {
	seedArtistNames: string[];
	seedGenres: string[];
	mode: 'recommendations' | 'artists' | 'tracks';
	target?: { energy?: number; valence?: number; tempo?: number };
	rationale: string;
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

function heuristicIntent(prompt: string, vibeTags?: string[]): Intent {
	const lower = prompt.toLowerCase();
	const tags = (vibeTags ?? []).map((t) => t.toLowerCase());
	const seedArtistNames: string[] = [];
	const seedGenres = new Set<string>();

	if (lower.includes('sza')) seedArtistNames.push('SZA');
	if (lower.includes('atlanta')) seedGenres.add('hip-hop');

	if (lower.includes('soul') || tags.includes('soulful')) seedGenres.add('soul');
	if (lower.includes('late night') || tags.includes('late-night')) {
		seedGenres.add('r&b');
	}
	if (lower.includes('rapper') || lower.includes('rap')) seedGenres.add('hip-hop');

	const target = { energy: undefined as number | undefined, valence: undefined as number | undefined };
	if (lower.includes('late night') || tags.includes('late-night')) {
		target.energy = 0.3;
		target.valence = 0.3;
	}
	if (lower.includes('moody') || tags.includes('moody')) {
		target.energy = 0.35;
		target.valence = 0.25;
	}

	const rationale = 'Heuristic mapping of prompt and vibe tags to seeds.';
	return {
		seedArtistNames,
		seedGenres: Array.from(seedGenres),
		mode: 'recommendations',
		target,
		rationale,
	};
}

export async function parsePromptToIntent(prompt: string, vibeTags?: string[]): Promise<Intent> {
	if (!OPENAI_API_KEY && !DEEPSEEK_API_KEY) {
		return heuristicIntent(prompt, vibeTags);
	}

	const system = `You translate free-text music discovery prompts into Spotify seed inputs.
Return STRICT JSON only:
{"seedArtistNames": string[], "seedGenres": string[], "mode": "recommendations"|"artists"|"tracks", "target": {"energy"?: number, "valence"?: number, "tempo"?: number}, "rationale": string}
- If user mentions "sounds like <artist>", include that artist in seedArtistNames.
- If mood/time-vibe (e.g., late night, moody, soulful), map to genres and target energy/valence.
- Keep genres to Spotify-style seeds (e.g., r&b, soul, hip-hop, chill, pop, indie, jazz).
- rationale: short 1-2 line why that ties prompt to seeds.`;

	const user = `Prompt: ${prompt}
Vibe tags: ${(vibeTags ?? []).join(', ') || 'none'}`;

	try {
		if (OPENAI_API_KEY) {
			const res = await fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${OPENAI_API_KEY}`,
				},
				body: JSON.stringify({
					model: 'gpt-4o-mini',
					response_format: { type: 'json_object' },
					messages: [
						{ role: 'system', content: system },
						{ role: 'user', content: user },
					],
					temperature: 0.2,
				}),
			});
			const data = await res.json();
			const content = data?.choices?.[0]?.message?.content;
			const parsed = JSON.parse(content);
			return parsed as Intent;
		}
		if (DEEPSEEK_API_KEY) {
			const res = await fetch('https://api.deepseek.com/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
				},
				body: JSON.stringify({
					model: 'deepseek-chat',
					response_format: { type: 'json_object' },
					messages: [
						{ role: 'system', content: system },
						{ role: 'user', content: user },
					],
					temperature: 0.2,
				}),
			});
			const data = await res.json();
			const content = data?.choices?.[0]?.message?.content;
			const parsed = JSON.parse(content);
			return parsed as Intent;
		}
	} catch (e) {
		// fall through
	}
	return heuristicIntent(prompt, vibeTags);
}