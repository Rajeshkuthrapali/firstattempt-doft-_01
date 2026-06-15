import { useEffect, useState } from "react";
import { api } from "../../lib/api/client";
import { useApi } from "../../lib/hooks/useApi";
import { formatPrice } from "../../lib/format";
import { PageSkeleton } from "../../components/PageSkeleton";
import type { ProductSummary, PaginatedResponse } from "../../types/catalog";

function getCategoryFromSlugs(collectionSlugs: string[]): string {
  if (collectionSlugs.includes("limited")) return "limited";
  if (collectionSlugs.includes("seasonal")) return "seasonal";
  return "signature";
}

/**
 * Admin Products — inline edit for name, price, and stock status.
 * In production, changes would be persisted via PATCH /api/admin/products.
 */
export default function AdminProducts() {
  const productsApi = useApi<ProductSummary[]>(
    () => api.get<PaginatedResponse<ProductSummary>>("/api/products"),
    [],
  );

  useEffect(() => {
    productsApi.execute();
  }, [productsApi.execute]);

  const [items, setItems] = useState<ProductSummary[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<{ title: string; priceCents: number; inStock: boolean }>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Sync items from API data
  useEffect(() => {
    if (productsApi.data) {
      setItems(productsApi.data);
    }
  }, [productsApi.data]);

  function startEdit(p: ProductSummary) {
    setEditing(p.id);
    setDraft({ title: p.title, priceCents: p.priceCents, inStock: p.inStock });
  }

  function saveEdit(id: string) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...draft } : p)));
    setEditing(null);
    setDraft({});
  }

  function confirmDelete(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  }

  if (productsApi.loading) {
    return <PageSkeleton />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-medium text-ink">
          Products
        </h1>
        <span className="text-sm text-muted">{items.length} products</span>
      </div>

      <div className="overflow-x-auto border border-hairline bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-hairline bg-[#f3ece4]">
            <tr>
              {["Image", "Name", "Category", "Price", "Stock", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.15em] text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ebe5]">
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-soft-cream transition-colors">
                <td className="px-4 py-3">
                  <img src={p.image} alt={p.title} className="h-12 w-12 rounded object-cover bg-[#f3ece4]" />
                </td>
                <td className="px-4 py-3 font-medium text-ink">
                  {editing === p.id ? (
                    <input
                      aria-label={`Edit name for ${p.title}`}
                      value={draft.title ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                      className="w-full border border-brass-gold px-2 py-1 text-sm outline-none"
                    />
                  ) : (
                    p.title
                  )}
                </td>
                <td className="px-4 py-3 text-dark capitalize">
                  {getCategoryFromSlugs(p.collectionSlugs)}
                </td>
                <td className="px-4 py-3">
                  {editing === p.id ? (
                    <input
                      type="number"
                      aria-label={`Edit price for ${p.title}`}
                      value={draft.priceCents ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, priceCents: Number(e.target.value) }))}
                      className="w-24 border border-brass-gold px-2 py-1 text-sm outline-none"
                    />
                  ) : (
                    formatPrice(p.priceCents / 100)
                  )}
                </td>
                <td className="px-4 py-3">
                  {editing === p.id ? (
                    <input
                      type="checkbox"
                      checked={draft.inStock ?? true}
                      onChange={(e) => setDraft((d) => ({ ...d, inStock: e.target.checked }))}
                      className="accent-brass-gold"
                      aria-label="In stock"
                    />
                  ) : (
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        p.inStock
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {p.inStock ? "In Stock" : "Sold Out"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {editing === p.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(p.id)}
                          className="text-[11px] font-medium text-brass-gold hover:underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditing(null); setDraft({}); }}
                          className="text-[11px] text-muted hover:underline"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(p)}
                          className="text-[11px] font-medium text-dark hover:text-ink"
                        >
                          Edit
                        </button>
                        {deleteConfirm === p.id ? (
                          <>
                            <button
                              onClick={() => confirmDelete(p.id)}
                              className="text-[11px] font-medium text-red-600 hover:underline"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-[11px] text-muted hover:underline"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(p.id)}
                            className="text-[11px] text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
