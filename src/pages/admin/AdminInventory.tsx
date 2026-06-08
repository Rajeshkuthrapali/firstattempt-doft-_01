import { useEffect, useState } from "react";
import { api } from "../../lib/api/client";
import { useApi } from "../../lib/hooks/useApi";
import { formatPrice } from "../../lib/format";
import type { ProductSummary, PaginatedResponse } from "../../types/catalog";

interface InventoryRow {
  id: string;
  title: string;
  category: string;
  priceCents: number;
  stock: number;
}

const LOW_STOCK_THRESHOLD = 5;

/**
 * Admin Inventory — inline stock level editing per product.
 * Highlights items at or below LOW_STOCK_THRESHOLD in amber.
 * In production, changes call PATCH /api/admin/inventory.
 */
export default function AdminInventory() {
  const productsApi = useApi<ProductSummary[]>(
    () => api.get<PaginatedResponse<ProductSummary>>("/api/products"),
    [],
  );

  useEffect(() => {
    productsApi.execute();
  }, [productsApi.execute]);

  function getCategoryFromSlugs(collectionSlugs: string[]): string {
    if (collectionSlugs.includes("limited")) return "limited";
    if (collectionSlugs.includes("seasonal")) return "seasonal";
    return "signature";
  }

  const [inventory, setInventory] = useState<InventoryRow[]>([]);

  // Build inventory from API data once loaded
  useEffect(() => {
    if (productsApi.data) {
      setInventory(
        productsApi.data.map((p, i) => ({
          id: p.id,
          title: p.title,
          category: getCategoryFromSlugs(p.collectionSlugs),
          priceCents: p.priceCents,
          // Deterministic placeholder stock: alternates realistic values based on index
          stock: p.inStock ? [42, 18, 7, 35, 3, 24][i % 6] : 0,
        })),
      );
    }
  }, [productsApi.data]);

  function updateStock(id: string, stock: number) {
    setInventory((prev) => prev.map((r) => (r.id === id ? { ...r, stock } : r)));
  }

  const lowStockCount = inventory.filter((r) => r.stock <= LOW_STOCK_THRESHOLD).length;

  function exportCSV() {
    const headers = ["Product ID,Name,Category,Price,Stock\n"];
    const rows = inventory.map(r => `${r.id},"${r.title.replace(/"/g, '""')}",${r.category},${r.priceCents},${r.stock}\n`);
    const blob = new Blob(headers.concat(rows), { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (productsApi.loading) {
    return (
      <div>
        <p className="text-sm text-[#9a8d82] py-4">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-medium text-[#2d2926]">
            Inventory
          </h1>
          {lowStockCount > 0 && (
            <p className="mt-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 inline-block">
              ⚠ {lowStockCount} item{lowStockCount > 1 ? "s" : ""} low / out of stock
            </p>
          )}
        </div>
        <button
          onClick={exportCSV}
          className="rounded bg-[#2d2926] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white hover:bg-[#c4a093] transition-colors"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#e8e0d8] bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-[#e8e0d8] bg-[#f3ece4]">
            <tr>
              {["Product", "Category", "Price", "Stock Level", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.15em] text-[#9a8d82]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ebe5]">
            {inventory.map((row) => {
              const isLow = row.stock <= LOW_STOCK_THRESHOLD;
              return (
                <tr
                  key={row.id}
                  className={`transition-colors ${isLow ? "bg-amber-50/40" : "hover:bg-[#faf7f4]"}`}
                >
                  <td className="px-4 py-3 font-medium text-[#2d2926]">{row.title}</td>
                  <td className="px-4 py-3 text-[#6b5e54] capitalize">{row.category}</td>
                  <td className="px-4 py-3 text-[#6b5e54]">{formatPrice(row.priceCents / 100)}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      value={row.stock}
                      onChange={(e) => updateStock(row.id, Math.max(0, Number(e.target.value)))}
                      className={`w-20 rounded border px-2 py-1 text-sm outline-none focus:border-[#c4a093] ${
                        isLow ? "border-amber-300" : "border-[#e8e0d8]"
                      }`}
                      aria-label={`Stock count for ${row.title}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        row.stock === 0
                          ? "bg-red-50 text-red-600"
                          : isLow
                            ? "bg-amber-50 text-amber-700"
                            : "bg-green-50 text-green-700"
                      }`}
                    >
                      {row.stock === 0 ? "Out of Stock" : isLow ? "Low Stock" : "OK"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[11px] text-[#9a8d82]">
        * Items with stock ≤ {LOW_STOCK_THRESHOLD} are highlighted. Changes are saved locally; in production they persist via API.
      </p>
    </div>
  );
}
