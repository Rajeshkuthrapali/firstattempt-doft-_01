import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React error boundary that catches render-phase errors and shows a
 * clean fallback UI. Optionally accepts a custom fallback and an
 * `onError` callback for logging to analytics / Sentry.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
    // Fallback console logging when no handler is provided
    if (!this.props.onError) {
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center" role="alert">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="24" cy="24" r="22" stroke="#c4a093" strokeWidth={2} />
            <path
              d="M24 16v10M24 30v2"
              stroke="#c4a093"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </svg>
          <h2 className="font-['Cormorant_Garamond',serif] text-[24px] text-[#2d2926]">
            Something went wrong
          </h2>
          <p className="max-w-md text-[14px] text-[#9a8d82]">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="border border-[#c4a093] px-6 py-2.5 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#c4a093] transition-all hover:bg-[#c4a093] hover:text-white"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
