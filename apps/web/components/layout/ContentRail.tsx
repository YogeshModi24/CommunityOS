import React from 'react';

interface ContentRailProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function ContentRail({ title, subtitle, children }: ContentRailProps) {
  return (
    <section className="py-12 relative z-10">
      <div className="mb-8 flex items-end justify-between px-4 lg:px-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-2 tracking-tight">
            {title}
          </h2>
          {subtitle && <p className="text-text-secondary text-sm">{subtitle}</p>}
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-white hover:bg-layer2 transition-all">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-white hover:bg-layer2 transition-all">
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Area */}
      <div className="flex gap-6 overflow-x-auto hide-scrollbar px-4 lg:px-8 pb-8 snap-x snap-mandatory">
        {children}
      </div>
    </section>
  );
}
