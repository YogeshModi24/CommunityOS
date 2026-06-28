import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { Avatar, CategoryBadge, StatusBadge } from '@/components/ui/primitives';

interface SpotlightCardProps {
  issue: any;
  featured?: boolean;
  href: string;
}

const MotionLink = motion(Link);

export function SpotlightCard({ issue, featured = false, href }: SpotlightCardProps) {
  const hasImage = issue.media && issue.media.length > 0;
  const confidence = issue.ai_confidence || 85;
  const severityLevel = confidence > 90 ? 'critical' : confidence > 70 ? 'high' : 'medium';

  const ariaLabel = `${issue.title}. Status ${issue.status}. ${issue.votes} votes. Reported ${formatDistanceToNow(new Date(issue.createdAt))} ago.`;

  return (
    <MotionLink
      href={href}
      layout
      aria-label={ariaLabel}
      className={`group relative overflow-hidden rounded-[32px] border border-white/10 bg-layer1 transition-all duration-500 cursor-pointer block focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen focus-visible:ring-offset-2 focus-visible:ring-offset-bg motion-safe:hover:border-white/20 ${
        featured ? 'md:col-span-2 lg:col-span-3 min-h-[500px]' : 'min-h-[400px]'
      }`}
    >
      {/* Background Image & Gradient */}
      <div className="absolute inset-0 z-0">
        {hasImage ? (
          <Image
            src={issue.media[0].optimizedUrl || issue.media[0].url}
            alt={issue.title}
            fill
            className="object-cover transition-transform duration-1000 motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-layer2 to-layer1 flex items-center justify-center opacity-50">
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[100px] text-white/5"
            >
              landscape
            </span>
          </div>
        )}
        <div
          className={`absolute inset-0 ${featured ? 'bg-gradient-to-t from-bg via-bg/80 to-transparent' : 'bg-gradient-to-t from-bg via-bg/60 to-transparent'}`}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full p-8 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex gap-2">
            <StatusBadge status={issue.status} />
            <CategoryBadge category={issue.category} />
          </div>
          {severityLevel === 'critical' && issue.status !== 'resolved' && (
            <div className="px-3 py-1 bg-rose-500/20 text-rose-500 text-xs font-bold uppercase tracking-widest rounded-full border border-rose-500/30 backdrop-blur-md animate-pulse">
              Critical
            </div>
          )}
        </div>

        <div className="mt-auto max-w-3xl">
          <div className="text-sm font-mono text-text-tertiary mb-3 flex items-center gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-[14px]">
              schedule
            </span>
            {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
          </div>

          <h3
            className={`${featured ? 'text-4xl lg:text-5xl' : 'text-2xl'} font-display font-bold text-white mb-4 line-clamp-2 tracking-tight transition-colors leading-tight motion-safe:group-hover:text-citizen`}
          >
            {issue.title}
          </h3>

          {featured && (
            <p className="text-lg text-text-secondary mb-6 line-clamp-2 leading-relaxed">
              {issue.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <div className="flex items-center gap-4">
              <Avatar
                name={typeof issue.reporter_id === 'object' ? issue.reporter_id.name : 'Citizen'}
                size={featured ? 40 : 32}
              />
              <div>
                <div className="text-sm font-bold text-white">
                  {typeof issue.reporter_id === 'object' ? issue.reporter_id.name : 'Citizen'}
                </div>
                <div className="text-xs text-text-tertiary uppercase tracking-wider">
                  {issue.ward || 'City Resident'}
                </div>
              </div>
            </div>

            <button
              tabIndex={-1}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white transition-all text-sm font-bold backdrop-blur-md motion-safe:hover:bg-citizen motion-safe:hover:border-citizen"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                thumb_up
              </span>
              {issue.votes}
            </button>
          </div>
        </div>
      </div>
    </MotionLink>
  );
}
