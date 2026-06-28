import React from 'react';

export function EditorialSection({
  title,
  children,
  rightContent,
}: {
  title: string;
  children: React.ReactNode;
  rightContent?: React.ReactNode;
}) {
  return (
    <section className="py-16 relative z-10 border-t border-border bg-gradient-to-b from-layer1/30 to-bg">
      <div className="max-w-container-max mx-auto px-4 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-white tracking-tight">
            {title}
          </h2>
          {rightContent}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {children}
        </div>
      </div>
    </section>
  );
}
