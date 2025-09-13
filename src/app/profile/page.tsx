'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/client';

export default function ProfilePage() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  // Check if Supabase is configured
  const supabaseConfigured = typeof window !== 'undefined' && 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

  // Load current user + profile
  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      setSessionEmail(user.email ?? null);

      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      setFullName(data?.full_name ?? '');
      setLoading(false);
    })();
  }, [supabaseConfigured]);

  // Magic link sign-in
  async function sendMagicLink() {
    if (!supabaseConfigured) {
      alert('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== 'undefined'
            ? `${window.location.origin.replace('localhost', '127.0.0.1')}/profile`
            : undefined,
      },
    });
    if (error) return alert(error.message);
    setSent(true);
  }

  // Save profile name
  async function saveProfile() {
    if (!supabaseConfigured) {
      alert('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('Please sign in first.');
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, email: sessionEmail, full_name: fullName });
    if (error) return alert(error.message);
    alert('Saved ✅');
  }

  // Sign out
  async function signOut() {
    if (!supabaseConfigured) {
      alert('Supabase is not configured.');
      return;
    }
    await supabase.auth.signOut();
    setSessionEmail(null);
    setFullName('');
  }

  if (loading) return <div>Loading…</div>;

  // Supabase not configured → show message
  if (!supabaseConfigured) {
    return (
      <div className="space-y-4">
        <h1 className="h1">Profile</h1>
        <div className="card p-4">
          <div className="subtle mb-2">Supabase Configuration Required</div>
          <div>To use the profile feature, please configure your Supabase environment variables:</div>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>• NEXT_PUBLIC_SUPABASE_URL</li>
            <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          </ul>
        </div>
      </div>
    );
  }

  // Not signed in → email box
  if (!sessionEmail) {
    return (
      <div className="space-y-4">
        <h1 className="h1">Profile</h1>
        <div className="card p-4 space-y-3">
          <label className="block">
            <span className="subtle">Email</span>
            <input
              className="input mt-1"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button className="btn-primary w-full" onClick={sendMagicLink}>
            Send magic link
          </button>
          {sent && <div className="subtle">Check your email for the link.</div>}
        </div>
      </div>
    );
  }

  // Signed in → profile form + Spotify connect
  return (
    <div className="space-y-4">
      <h1 className="h1">Your Profile</h1>

      <div className="card p-4 space-y-3">
        <div className="subtle">Signed in as</div>
        <div className="font-medium">{sessionEmail}</div>

        <label className="block">
          <span className="subtle">Full name</span>
          <input
            className="input mt-1"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
          />
        </label>

        <div className="flex gap-2 pt-1">
          <button className="btn-primary flex-1" onClick={saveProfile}>Save</button>
          <button className="btn-ghost flex-1" onClick={signOut}>Sign out</button>
        </div>
      </div>

      {/* Connect Spotify button */}
      <button
        className="btn-ghost w-full"
        onClick={async () => {
          if (!supabaseConfigured) {
            alert('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
            return;
          }
          await supabase.auth.signInWithOAuth({
            provider: 'spotify',
            options: {
              redirectTo:
                typeof window !== 'undefined'
                  ? `${window.location.origin.replace('localhost', '127.0.0.1')}/profile`
                  : undefined,
              scopes: 'playlist-modify-public playlist-modify-private user-read-email',
            },
          });
        }}
      >
        Connect Spotify
      </button>
    </div>
  );
}
