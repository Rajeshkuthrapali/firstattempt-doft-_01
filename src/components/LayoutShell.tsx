import { useEffect, useRef, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Nav from "./Nav";
import CartDrawer from "./CartDrawer";
import SearchBar from "./search/SearchBar";
import QuickViewModal from "./QuickViewModal";
import { pageEnter, initScrollAnimations } from "../lib/animations";
import { ToastContainer } from "./ToastContainer";

/**
 * Root layout shell — warm cream background, clean footer
 * with brand info, quick links, and newsletter signup.
 * Light, airy, feminine luxury aesthetic.
 *
 * Animations:
 *  - Page enter fade-up on route change
 *  - Scroll-triggered fade-up / stagger for sections
 */
export default function LayoutShell() {
  const mainRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  /* ── Newsletter state ──────────────────── */
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  async function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || subscribing) return;

    setSubscribing(true);
    try {
      const { api } = await import("../lib/api/client");
      await api.post("/api/newsletter", { email });
      setSubscribed(true);
      setEmail("");
    } catch {
      // Silently fail — don't disrupt the user experience
      console.warn("Newsletter signup failed");
    } finally {
      setSubscribing(false);
    }
  }

  /* ── Page enter animation ─────────────── */
  useEffect(() => {
    if (mainRef.current) {
      const tween = pageEnter(mainRef.current);
      return () => {
        // Kill the tween and revert to pre-GSAP state on unmount
        if (tween) tween.revert();
      };
    }
  }, [location.pathname]);

  /* ── Scroll-triggered animations ───────── */
  useEffect(() => {
    const cleanup = initScrollAnimations();
    return cleanup;
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-soft-cream text-ink font-['Inter',sans-serif]">
      {/* Skip-to-content link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Nav />
      <CartDrawer />
      <SearchBar />
      <QuickViewModal />

      {/* Page content offset for fixed nav + announcement bar */}
      <main className="pt-[108px]" id="main-content" role="main" ref={mainRef}>
        <Outlet />
      </main>

      {/* ── Footer ───────────────────────────── */}
      <footer className="border-t border-hairline bg-warm-sand" role="contentinfo">
        <div className="mx-auto max-w-7xl px-8">
          {/* ── Row 1: Brand Statement ──────────────── */}
          <div className="pt-section pb-subsection text-center md:text-left" data-animate="fade-up">
            <Link to="/" className="inline-block">
              <span className="font-heading text-[28px] font-semibold tracking-normal text-ink">
                Lumière
              </span>
            </Link>
            <p className="mt-4 body text-muted leading-relaxed max-w-lg mx-auto md:mx-0">
              Light, responsibly — handcrafted in Jaipur since 2024
            </p>
            <div className="mt-8 h-px w-16 bg-brass-gold mx-auto md:mx-0" />
          </div>

          {/* ── Row 2: Editorial Grid ───────────────── */}
          <div className="grid grid-cols-1 gap-16 md:grid-cols-12 pb-subsection" data-animate="stagger">
            {/* ── Column 1: The Lumière World (5 cols) ── */}
            <div className="md:col-span-5" data-animate-child>
              <h4 className="micro uppercase tracking-[0.2em] text-muted mb-6">
                Our World
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "The Art of Candlemaking", to: "/journal/the-art-of-candlemaking" },
                  { label: "Our Fragrance Philosophy", to: "/journal/fragrance-philosophy" },
                  { label: "Behind the Atelier", to: "/journal/behind-the-atelier" },
                  { label: "Sustainability & Craft", to: "/about" },
                  { label: "Press & Features", to: "/about#press" },
                ].map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="body text-dark hover:text-brass-gold transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Column 2: Explore (3 cols) ── */}
            <div className="md:col-span-3" data-animate-child>
              <h4 className="micro uppercase tracking-[0.2em] text-muted mb-6">
                Discover
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "All Products", to: "/collections" },
                  { label: "Signature Collection", to: "/collections?collection=signature" },
                  { label: "Seasonal", to: "/collections?collection=seasonal" },
                  { label: "Limited Edition", to: "/collections?collection=limited" },
                  { label: "New Arrivals", to: "/collections?sort=newest" },
                  { label: "Gift Sets", to: "/collections?collection=gifts" },
                ].map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="body text-dark hover:text-brass-gold transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Column 3: Support + Connect (4 cols) ── */}
            <div className="md:col-span-4" data-animate-child>
              <h4 className="micro uppercase tracking-[0.2em] text-muted mb-6">
                Support
              </h4>
              <ul className="space-y-3 mb-10">
                {[
                  { label: "Contact Us", to: "/contact" },
                  { label: "Shipping & Returns", to: "/policy/shipping" },
                  { label: "FAQ", to: "/policy/faq" },
                  { label: "Privacy Policy", to: "/policy/privacy" },
                  { label: "Terms of Service", to: "/policy/terms" },
                ].map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="body text-dark hover:text-brass-gold transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Connect — social icons */}
              <h4 className="micro uppercase tracking-[0.2em] text-muted mb-4">
                Connect
              </h4>
              <div className="flex gap-4 mb-10">
                {[
                  { label: "Instagram", url: "https://www.instagram.com/lumiere/" },
                  { label: "Facebook", url: "https://www.facebook.com/lumiere/" },
                  { label: "Pinterest", url: "https://pinterest.com/lumiere/" },
                  { label: "Spotify", url: "https://open.spotify.com/user/lumiere/" },
                ].map(({ label, url }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-brass-gold transition-colors"
                    aria-label={label}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      {label === "Instagram" ? (
                        <>
                          <rect x="2" y="2" width="20" height="20" rx="5" />
                          <circle cx="12" cy="12" r="5" />
                          <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
                        </>
                      ) : label === "Facebook" ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2Z" />
                      ) : label === "Pinterest" ? (
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.087-.791-.167-2.005.035-2.868.182-.78 1.172-4.971 1.172-4.971s-.299-.599-.299-1.484c0-1.39.806-2.428 1.809-2.428.853 0 1.265.641 1.265 1.409 0 .858-.546 2.141-.828 3.33-.236.995.5 1.807 1.48 1.807 1.776 0 3.142-1.873 3.142-4.577 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.134-4.515 4.34 0 .859.331 1.78.744 2.282a.3.3 0 0 1 .069.288c-.076.316-.245.995-.278 1.135-.044.183-.145.222-.335.134-1.249-.582-2.03-2.408-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.779 0 3.449-2.174 6.226-5.19 6.226-1.013 0-1.965-.527-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.622.936.29 1.931.446 2.96.446 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                      ) : (
                        <>
                          <circle cx="12" cy="12" r="10" />
                          <path d="M8 16c2.5-1.5 5.5-1.5 8 0" />
                          <path d="M9 13c2-1 4-1 6 0" />
                          <path d="M10 10c1.5-.8 3-.8 4.5 0" strokeLinecap="round" />
                        </>
                      )}
                    </svg>
                  </a>
                ))}
              </div>

              {/* Newsletter — compact, editorial */}
              <div>
                {subscribed ? (
                  <p className="body-small text-brass-gold italic">
                    You're on the list. Thank you.
                  </p>
                ) : (
                  <form
                    onSubmit={handleSubscribe}
                    className="flex border border-hairline bg-white focus-within:border-brass-gold transition-colors"
                    aria-label="Newsletter signup"
                  >
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      className="flex-1 px-4 py-3 body-small text-ink placeholder:text-light outline-none bg-transparent"
                      aria-label="Email address"
                      disabled={subscribing}
                    />
                    <button
                      type="submit"
                      disabled={subscribing || !email}
                      className="px-6 py-3 bg-ink caption text-ivory hover:bg-brass-gold transition-colors disabled:opacity-50"
                    >
                      {subscribing ? "Sending\u2026" : "Subscribe"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────── */}
        <div className="border-t border-hairline">
          <div className="mx-auto max-w-7xl px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="tiny text-light tracking-[0.12em]">
              © {new Date().getFullYear()} Lumière. All rights reserved.
            </p>
            <p className="tiny text-muted tracking-[0.12em]">
              Made in Jaipur, India
            </p>
          </div>
        </div>
      </footer>
      <ToastContainer />
    </div>
  );
}
