import { Link } from "react-router-dom";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";

const FOOTER_LINKS = {
  "About DOFT": [
    { label: "Our Story", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  "Customer Care": [
    { label: "Shipping Policy", href: "/policies/shipping" },
    { label: "Returns & Exchange", href: "/policies/returns" },
    { label: "Refund Policy", href: "/policies/refund" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/policies/privacy" },
    { label: "Terms of Service", href: "/policies/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#111] text-white">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 font-heading text-xl font-bold text-gold">
              DOFT
            </h3>
            <p className="text-sm leading-relaxed text-[#aaa]">
              Experience the world through smell. Handcrafted luxury fragrances
              in timeless glass.
            </p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-gold">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-[#bbb] transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-[#333] pt-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-gold">
                Newsletter
              </h4>
              <p className="mt-1 text-sm text-[#999]">
                Subscribe for exclusive deals and updates.
              </p>
            </div>
            <div className="w-full max-w-md">
              <NewsletterForm />
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-[#333] pt-6 text-center text-xs text-[#666]">
          © {new Date().getFullYear()} DOFT Candles. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
