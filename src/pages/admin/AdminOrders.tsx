import { useState } from "react";
import { formatPrice } from "../../lib/format";

type OrderStatus = "pending" | "paid" | "dispatched" | "delivered" | "cancelled";

interface MockOrder {
  id: string;
  email: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: number;
}

// Static mock data — in production replaces with /api/admin/orders fetch
const mockOrders: MockOrder[] = [
  { id: "ord-001", email: "priya@example.com", total: 4998, status: "paid", createdAt: "2026-03-20", items: 2 },
  { id: "ord-002", email: "arun@example.com", total: 2499, status: "dispatched", createdAt: "2026-03-21", items: 1 },
  { id: "ord-003", email: "meera@example.com", total: 7497, status: "pending", createdAt: "2026-03-22", items: 3 },
  { id: "ord-004", email: "ravi@example.com", total: 3499, status: "delivered", createdAt: "2026-03-18", items: 1 },
  { id: "ord-005", email: "sonia@example.com", total: 5998, status: "cancelled", createdAt: "2026-03-17", items: 2 },
];

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  paid: "bg-blue-50 text-blue-700",
  dispatched: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600",
};

/**
 * Admin Orders — list with inline status updates.
 * In production, status changes call PATCH /api/admin/orders/:id.
 */
export default function AdminOrders() {
  const [orders, setOrders] = useState<MockOrder[]>(mockOrders);

  function updateStatus(id: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  const statuses: OrderStatus[] = ["pending", "paid", "dispatched", "delivered", "cancelled"];

  function exportCSV() {
    const headers = ["Order ID,Customer Email,Total,Status,Date,Items\n"];
    const rows = orders.map(o => `${o.id},${o.email},${o.total},${o.status},${o.createdAt},${o.items}\n`);
    const blob = new Blob(headers.concat(rows), { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-medium text-[#2d2926]">
            Orders
          </h1>
          <p className="text-sm text-[#9a8d82] mt-1">{orders.length} orders total</p>
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
              {["Order ID", "Customer", "Items", "Total", "Status", "Date", "Update Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.15em] text-[#9a8d82]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ebe5]">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-[#faf7f4] transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-[#6b5e54]">{o.id}</td>
                <td className="px-4 py-3 text-[#2d2926]">{o.email}</td>
                <td className="px-4 py-3 text-center text-[#6b5e54]">{o.items}</td>
                <td className="px-4 py-3 font-medium text-[#2d2926]">{formatPrice(o.total)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusColors[o.status]}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[#9a8d82]">{o.createdAt}</td>
                <td className="px-4 py-3">
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                    className="text-xs border border-[#e8e0d8] rounded px-2 py-1 outline-none focus:border-[#c4a093] bg-white text-[#2d2926]"
                    aria-label={`Update status for order ${o.id}`}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
