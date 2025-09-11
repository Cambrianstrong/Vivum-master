import { notFound } from "next/navigation";

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return notFound();
  return (
    <main className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="h-16 w-16 rounded-full bg-neutral-800" />
        <div>
          <h1 className="text-xl font-semibold">Artist #{id}</h1>
          <p className="subtle">@artist_handle</p>
        </div>
        <div className="ml-auto rounded-full bg-neutral-800 px-3 py-1 text-sm">Score 82</div>
      </header>

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-300">Stats</h2>
        <div className="grid grid-cols-3 gap-2">
          <div className="card p-3"><div className="text-xl font-semibold">1.2M</div><div className="subtle">Monthly</div></div>
          <div className="card p-3"><div className="text-xl font-semibold">320K</div><div className="subtle">Followers</div></div>
          <div className="card p-3"><div className="text-xl font-semibold">85</div><div className="subtle">Score</div></div>
        </div>
      </section>
    </main>
  );
}
