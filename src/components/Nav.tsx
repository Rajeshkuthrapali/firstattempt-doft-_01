import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUiStore } from "../stores/ui";
import { useCartStore } from "../stores/cart";
import { useAuthStore } from "../stores/auth";

// ── Types ──────────────────────────────────────────────

interface MegaLink {
  label: string;
  to: string;
}

interface MegaColumnLinks {
  heading: string;
  links: MegaLink[];
}

interface MegaColumnEditorial {
  image: string;
  caption: string;
  to: string;
}

type MegaColumn = MegaColumnLinks | MegaColumnEditorial;

interface NavItemWithMega {
  label: string;
  megaMenu: { columns: MegaColumn[] };
}

interface NavItemSimple {
  label: string;
  to: string;
}

type NavItem = NavItemWithMega | NavItemSimple;

function hasMega(item: NavItem): item is NavItemWithMega {
  return "megaMenu" in item;
}

function isEditorial(col: MegaColumn): col is MegaColumnEditorial {
  return "image" in col;
}

// ── Navigation data ────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    label: "Discover",
    megaMenu: {
      columns: [
        {
          heading: "Explore",
          links: [
            { label: "All Products", to: "/collections" },
            { label: "New Arrivals", to: "/collections?sort=newest" },
            { label: "Best Sellers", to: "/collections?sort=bestselling" },
            { label: "Gift Sets", to: "/collections?category=gift-sets" },
          ],
        },
        {
          heading: "Collections",
          links: [
            { label: "Signature Collection", to: "/collections?collection=signature" },
            { label: "Seasonal Collection", to: "/collections?collection=seasonal" },
            { label: "Limited Edition", to: "/collections?collection=limited" },
            { label: "Artisan Collection", to: "/collections?collection=artisan" },
          ],
        },
        {
          image: "/images/editorial/signature-collection.jpg",
          caption: "Discover the Signature Collection",
          to: "/collections?collection=signature",
        },
      ],
    },
  },
  {
    label: "Fragrances",
    megaMenu: {
      columns: [
        {
          heading: "Scent Families",
          links: [
            { label: "Warm & Spiced", to: "/collections?scent=warm" },
            { label: "Fresh & Citrus", to: "/collections?scent=fresh" },
            { label: "Woody & Earthy", to: "/collections?scent=woody" },
            { label: "Floral & Delicate", to: "/collections?scent=floral" },
            { label: "Aromatic", to: "/collections?scent=aromatic" },
          ],
        },
        {
          heading: "By Note",
          links: [
            { label: "Woody", to: "/collections?note=woody" },
            { label: "Floral", to: "/collections?note=floral" },
            { label: "Fresh", to: "/collections?note=fresh" },
            { label: "Warm", to: "/collections?note=warm" },
          ],
        },
        {
          image: "/images/editorial/fragrance-story.jpg",
          caption: "Find your signature scent",
          to: "/collections",
        },
      ],
    },
  },
  { label: "Journal", to: "/journal" },
  { label: "Our Story", to: "/about" },
  {
    label: "Gifts",
    megaMenu: {
      columns: [
        {
          heading: "Gift Ideas",
          links: [
            { label: "Gift Sets", to: "/collections?category=gift-sets" },
            { label: "Candles Under ₹500", to: "/collections?price=under-500" },
            { label: "Luxury Candles", to: "/collections?category=luxury" },
            { label: "Scent Discovery Set", to: "/collections?category=discovery" },
          ],
        },
        {
          heading: "Occasions",
          links: [
            { label: "Birthday", to: "/collections?occasion=birthday" },
            { label: "Housewarming", to: "/collections?occasion=housewarming" },
            { label: "Wedding", to: "/collections?occasion=wedding" },
            { label: "Corporate Gifting", to: "/collections?occasion=corporate" },
          ],
        },
        {
          image: "/images/editorial/gift-wrapping.jpg",
          caption: "The art of giving",
          to: "/collections?category=gift-sets",
        },
      ],
    },
  },
];

// ── Popular search suggestions ─────────────────────────

