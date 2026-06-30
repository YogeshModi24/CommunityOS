'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center font-body relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full bg-layer1/60 backdrop-blur-2xl border border-white/10 p-8 rounded-[32px] shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-6 shadow-inner">
          <span className="material-symbols-outlined text-[32px]">warning</span>
        </div>

        <h2 className="text-2xl font-display font-bold text-white mb-3">Application Error</h2>

        <p className="text-sm text-text-secondary leading-relaxed mb-6 font-light">
          An unexpected error occurred within CommunityOS. The telemetry feed reported:
        </p>

        <div className="bg-black/30 border border-white/5 p-4 rounded-xl font-mono text-xs text-rose-400 text-left mb-8 overflow-x-auto select-all max-h-32 custom-scrollbar">
          {error.message || 'Unknown runtime exception'}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-3 rounded-xl bg-white text-bg font-bold text-sm transition-all hover:bg-gray-100 active:scale-95 shadow-lg"
          >
            Reload Platform
          </button>
          <button
            onClick={() => reset()}
            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-sm transition-all active:scale-95"
          >
            Attempt Recovery
          </button>
        </div>
      </div>
    </div>
  );
}
