import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { clsx } from "clsx";

export const metadata: Metadata = {
  title: "Supa Vibe",
  description: "Vibe-based discovery and playlists",
};

const Tab = ({ href, label }: { href: string; label: string }) => (
  <Link
    href={href}
    className={clsx(
      "flex flex-col items-center py-3 hover:bg-neutral-800/50",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
    )}
  >
    {label}
  </Link>
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
          <div className="container py-3">
            <div className="text-lg font-semibold">Supa Vibe</div>
          </div>
        </header>

        <main className="container pb-24 pt-4">{children}</main>

        {/* Bottom tabs */}
        <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-neutral-800 bg-neutral-900/90 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/70">
          <div className="container grid grid-cols-3 text-sm">
            <Tab href="/" label="Discover" />
            <Tab href="/playlist" label="Playlist" />
            <Tab href="/profile" label="Profile" />
          </div>
        </nav>
      </body>
    </html>
  );
}
