'use client';

import { supabase } from '@/lib/supabaseClient';
import { LogIn, LogOut, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AuthModal() {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMagicLink, setIsMagicLink] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Handle ESC key dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err: any) {
      setMessage({ text: err.message || 'Google Auth failed', isError: true });
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setMessage({ text: 'Magic login link sent to your email!' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setIsOpen(false);
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Authentication failed', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border-2 border-[var(--border-color)] rounded-full text-xs font-bold text-slate-800 dark:text-white shadow-[2px_2px_0px_0px_var(--border-color)]">
          <User className="w-4 h-4 text-blue-600" />
          <span className="truncate max-w-[120px]">{user.email}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 bento-button bg-[#FECDD3] text-black hover:-translate-y-0.5"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 bento-button bg-[#E0F2FE] text-black text-sm hover:-translate-y-0.5"
      >
        <LogIn className="w-4 h-4" />
        <span>Sign In</span>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bento-card p-6 max-w-sm w-full relative bg-white dark:bg-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(226,232,240,1)] m-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-500 hover:text-black dark:hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 pr-6">
              Sign In to LoanTracker Pro
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">
              Sync your loan portfolios everywhere.
            </p>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 bg-white text-black font-bold text-sm flex items-center justify-center gap-2 mb-4 bento-button hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            <div className="flex items-center gap-3 my-4 text-xs font-bold text-slate-400">
              <div className="flex-1 h-0.5 bg-[var(--border-color)] opacity-20" />
              <span>OR EMAIL LINK</span>
              <div className="flex-1 h-0.5 bg-[var(--border-color)] opacity-20" />
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm font-bold mb-4 border-2 ${
                  message.isError
                    ? 'bg-rose-100 border-rose-500 text-rose-700'
                    : 'bg-emerald-100 border-emerald-500 text-emerald-700'
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-lg text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-[2px_2px_0px_0px_var(--border-color)]"
                  placeholder="name@example.com"
                />
              </div>

              {!isMagicLink && (
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-lg text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-[2px_2px_0px_0px_var(--border-color)]"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#A7F3D0] text-black text-sm bento-button hover:-translate-y-0.5"
              >
                {loading ? 'Processing...' : isMagicLink ? 'Send Magic Link' : 'Sign In'}
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                onClick={() => setIsMagicLink(!isMagicLink)}
                className="text-sm font-bold text-slate-500 hover:text-black dark:hover:text-white transition"
              >
                {isMagicLink ? 'Use password instead' : 'Use magic link instead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
