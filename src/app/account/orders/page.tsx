"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ArrowLeft, Loader2 } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<{ id: string; status: string; total: number; createdAt: string; itemCount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { async function f() { try { const res = await fetch("/api/account"); if (res.ok) { const data = await res.json(); setOrders(data.orders); } } finally { setLoading(false); } } f(); }, []);
  const statusColors: Record<string, string> = { pending: "bg-yellow-100 text-yellow-800", paid: "bg-green-100 text-green-800", shipped: "bg-blue-100 text-blue-800" };
  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 size={32} className="animate-spin text-primary" /></div>;
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/account" className="mb-6 inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary"><ArrowLeft size={16} />Back to Account</Link>
      <h1 className="font-heading text-3xl font-bold text-primary">Order History</h1>
      {orders.length === 0 ? <div className="mt-12 flex flex-col items-center py-16 text-center"><Package size={48} className="mb-4 text-border" /><p className="text-lg text-text-muted">No orders yet</p></div> : (
        <div className="mt-8 space-y-4">{orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between border border-border p-5 hover:border-primary hover:shadow-sm">
            <div><p className="font-medium">Order #{order.id.slice(-8)}</p><p className="mt-1 text-sm text-text-muted">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p></div>
            <div className="flex items-center gap-4"><span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusColors[order.status] ?? "bg-gray-100 text-gray-800"}`}>{order.status}</span><span className="text-lg font-bold text-primary">${order.total.toFixed(2)}</span></div>
          </div>
        ))}</div>
      )}
    </div>
  );
}
