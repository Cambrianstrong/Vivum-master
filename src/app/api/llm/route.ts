import { NextResponse } from 'next/server';

export const runtime = 'edge';

type Song = { title: string; artist: string };

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // If no key, return sample songs
    if (!apiKey) {
      const songs: Song[] = [
        { title: 'Neon Highway', artist: 'Kari Nova' },
        { title: 'Sunset Arcade', artist: 'R3M' },
        { title: 'Slow Chrome', artist: 'Orion Vale' },
      ];
      return NextResponse.json({ songs });
    }

    // With OPENAI_API_KEY: ask for 5 songs (title + artist) as JSON
    const sys = `You are a music assistant. Given a vibe prompt, reply ONLY with JSON:
{ "songs": [ { "title": "...", "artist": "..." }, ... ] } (5 items). No prose.`;
    const user = `Vibe prompt: ${prompt}`;

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: user },
        ],
        temperature: 0.7,
      }),
    });

    if (!resp.ok) {
      const fallback: Song[] = [
        { title: 'Neon Highway', artist: 'Kari Nova' },
        { title: 'Sunset Arcade', artist: 'R3M' },
        { title: 'Slow Chrome', artist: 'Orion Vale' },
      ];
      return NextResponse.json({ songs: fallback });
    }

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content ?? '';
    // Try to parse JSON; if parse fails, fallback
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed?.songs)) {
        // keep max 10
        return NextResponse.json({ songs: parsed.songs.slice(0, 10) });
      }
    } catch {
      /* ignore */
    }

    const fallback: Song[] = [
      { title: 'Neon Highway', artist: 'Kari Nova' },
      { title: 'Sunset Arcade', artist: 'R3M' },
      { title: 'Slow Chrome', artist: 'Orion Vale' },
    ];
    return NextResponse.json({ songs: fallback });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
