import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useToastStore } from '../stores/toast';
import type { Toast } from '../stores/toast';

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Slide in from right
    gsap.fromTo(
      el,
      { x: 120, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }
    );

    // Cleanup: slide out on unmount
    return () => {
      gsap.to(el, {
        x: 120,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      });
    };
  }, []);

  const accentBorderMap = {
    success: 'border-l-success',
    error: 'border-l-error',
    info: 'border-l-brass-gold',
  };

  const borderClass = accentBorderMap[toast.type];

  return (
    <div
      ref={ref}
      className={`bg-white border-l-[3px] ${borderClass} shadow-elevated w-[360px] p-4 pointer-events-auto`}
      role="alert"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink">{toast.title}</p>
          {toast.description && (
            <p className="text-xs text-dark mt-0.5">{toast.description}</p>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-brass-gold hover:text-pale-gold transition-colors"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="shrink-0 text-light hover:text-ink transition-colors"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
