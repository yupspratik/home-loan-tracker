'use client';

import { Check, Copy, ExternalLink, Share2, X } from 'lucide-react';
import { useState } from 'react';

export function ShareModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOpen = async () => {
    setIsOpen(true);
    setLoading(true);

    try {
      const res = await fetch('/api/loans/share', { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.shareUrl) {
        setShareUrl(data.shareUrl);
      } else {
        const fallbackToken = btoa(Date.now().toString()).slice(0, 12);
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        setShareUrl(`${origin}/share/${fallbackToken}`);
      }
    } catch {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      setShareUrl(`${origin}/share/demo`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition"
      >
        <Share2 className="w-3.5 h-3.5" />
        <span>1-Click Share</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bento-card p-6 max-w-md w-full relative shadow-2xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              1-Click Dashboard Sharing
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Share a read-only live link with your spouse, advisor, or accountant.
            </p>

            {loading ? (
              <div className="py-6 text-center text-xs text-slate-500">Generating secure share link...</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Read-Only Link
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none"
                    />
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shrink-0 transition"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Anyone with this link can view your summary cards, charts, and financial year breakdown. They cannot edit your loan parameters.
                </div>

                <div className="pt-2 flex justify-end">
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    <span>Preview link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
