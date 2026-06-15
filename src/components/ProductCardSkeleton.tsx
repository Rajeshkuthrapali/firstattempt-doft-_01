

interface ProductCardSkeletonProps {
  className?: string;
}

export function ProductCardSkeleton({ className = '' }: ProductCardSkeletonProps) {
  return (
    <div className={className} aria-hidden="true">
      {/* Image placeholder — 3:4 aspect ratio */}
      <div className="aspect-[3/4] w-full skeleton-shimmer" />
      
      {/* Text placeholders */}
      <div className="pt-4 space-y-2">
        <div className="h-4 w-[70%] skeleton-shimmer rounded-none" />
        <div className="h-3.5 w-[40%] skeleton-shimmer rounded-none" />
        <div className="h-4 w-[30%] skeleton-shimmer rounded-none" />
      </div>
    </div>
  );
}
