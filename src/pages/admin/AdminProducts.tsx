import { useState } from "react";
import { products as initialProducts, type Product } from "../../data/products";
import { formatPrice } from "../../lib/format";

/**
 * Admin Products — inline edit for name, price, and stock status.
 * In production, changes would be persisted via PATCH /api/admin/products.
 */
export default function AdminProducts() {
  const [items, setItems] = useState<Product[]>(initialProducts);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Product>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function startEdit(p: Product) {
    setEditing(p.id);
    setDraft({ name: p.name, price: p.price, inStock: p.inStock });
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-medium text-[#2d2926]">
          Products
        </h1>
        <span className="text-sm text-[#9a8d82]">{items.length} products</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#e8e0d8] bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-[#e8e0d8] bg-[#f3ece4]">
            <tr>
              {["Image", "Name", "Category", "Price", "Stock", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.15em] text-[#9a8d82]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ebe5]">
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-[#faf7f4] transition-colors">
                <td className="px-4 py-3">
                  <img src={p.image} alt={p.name} className="h-12 w-12 rounded object-cover bg-[#f3ece4]" />
                </td>
                <td className="px-4 py-3 font-medium text-[#2d2926]">
                  {editing === p.id ? (
                    <input
                      aria-label={`Edit name for ${p.name}`}
                      value={draft.name ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                      className="w-full border border-[#c4a093] rounded px-2 py-1 text-sm outline-none"
                    />
                  ) : (
                    p.name
                  )}
                </td>
                <td className="px-4 py-3 text-[#6b5e54] capitalize">{p.category}</td>
                <td className="px-4 py-3">
                  {editing === p.id ? (
                    <input
                      type="number"
                      aria-label={`Edit price for ${p.name}`}
                      value={draft.price ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value) }))}
                      className="w-24 border border-[#c4a093] rounded px-2 py-1 text-sm outline-none"
                    />
                  ) : (
                    formatPrice(p.price)
                  )}
                </td>
                <td className="px-4 py-3">
                  {editing === p.id ? (
                    <input
                      type="checkbox"
                      checked={draft.inStock ?? true}
                      onChange={(e) => setDraft((d) => ({ ...d, inStock: e.target.checked }))}
                      className="accent-[#c4a093]"
                      aria-label="In stock"
                    />
                  ) : (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
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
                          className="text-[11px] font-medium text-[#c4a093] hover:underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditing(null); setDraft({}); }}
                          className="text-[11px] text-[#9a8d82] hover:underline"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(p)}
                          className="text-[11px] font-medium text-[#6b5e54] hover:text-[#2d2926]"
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
                              className="text-[11px] text-[#9a8d82] hover:underline"
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