const POPULAR_SEARCHES = [
  { label: "Warm & Spiced", to: "/collections?scent=warm" },
  { label: "Fresh & Citrus", to: "/collections?scent=fresh" },
  { label: "Woody & Earthy", to: "/collections?scent=woody" },
  { label: "Signature Collection", to: "/collections?collection=signature" },
  { label: "Gift Sets", to: "/collections?category=gift-sets" },
];

// ── SVG Icon components ────────────────────────────────

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <path d="M6 6l12 12M6 18L18 6" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// ── Editorial image placeholder (for missing images) ───

function EditorialPlaceholder({ caption, to }: { caption: string; to: string }) {
  return (
    <Link
      to={to}
      className="group relative block w-full h-full min-h-[260px] bg-warm-sand overflow-hidden"
      aria-label={caption}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-warm-sand/80 via-soft-cream to-hairline" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <p className="font-heading text-xl text-white leading-tight">
          {caption}
        </p>
        <span className="inline-block mt-2 text-[11px] tracking-[0.15em] uppercase text-white/60 group-hover:text-brass-gold transition-colors">
          Explore →
        </span>
      </div>
    </Link>
  );
}

// ── Mega-menu panel ────────────────────────────────────

function MegaMenuPanel({
  item,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  item: NavItemWithMega;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <div
      className="absolute top-full left-0 right-0 bg-soft-cream border-t border-hairline shadow-elevated"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="mx-auto max-w-7xl px-8 py-14">
        <div className="flex gap-14">
          {item.megaMenu.columns.map((col, idx) => {
            if (isEditorial(col)) {
              return (
                <div key={idx} className="w-[300px] flex-shrink-0">
                  <EditorialPlaceholder caption={col.caption} to={col.to} />
                </div>
              );
            }

            return (
              <div key={idx} className="flex-1 min-w-0">
                <h4 className="micro text-muted tracking-[0.18em] mb-6">
                  {col.heading}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        onClick={onClose}
                        className="body text-dark hover:text-brass-gold transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Inline search bar (beneath nav) ────────────────────

function InlineSearchBar({
  query,
  onChange,
  onSubmit,
  onClose,
  inputRef,
}: {
  query: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="border-t border-hairline bg-soft-cream">
      <div className="mx-auto max-w-3xl px-8 py-10">
        <form onSubmit={onSubmit} className="relative">
          <label htmlFor="nav-inline-search" className="sr-only">
            Search products
          </label>
          <input
            id="nav-inline-search"
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search candles, scents, collections…"
            className="w-full bg-transparent border-b border-hairline pb-3 text-2xl font-heading text-ink placeholder:text-light outline-none focus:border-brass-gold transition-colors"
            aria-label="Search products"
            autoComplete="off"
          />
          <button
            type="submit"
            className="absolute right-0 top-1 text-muted hover:text-brass-gold transition-colors"
            aria-label="Submit search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </form>

        <div className="mt-8">
          <h4 className="micro text-muted tracking-[0.18em] mb-4">
            Popular searches
          </h4>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={onClose}
                className="px-5 py-2.5 body-small text-dark border border-hairline hover:border-brass-gold hover:text-brass-gold transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mobile sub-group (expandable nested items) ─────────

function MobileMegaGroup({ item }: { item: NavItemWithMega }) {
  const [expanded, setExpanded] = useState(false);
  const closeNav = useUiStore((s) => s.closeNav);

  return (
    <div>
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center justify-between w-full py-3 text-lg font-heading text-ink hover:text-brass-gold transition-colors"
        aria-expanded={expanded}
      >
        {item.label}
        <IconChevronDown />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pb-4 pl-4 space-y-3 border-l border-hairline ml-1">
          {item.megaMenu.columns.map((col, idx) => {
            if (isEditorial(col)) {
              return (
                <Link
                  key={idx}
                  to={col.to}
                  onClick={closeNav}
                  className="block py-2 body-small text-muted hover:text-brass-gold transition-colors italic"
                >
                  {col.caption} →
                </Link>
              );
            }

            return (
              <div key={idx} className="pt-3 first:pt-0">
                <h5 className="micro text-muted tracking-[0.15em] mb-2">
                  {col.heading}
                </h5>
                <ul className="space-y-1">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        onClick={closeNav}
                        className="block py-1.5 body-small text-dark hover:text-brass-gold transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}



// ── Main Nav Component ─────────────────────────────────

export default function Nav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { navOpen, toggleNav, closeNav, toggleCart } = useUiStore();
  const totalQty = useCartStore((s) => s.totalItems());
  const user = useAuthStore((s) => s.user);

  const [scrolled, setScrolled] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const megaTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const megaRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // ── Scroll handling ──
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Lock body scroll when mobile drawer is open ──
  useEffect(() => {
    if (navOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  // ── Close search / mega on route change ──
  useEffect(() => {
    setActiveMega(null);
    setSearchOpen(false);
    setSearchQuery("");
  }, [pathname]);

  // ── Focus search input when opened ──
  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  // ── Close mega on click outside ──
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        megaRef.current &&
        !megaRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest("[data-mega-trigger]")
      ) {
        setActiveMega(null);
      }
    }
    if (activeMega) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [activeMega]);

  // ── Close search on Escape ──
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    }
    if (searchOpen) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [searchOpen]);

  // ── Handlers ──

  function handleMegaEnter(label: string) {
    clearTimeout(megaTimeout.current);
    setSearchOpen(false);
    setActiveMega(label);
  }

  function handleMegaLeave() {
    megaTimeout.current = setTimeout(() => setActiveMega(null), 150);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setSearchOpen(false);
    setSearchQuery("");
  }

  function toggleInlineSearch() {
    setActiveMega(null);
    setSearchOpen((prev) => !prev);
  }

  function closeAll() {
    setActiveMega(null);
    setSearchOpen(false);
    setSearchQuery("");
    closeNav();
  }

  // ── Active check ──

  function isNavItemActive(item: NavItem): boolean {
    if (hasMega(item)) {
      return item.megaMenu.columns.some((col) => {
        if (isEditorial(col)) return pathname === col.to;
        return col.links.some((l) => pathname === l.to);
      });
    }
    return pathname === item.to;
  }

  // ── Resolved mega item ──

  const resolvedMegaItem =
    activeMega !== null
      ? (NAV_ITEMS.find(
          (i) => i.label === activeMega && hasMega(i),
        ) as NavItemWithMega | undefined)
      : undefined;

  // ── Split nav items for left/right of logo ──
  // Left: Discover, Fragrances | Right: Journal, Our Story, Gifts

  // ── Render ──

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-soft-cream/98 backdrop-blur-md shadow-[0_1px_0_var(--color-hairline)]"
          : "bg-soft-cream"
      }`}
      role="banner"
    >
      {/* ── Announcement bar ────────────────────────── */}
      <div
        className={`bg-ink transition-all duration-500 ease-in-out overflow-hidden ${
          scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
        }`}
      >
        <div className="py-2 text-center micro tracking-[0.2em] text-white/90">
          Complimentary shipping on orders above{" "}
          <span className="text-brass-gold font-semibold">₹3,000</span>
        </div>
      </div>

      {/* ── Utility row (hidden when scrolled) ──────── */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
        }`}
      >
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex justify-end items-center py-1.5 gap-3">
            <SearchButton
              isOpen={searchOpen}
              onClick={toggleInlineSearch}
            />
            <AccountButton />
            <WishlistButton />
            <CartBadgeButton />
          </div>
        </div>
      </div>

      {/* ── Main navigation row ─────────────────────── */}
      <nav className="relative" aria-label="Main navigation">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex items-center justify-between py-3 md:py-4">
            {/* Mobile hamburger (left) */}
            <button
              onClick={toggleNav}
              className="md:hidden p-1 -ml-1 text-ink"
              aria-label={navOpen ? "Close menu" : "Open menu"}
              aria-expanded={navOpen}
            >
              {navOpen ? <IconClose /> : <IconMenu />}
            </button>

            {/* Desktop: Left nav items */}
            <ul className="hidden md:flex items-center gap-10">
              {NAV_ITEMS.filter((_, i) => i < 2).map((item) => (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() =>
                    hasMega(item) && handleMegaEnter(item.label)
                  }
                  onMouseLeave={hasMega(item) ? handleMegaLeave : undefined}
                >
                  <NavLink item={item} />
                </li>
              ))}
            </ul>

            {/* Logo — centered */}
            <Link
              to="/"
              onClick={closeNav}
              className="absolute left-1/2 -translate-x-1/2"
              aria-label="Lumière home"
            >
              <span className="font-heading text-[26px] md:text-[28px] font-medium text-ink select-none tracking-[-0.02em]">
                Lumière
              </span>
            </Link>

            {/* Desktop: Right nav items + utility icons */}
            <div className="flex items-center">
              <ul className="hidden md:flex items-center gap-10 mr-5">
                {NAV_ITEMS.filter((_, i) => i >= 2).map((item) => (
                  <li
                    key={item.label}
                    className="relative"
                    onMouseEnter={() =>
                      hasMega(item) && handleMegaEnter(item.label)
                    }
                    onMouseLeave={
                      hasMega(item) ? handleMegaLeave : undefined
                    }
                  >
                    <NavLink item={item} />
                  </li>
                ))}
              </ul>

              {/* Utility icons — in nav row only when scrolled (desktop) */}
              <div
                className={`${
                  scrolled ? "flex" : "hidden"
                } md:flex items-center gap-1 pl-5 border-l border-hairline ml-5`}
              >
                <SearchButton
                  isOpen={searchOpen}
                  onClick={toggleInlineSearch}
                />
                <AccountButton />
                <WishlistButton />
                <CartBadgeButton />
              </div>

              {/* Mobile utility icons (always visible) */}
              <div className="flex md:hidden items-center gap-2">
                <SearchButton
                  isOpen={searchOpen}
                  onClick={toggleInlineSearch}
                />
                <CartBadgeButton />
              </div>
            </div>
          </div>
        </div>

        {/* ── Mega-menu dropdown ──────────────────── */}
        {resolvedMegaItem && (
          <div ref={megaRef} className="animate-fade-in">
            <MegaMenuPanel
              item={resolvedMegaItem}
              onClose={closeAll}
              onMouseEnter={() => clearTimeout(megaTimeout.current)}
              onMouseLeave={handleMegaLeave}
            />
          </div>
        )}
      </nav>

      {/* ── Inline search bar ───────────────────────── */}
      {searchOpen && (
        <InlineSearchBar
          query={searchQuery}
          onChange={setSearchQuery}
          onSubmit={handleSearchSubmit}
          onClose={() => {
            setSearchOpen(false);
            setSearchQuery("");
          }}
          inputRef={searchInputRef}
        />
      )}

      {/* ── Mobile full-screen drawer ──────────────── */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-500 ${
          navOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!navOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={closeNav}
          aria-hidden="true"
        />

        {/* Drawer panel */}
        <div
          className={`absolute top-0 left-0 right-0 bg-soft-cream shadow-elevated transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            navOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          {/* Search bar */}
          <div className="px-6 pt-20 pb-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.currentTarget.elements.namedItem(
                  "mobile-search",
                )) as HTMLInputElement | null;
                if (input?.value.trim()) {
                  navigate(`/search?q=${encodeURIComponent(input.value)}`);
                  closeNav();
                }
              }}
            >
              <div className="relative">
                <label htmlFor="mobile-search-input" className="sr-only">
                  Search products
                </label>
                <input
                  id="mobile-search-input"
                  name="mobile-search"
                  type="search"
                  placeholder="Search products…"
                  className="w-full bg-warm-sand border-0 py-3.5 pl-5 pr-12 body-small text-ink placeholder:text-light outline-none focus:ring-1 focus:ring-brass-gold"
                  aria-label="Search products"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted"
                  aria-label="Submit search"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          {/* Navigation items */}
          <div className="px-6 pb-4 max-h-[45vh] overflow-y-auto">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = isNavItemActive(item);
                if (hasMega(item)) {
                  return (
                    <li key={item.label}>
                      <MobileMegaGroup item={item} />
                    </li>
                  );
                }
                return (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      onClick={closeNav}
                      className={`block py-3 text-lg font-heading transition-colors ${
                        active
                          ? "text-brass-gold"
                          : "text-ink hover:text-brass-gold"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Utility links */}
          <div className="border-t border-hairline px-6 py-6">
            <div className="flex flex-col gap-4">
              <MobileUtilityLink
                to={user ? "/account" : "/auth"}
                icon={<IconUser />}
                label={user ? "My Account" : "Sign In"}
              />
              <MobileUtilityLink
                to="/account"
                icon={<IconHeart />}
                label="Wishlist"
              />
              <MobileUtilityLink
                asButton
                icon={<IconBag />}
                label={`Cart${
                  totalQty > 0 ? ` (${totalQty})` : ""
                }`}
                onClick={() => {
                  toggleCart();
                  closeNav();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ── Extracted sub-components ──────────────────────────

function NavLink({ item }: { item: NavItem }) {
  const { pathname } = useLocation();
  const { closeNav } = useUiStore();
  const active = (() => {
    if (hasMega(item)) {
      return item.megaMenu.columns.some((col) => {
        if (isEditorial(col)) return pathname === col.to;
        return col.links.some((l) => pathname === l.to);
      });
    }
    return pathname === item.to;
  })();

  const classes =
    "relative py-2 text-[13px] tracking-[0.08em] text-dark hover:text-brass-gold transition-colors duration-200";

  if (hasMega(item)) {
    return (
      <button
        data-mega-trigger={item.label}
        className={classes}
        aria-haspopup="true"
      >
        {item.label}
        {active && <ActiveDot />}
      </button>
    );
  }

  return (
    <Link to={item.to} onClick={closeNav} className={classes}>
      {item.label}
      {active && <ActiveDot />}
    </Link>
  );
}

function ActiveDot() {
  return (
    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-brass-gold rounded-full" />
  );
}

function SearchButton({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-1 text-muted hover:text-brass-gold transition-colors"
      aria-label={isOpen ? "Close search" : "Open search"}
    >
      <IconSearch />
    </button>
  );
}

function AccountButton() {
  const user = useAuthStore((s) => s.user);
  return (
    <Link
      to={user ? "/account" : "/auth"}
      className="p-1 text-muted hover:text-brass-gold transition-colors"
      aria-label={user ? `Account: ${user.name}` : "Sign in"}
    >
      <IconUser />
    </Link>
  );
}

function WishlistButton() {
  return (
    <Link
      to="/account"
      className="p-1 text-muted hover:text-brass-gold transition-colors"
      aria-label="Wishlist"
    >
      <IconHeart />
    </Link>
  );
}

function CartBadgeButton() {
  const { toggleCart } = useUiStore();
  const totalQty = useCartStore((s) => s.totalItems());
  return (
    <button
      onClick={toggleCart}
      className="relative p-1 text-muted hover:text-brass-gold transition-colors"
      aria-label={`Open cart, ${totalQty} items`}
    >
      <IconBag />
      {totalQty > 0 && (
        <span className="absolute -top-1 -right-1 flex h-[15px] w-[15px] items-center justify-center bg-brass-gold text-[8px] font-semibold text-white leading-none">
          {totalQty}
        </span>
      )}
    </button>
  );
}

function MobileUtilityLink({
  to,
  icon,
  label,
  asButton,
  onClick,
}: {
  to?: string;
  icon: React.ReactNode;
  label: string;
  asButton?: boolean;
  onClick?: () => void;
}) {
  const baseClasses =
    "flex items-center gap-3 body-small text-muted hover:text-brass-gold transition-colors";

  if (asButton) {
    return (
      <button onClick={onClick} className={baseClasses}>
        {icon}
        {label}
      </button>
    );
  }

  const { closeNav } = useUiStore();
  return (
    <Link to={to!} onClick={closeNav} className={baseClasses}>
      {icon}
      {label}
    </Link>
  );
}


