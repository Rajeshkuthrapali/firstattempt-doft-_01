"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useCartStore } from "@/stores/cart";

const NAV_ITEMS = [
  { label: "Bestsellers", href: "/collections/bestsellers" },
  {
    label: "Gifts",
    href: "/collections/all-gifts",
    children: [
      { label: "Birthday", href: "/collections/birthday-gifts" },
      { label: "Housewarming", href: "/collections/home-living" },
      { label: "Anniversary", href: "/collections/anniversary-gifts" },
    ],
  },
  {
    label: "Shop by Scent",
    href: "#",
    children: [
      { label: "Fresh & Citrusy", href: "/collections/fresh-citrusy" },
      { label: "Floral & Aromatic", href: "/collections/floral-aromatic" },
      { label: "Woody & Earthy", href: "/collections/woody-earthy" },
      { label: "Opulent & Warm", href: "/collections/opulent-warm" },
    ],
  },
  {
    label: "Collections",
    href: "#",
    children: [
      { label: "The Illume Collection", href: "/collections/illume" },
      { label: "The Cosmic Collection", href: "/collections/cosmic" },
      { label: "The Royal Collection", href: "/collections/royal" },
    ],
  },
  { label: "About", href: "/about" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const openCart = useCartStore((s) => s.openCart);
  const totalItems = useCartStore((s) => s.totalItems);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <button
          className="lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <Link
          to="/"
          className="font-heading text-2xl font-bold tracking-[3px] text-primary"
        >
          DOFT
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className="group relative"
              onMouseEnter={() => setActiveDropdown(item.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                to={item.href}
                className="text-sm uppercase tracking-wide text-text transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
              {item.children && activeDropdown === item.label && (
                <div className="absolute left-1/2 top-full z-50 min-w-[220px] -translate-x-1/2 border-t-[3px] border-primary bg-surface pt-2 shadow-lg">
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      to={child.href}
                      className="block px-6 py-3 text-sm text-text transition-all hover:bg-bg-secondary hover:pl-8 hover:text-primary"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-5">
          <Link
            to="/search"
            className="text-text transition-colors hover:text-primary"
            aria-label="Search"
          >
            <Search size={20} />
          </Link>
          <Link
            to="/account"
            className="text-text transition-colors hover:text-primary"
            aria-label="Account"
          >
            <User size={20} />
          </Link>
          <button
            onClick={openCart}
            className="relative text-text transition-colors hover:text-primary"
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {totalItems()}
            </span>
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="border-t border-border bg-surface px-6 py-4 lg:hidden">
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className="border-b border-border-light py-3">
              <Link
                to={item.href}
                className="block text-sm uppercase tracking-wide"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="mt-2 space-y-2 pl-4">
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      to={child.href}
                      className="block text-sm text-text-light"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
