import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { CheckCircle2, MapPin } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { OSStateView } from '@/components/layout/OSStateView';

interface ActivityTimelineProps {
  activities: any[];
  isLoading?: boolean;
}

export function ActivityTimeline({ activities, isLoading }: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="bg-layer1 border border-white/5 rounded-3xl p-8 h-[400px] lg:h-[500px] animate-pulse flex flex-col gap-8">
        <div className="h-8 bg-white/5 rounded-lg w-1/2" />
        <div className="flex-1 space-y-4">
          <div className="h-24 bg-white/5 rounded-xl w-full" />
          <div className="h-24 bg-white/5 rounded-xl w-full" />
          <div className="h-24 bg-white/5 rounded-xl w-full" />
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-layer1 border border-white/5 rounded-3xl h-[400px] lg:h-[500px] flex items-center justify-center p-4">
        <OSStateView
          type="empty"
          title="No Recent Activity"
          description="Your infrastructure log is quiet. Issues reported in your ward will appear here."
        />
      </div>
    );
  }

  return (
    <div className="bg-layer1 border border-white/10 rounded-3xl p-8 relative overflow-hidden h-[400px] lg:h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-1">Recent Activity</h2>
          <p className="text-sm text-text-secondary">Latest infrastructure updates</p>
        </div>
      </div>

      <div className="relative pl-6 border-l border-white/10 space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
        {activities.map((activity: any, i: number) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.5, ease: 'easeOut' }}
            className="relative group block"
          >
            {/* Timeline node */}
            <div
              className={`absolute -left-[33px] p-1.5 rounded-full border border-layer1 bg-layer2 ${activity.status === 'resolved' ? 'text-success' : 'text-primary'}`}
            >
              {activity.status === 'resolved' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
            </div>

            <Link
              href={`/issue/${activity.id || activity._id}`}
              aria-label={`View issue: ${activity.title}. Status: ${activity.status}. Reported ${formatDistanceToNow(new Date(activity.createdAt))} ago`}
              className="block bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/[0.07] transition-colors hover:border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs font-mono text-text-tertiary">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </div>
                <div
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                    activity.status === 'resolved'
                      ? 'bg-success/20 text-success'
                      : 'bg-primary/20 text-primary-light'
                  }`}
                >
                  {activity.status}
                </div>
              </div>

              <h4 className="text-base font-bold text-white mb-3 line-clamp-1 group-hover:text-primary-light transition-colors">
                {activity.title}
              </h4>

              <div className="flex gap-3">
                <span className="text-xs font-medium text-text-secondary bg-black/20 px-2.5 py-1 rounded-lg border border-white/5">
                  {activity.category}
                </span>
                <span className="text-xs font-medium text-text-secondary bg-black/20 px-2.5 py-1 rounded-lg border border-white/5">
                  {activity.votes} Votes
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
