import { Outlet, Link } from "react-router-dom";
import Nav from "./Nav";
import CartDrawer from "./CartDrawer";

/**
 * Root layout shell — warm cream background, clean footer
 * with brand info, quick links, and newsletter signup.
 * Light, airy, feminine luxury aesthetic.
 */
export default function LayoutShell() {
  return (
    <div className="min-h-screen bg-[#faf7f4] text-[#2d2926] font-['Inter',sans-serif]">
      {/* Skip-to-content link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Nav />
      <CartDrawer />

      {/* Page content offset for fixed nav + announcement bar */}
      <main className="pt-[108px]" id="main-content" role="main">
        <Outlet />
      </main>

      {/* ── Footer ───────────────────────────── */}
      <footer className="bg-[#f3ece4] border-t border-[#e8e0d8]" role="contentinfo">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link to="/" className="inline-block">
                <span className="font-['Cormorant_Garamond',serif] text-[28px] font-semibold tracking-[0.15em] text-[#2d2926]">
                  LUMIÈRE
                </span>
              </Link>
              <p className="mt-3 text-[13px] leading-relaxed text-[#6b5e54]">
                Handcrafted luxury scented candles. 100% natural soy wax,
                clean burning so you can light your candle responsibly.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a8d82] mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                {["Shop All", "Bestsellers", "New Arrivals", "Gift Sets"].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-[13px] text-[#6b5e54] hover:text-[#c4a093] transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a8d82] mb-4">
                Support
              </h4>
              <ul className="space-y-2.5">
                {["Shipping & Returns", "FAQ", "Contact Us", "Privacy Policy"].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-[13px] text-[#6b5e54] hover:text-[#c4a093] transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a8d82] mb-4">
                Stay in Touch
              </h4>
              <p className="text-[13px] text-[#6b5e54] mb-4">
                Subscribe for early access, new launches & exclusive offers.
              </p>
              <form
                className="flex"
                onSubmit={(e) => e.preventDefault()}
                aria-label="Newsletter signup"
              >
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 border border-[#e8e0d8] bg-white px-3 py-2.5 text-[12px] text-[#2d2926] placeholder:text-[#9a8d82] outline-none focus:border-[#c4a093] transition-colors rounded-l-sm"
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  className="bg-[#c4a093] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white hover:bg-[#a8877b] transition-colors rounded-r-sm"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 border-t border-[#e8e0d8] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-[#9a8d82]">
              © {new Date().getFullYear()} Lumière. All rights reserved.
            </p>
            <div className="flex gap-5">
              {/* Social icons */}
              {[
                { label: "Instagram", path: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" },
                { label: "Facebook", path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2Z" },
              ].map(({ label, path }) => (
                <a
                  key={label}
                  href="#"
                  className="text-[#9a8d82] hover:text-[#c4a093] transition-colors"
                  aria-label={label}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
