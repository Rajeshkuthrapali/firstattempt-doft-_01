import { Link, useLocation } from "react-router-dom";
import { useUiStore } from "../stores/ui";
import { useCartStore } from "../stores/cart";
import { useAuthStore } from "../stores/auth";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/collections", label: "Shop" },
  { to: "/search", label: "Search" },
  { to: "/about", label: "Our Story" },
  { to: "/contact", label: "Contact" },
] as const;

/**
 * Top navigation bar — light luxury aesthetic.
 * Clean, minimal, warm cream background with dusty-rose accents.
 * Includes brand wordmark, desktop links, cart icon with badge,
 * search icon, and a mobile hamburger.
 */
export default function Nav() {
  const { pathname } = useLocation();
  const { navOpen, toggleNav, closeNav, toggleSearch, toggleCart } =
    useUiStore();
  const totalQty = useCartStore((s) => s.totalQty());
  const user = useAuthStore((s) => s.user);

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 bg-[#faf7f4]/95 backdrop-blur-md border-b border-[#e8e0d8] transition-shadow duration-300"
      role="banner"
    >
      {/* ── Announcement bar ─────────────────── */}
      <div className="bg-[#c4a093] py-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
        Free Shipping on Orders Above{" "}
        <span className="font-bold">INR 3000/-</span>
      </div>

      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8"
        aria-label="Main navigation"
      >
        {/* ── Mobile hamburger (left) ────────── */}
        <button
          id="nav-toggle"
          onClick={toggleNav}
          className="md:hidden p-1 text-[#2d2926] hover:text-[#c4a093] transition-colors"
          aria-label={navOpen ? "Close menu" : "Open menu"}
          {...{ "aria-expanded": navOpen }}
        >
          {navOpen ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* ── Desktop links (left) ───────────── */}
        <ul className="hidden md:flex items-center gap-7" role="menubar">
          {navLinks.map(({ to, label }) => (
            <li key={to} role="menuitem">
              <Link
                to={to}
                className={`text-[13px] tracking-[0.08em] uppercase transition-colors duration-200 ${
                  pathname === to
                    ? "text-[#c4a093] font-medium"
                    : "text-[#6b5e54] hover:text-[#2d2926]"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Brand (center) ─────────────────── */}
        <Link
          to="/"
          onClick={closeNav}
          className="absolute left-1/2 -translate-x-1/2 text-center"
          aria-label="Lumière home"
        >
          <span className="font-['Cormorant_Garamond',serif] text-[28px] md:text-[32px] font-semibold tracking-[0.15em] text-[#2d2926] select-none">
            LUMIÈRE
          </span>
        </Link>

        {/* ── Right actions ──────────────────── */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <button
            onClick={toggleSearch}
            className="hidden md:block p-1 text-[#6b5e54] hover:text-[#2d2926] transition-colors"
            aria-label="Open search"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* Account */}
          <Link
            to={user ? "/account" : "/auth"}
            className="hidden md:block p-1 text-[#6b5e54] hover:text-[#2d2926] transition-colors"
            aria-label={user ? `Account: ${user.name}` : "Sign in"}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <circle cx="12" cy="8" r="4" />
              <path strokeLinecap="round" d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
            </svg>
          </Link>

          {/* Cart */}
          <button
            id="cart-toggle"
            onClick={toggleCart}
            className="relative p-1 text-[#6b5e54] hover:text-[#2d2926] transition-colors"
            aria-label={`Open cart, ${totalQty} items`}
          >
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
              />
            </svg>

            {totalQty > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#c4a093] text-[10px] font-bold text-white">
                {totalQty}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ────────────────────── */}
      <div
        className={`md:hidden overflow-hidden border-t border-[#e8e0d8] bg-[#faf7f4] transition-all duration-300 ease-in-out ${
          navOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0 border-t-0"
        }`}
      >
        <ul role="menu" className="flex flex-col gap-1 px-6 py-4">
          {navLinks.map(({ to, label }) => (
            <li key={to} role="menuitem">
              <Link
                to={to}
                onClick={closeNav}
                className={`block py-2.5 text-[14px] tracking-[0.06em] uppercase transition-colors ${
                  pathname === to
                    ? "text-[#c4a093] font-medium"
                    : "text-[#6b5e54] hover:text-[#2d2926]"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
