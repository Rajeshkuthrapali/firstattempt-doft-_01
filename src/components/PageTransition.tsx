import { useEffect, useRef } from "react";
import { pageEnter } from "../lib/animations";

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Subtle fade-up page enter animation on mount.
 * Consistent with the layout-level pageEnter in LayoutShell.
 */
export default function PageTransition({ children }: PageTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const tween = pageEnter(ref.current);
      return () => {
        if (tween && typeof tween.revert === "function") {
          tween.revert();
        }
      };
    }
  }, []);

  return <div ref={ref}>{children}</div>;
}
