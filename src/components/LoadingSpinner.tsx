/**
 * Minimal loading spinner for Suspense fallback and async operations.
 * Matches the light-luxury brand palette (#c4a093 accent, #2d2926 text).
 */
export default function LoadingSpinner({ size = 32 }: { size?: number }) {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-3"
      role="status"
      aria-label="Loading"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        className="animate-spin"
        aria-hidden="true"
      >
        <circle
          cx="16"
          cy="16"
          r="14"
          stroke="#e8e0d8"
          strokeWidth={3}
        />
        <path
          d="M16 2a14 14 0 0 1 14 14"
          stroke="#c4a093"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
        Loading
      </span>
    </div>
  );
}
