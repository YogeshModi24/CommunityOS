import { Activity } from 'lucide-react';
import React from 'react';

import { GlassCard } from '../ui/GlassCard';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <GlassCard
      intensity="low"
      className="p-12 flex flex-col items-center justify-center text-center border-dashed"
    >
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-text-muted">
        {icon || <Activity className="w-8 h-8" />}
      </div>
      <h3 className="text-xl font-display font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary max-w-sm">{description}</p>
    </GlassCard>
  );
}
