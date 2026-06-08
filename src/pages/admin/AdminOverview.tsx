import { useEffect } from "react";
import { api } from "../../lib/api/client";
import { useApi } from "../../lib/hooks/useApi";
import type { ProductSummary, PaginatedResponse } from "../../types/catalog";

function getCategoryFromSlugs(collectionSlugs: string[]): string {
  if (collectionSlugs.includes("limited")) return "limited";
  if (collectionSlugs.includes("seasonal")) return "seasonal";
  return "signature";
}

/**
 * Admin dashboard overview — key stats at a glance.
 */
export default function AdminOverview() {
  const productsApi = useApi<ProductSummary[]>(
    () => api.get<PaginatedResponse<ProductSummary>>("/api/products"),
    [],
  );

  useEffect(() => {
    productsApi.execute();
  }, [productsApi.execute]);

  const allProducts = productsApi.data ?? [];

  const stats = [
    { label: "Total Products", value: allProducts.length },
    { label: "In Stock", value: allProducts.filter((p) => p.inStock).length },
    { label: "Low Stock / Sold Out", value: allProducts.filter((p) => !p.inStock).length },
    { label: "Limited Editions", value: allProducts.filter((p) => getCategoryFromSlugs(p.collectionSlugs) === "limited").length },
  ];

  return (
    <div>
      <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-medium text-[#2d2926] mb-8">
        Dashboard
      </h1>

      {productsApi.loading ? (
        <p className="text-sm text-[#9a8d82] py-4">Loading stats...</p>
      ) : (
        <>
          {/* Stats grid */}
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-12" role="list">
            {stats.map(({ label, value }) => (
              <li key={label} className="rounded-lg border border-[#e8e0d8] bg-white p-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#9a8d82]">{label}</p>
                <p className="mt-2 text-4xl font-semibold text-[#2d2926]">{value}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3 mb-12">
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

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Funnel Analysis */}
        <div className="rounded-lg border border-[#e8e0d8] bg-white p-6">
          <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-medium text-[#2d2926] mb-4">
            Conversion Funnel
          </h2>
          <div className="space-y-4">
            {[
              { step: "Site Visitors", count: 12500, percentage: 100 },
              { step: "Added to Cart", count: 3200, percentage: 25.6 },
              { step: "Reached Checkout", count: 1850, percentage: 14.8 },
              { step: "Purchased", count: 850, percentage: 6.8 },
            ].map((f) => (
              <div key={f.step}>
                <div className="flex justify-between text-sm text-[#4a3f37] mb-1">
                  <span>{f.step}</span>
                  <span className="font-medium">{f.count} ({f.percentage}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#f3ece4]">
                  <div
                    className="h-full rounded-full bg-[#c4a093]"
                    style={{ width: `${f.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cohort Analysis */}
        <div className="rounded-lg border border-[#e8e0d8] bg-white p-6">
          <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-medium text-[#2d2926] mb-4">
            Customer Cohort Retention
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#f3ece4] text-[#9a8d82] uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2">Cohort</th>
                  <th className="px-3 py-2 text-center">Month 1</th>
                  <th className="px-3 py-2 text-center">Month 2</th>
                  <th className="px-3 py-2 text-center">Month 3</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e0d8]">
                <tr>
                  <td className="px-3 py-2 font-medium text-[#2d2926]">Jan 2026</td>
                  <td className="px-3 py-2 text-center bg-[#c4a093]/40">100%</td>
                  <td className="px-3 py-2 text-center bg-[#c4a093]/20">24%</td>
                  <td className="px-3 py-2 text-center bg-[#c4a093]/10">18%</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-medium text-[#2d2926]">Feb 2026</td>
                  <td className="px-3 py-2 text-center bg-[#c4a093]/40">100%</td>
                  <td className="px-3 py-2 text-center bg-[#c4a093]/30">32%</td>
                  <td className="px-3 py-2 text-center text-[#9a8d82]">-</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-medium text-[#2d2926]">Mar 2026</td>
                  <td className="px-3 py-2 text-center bg-[#c4a093]/40">100%</td>
                  <td className="px-3 py-2 text-center text-[#9a8d82]">-</td>
                  <td className="px-3 py-2 text-center text-[#9a8d82]">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
