import { products } from "../../data/products";

const stats = [
  { label: "Total Products", value: products.length },
  { label: "In Stock", value: products.filter((p) => p.inStock).length },
  { label: "Low Stock / Sold Out", value: products.filter((p) => !p.inStock).length },
  { label: "Limited Editions", value: products.filter((p) => p.category === "limited").length },
];

/**
 * Admin dashboard overview — key stats at a glance.
 * In production, these would come from real-time Prisma queries via API routes.
 */
export default function AdminOverview() {
  return (
    <div>
      <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-medium text-[#2d2926] mb-8">
        Dashboard
      </h1>

      {/* Stats grid */}
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-12" role="list">
        {stats.map(({ label, value }) => (
          <li key={label} className="rounded-lg border border-[#e8e0d8] bg-white p-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#9a8d82]">{label}</p>
            <p className="mt-2 text-4xl font-semibold text-[#2d2926]">{value}</p>
          </li>
        ))}
      </ul>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { href: "/admin/products", title: "Manage Products", desc: "Edit titles, prices, and stock" },
          { href: "/admin/orders", title: "View Orders", desc: "Update order statuses" },
          { href: "/admin/inventory", title: "Inventory", desc: "Check variant stock levels" },
        ].map(({ href, title, desc }) => (
          <a
            key={href}
            href={href}
            className="rounded-lg border border-[#e8e0d8] bg-white p-5 hover:border-[#c4a093] hover:shadow-sm transition-all"
          >
            <p className="text-sm font-medium text-[#2d2926]">{title}</p>
            <p className="mt-1 text-xs text-[#9a8d82]">{desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
