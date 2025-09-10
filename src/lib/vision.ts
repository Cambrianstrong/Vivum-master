const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

export async function extractVibeTagsFromImage(file: Blob): Promise<string[] | undefined> {
	try {
		const arrayBuffer = await file.arrayBuffer();
		const base64 = Buffer.from(arrayBuffer).toString('base64');

		if (OPENAI_API_KEY) {
			const res = await fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${OPENAI_API_KEY}`,
				},
				body: JSON.stringify({
					model: 'gpt-4o-mini',
					messages: [
						{
							role: 'system',
							content:
								'You are a vibe classifier. Return a comma-separated list of 3-6 concise vibe tags like "late-night, neon, moody".',
						},
						{
							role: 'user',
							content: [
								{
									type: 'input_text',
									text: 'Extract vibe tags from this image.',
								},
								{
									type: 'input_image',
									image_url: { url: `data:image/jpeg;base64,${base64}` },
								},
							],
						},
					],
					temperature: 0.2,
				}),
			});
			const data = await res.json();
			const text: string = data?.choices?.[0]?.message?.content ?? '';
			return text
				.split(',')
				.map((t: string) => t.trim())
				.filter(Boolean);
		}
		if (DEEPSEEK_API_KEY) {
			// If DeepSeek vision is unavailable, fall back
			return undefined;
		}
	} catch {
		// ignore
	}
	return undefined;
}