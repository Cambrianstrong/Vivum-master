import type { Metadata, ResolvingMetadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props, _parent: ResolvingMetadata): Promise<Metadata> {
  const { id } = await params;
  const title = `Supa Vibe • Share ${id}`;
  const description = "Check out this vibe.";
  const image = `https://placehold.co/1200x630/111/EEE?text=Share+${encodeURIComponent(id)}`;
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  return (
    <main className="space-y-4">
      <h1 className="h1">Share Card</h1>
      <div className="card p-4">
        <div className="h-40 w-full rounded-md bg-neutral-800" />
        <div className="mt-3">
          <div className="text-lg font-medium">Vibe #{id}</div>
          <div className="subtle">Generated with Supa Vibe</div>
        </div>
      </div>
    </main>
  );
}
