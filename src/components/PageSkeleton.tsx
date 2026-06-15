import React from 'react';

interface PageSkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function PageSkeleton({ className = '', children }: PageSkeletonProps) {
  return (
    <div className={`min-h-screen bg-warm-ivory ${className}`} role="status" aria-label="Loading content">
      {children || (
        <div className="animate-pulse">
          {/* Hero block */}
          <div className="h-[480px] skeleton-shimmer" aria-hidden="true" />
          
          {/* Content blocks */}
          <div className="max-w-7xl mx-auto px-4 py-section space-y-12">
            <div className="h-[240px] skeleton-shimmer rounded-none" aria-hidden="true" />
            <div className="h-[240px] skeleton-shimmer rounded-none" aria-hidden="true" />
            
            {/* Card grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[320px] skeleton-shimmer rounded-none" aria-hidden="true" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
