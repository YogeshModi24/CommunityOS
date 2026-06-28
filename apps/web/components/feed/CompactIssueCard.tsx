import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { CategoryBadge, StatusBadge } from '@/components/ui/primitives';

interface CompactIssueCardProps {
  issue: any;
  layout?: 'horizontal' | 'vertical';
  href: string;
}

const MotionLink = motion(Link);

export function CompactIssueCard({ issue, layout = 'vertical', href }: CompactIssueCardProps) {
  const hasImage = issue.media && issue.media.length > 0;
  const confidence = issue.ai_confidence || 85;
  const isCritical = confidence > 90 && issue.status !== 'resolved';

  const isHorizontal = layout === 'horizontal';
  const ariaLabel = `${issue.title}. Status ${issue.status}. ${issue.votes} votes. Reported ${formatDistanceToNow(new Date(issue.createdAt))} ago.`;

  return (
    <MotionLink
      href={href}
      layout
      aria-label={ariaLabel}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-layer1 transition-all duration-300 cursor-pointer flex focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen focus-visible:ring-offset-2 focus-visible:ring-offset-bg motion-safe:hover:border-white/20 ${
        isHorizontal ? 'flex-row h-32' : 'flex-col h-full'
      }`}
    >
      {/* Thumbnail */}
      <div className={`relative shrink-0 ${isHorizontal ? 'w-32 h-full' : 'w-full h-32'}`}>
        {hasImage ? (
          <Image
            src={issue.media[0].optimizedUrl || issue.media[0].url}
            alt={issue.title}
            fill
            className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-layer2 flex items-center justify-center">
            <span aria-hidden="true" className="material-symbols-outlined text-[32px] text-white/5">
              landscape
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-layer1 to-transparent opacity-80" />
      </div>

      {/* Content */}
      <div className={`flex flex-col flex-1 ${isHorizontal ? 'p-4 justify-center' : 'p-4'}`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap gap-1.5 items-center">
            <StatusBadge status={issue.status} />
            <CategoryBadge category={issue.category} />
          </div>
          {isCritical && (
            <div className="px-2 py-0.5 bg-rose-500/20 text-rose-500 text-[10px] font-bold uppercase tracking-widest rounded flex-shrink-0">
              Critical
            </div>
          )}
        </div>

        <h3 className="font-display font-semibold text-white text-base leading-tight mb-1 line-clamp-2 motion-safe:group-hover:text-citizen transition-colors">
          {issue.title}
        </h3>

        {!isHorizontal && (
          <p className="text-sm text-text-secondary line-clamp-2 leading-snug mb-3 flex-1">
            {issue.description || issue.ai_description || 'No description provided.'}
          </p>
        )}

        <div
          className={`mt-auto flex items-center justify-between border-white/5 ${isHorizontal ? '' : 'pt-3 border-t'}`}
        >
          <div className="text-xs font-mono text-text-tertiary flex items-center gap-1.5">
            <span aria-hidden="true" className="material-symbols-outlined text-[12px]">
              schedule
            </span>
            {formatDistanceToNow(new Date(issue.createdAt))} ago
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-white bg-white/5 px-2 py-1 rounded-md">
            <span aria-hidden="true" className="material-symbols-outlined text-[14px]">
              thumb_up
            </span>
            {issue.votes}
          </div>
        </div>
      </div>
    </MotionLink>
  );
}
