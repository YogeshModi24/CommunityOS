'use client';

import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

export interface StatusEntry {
  status: string;
  note?: string;
  timestamp: string;
}

export function StatusTimeline({ history }: { history: StatusEntry[] }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="space-y-8 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-border">
      {history.map((event, i) => (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          key={i}
          className="flex items-start gap-6 relative z-10 group"
        >
          <div className="w-10 h-10 rounded-full bg-layer1 border-4 border-layer1 flex items-center justify-center shrink-0 mt-1 shadow-sm">
            <div
              className={`w-full h-full rounded-full border-2 ${
                event.status === 'open'
                  ? 'bg-citizen border-citizen shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                  : event.status === 'resolved'
                    ? 'bg-resolved border-resolved shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                    : 'bg-amber-500 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
              }`}
            />
          </div>
          <div className="pt-2 bg-layer2 p-6 rounded-2xl border border-border w-full group-hover:border-white/20 transition-colors shadow-inner">
            <div className="text-base font-bold text-white mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="capitalize text-lg">{event.status.replace('_', ' ')}</span>
              <span className="text-xs font-mono font-bold text-text-tertiary tracking-widest uppercase">
                {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
              </span>
            </div>
            {event.note && (
              <div className="text-sm text-text-secondary leading-relaxed">{event.note}</div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
