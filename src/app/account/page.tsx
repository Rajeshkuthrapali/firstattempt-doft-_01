"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Package, Heart, LogOut, Loader2 } from "lucide-react";

export default function AccountPage() {
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [orders, setOrders] = useState<{ id: string; status: string; total: number; createdAt: string; itemCount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try { const res = await fetch("/api/account"); if (res.ok) { const data = await res.json(); setUser(data.user); setOrders(data.orders); setName(data.user.name); } } finally { setLoading(false); }
    }
    fetchProfile();
  }, []);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 size={32} className="animate-spin text-primary" /></div>;
  if (!user) return <div className="mx-auto max-w-md px-6 py-20 text-center"><User size={48} className="mx-auto mb-4 text-border" /><h1 className="font-heading text-3xl font-bold text-primary">Sign In</h1><p className="mt-3 text-text-light">Sign in to view your orders and wishlist.</p><Link href="/auth/signin" className="mt-8 inline-block bg-primary px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white hover:bg-accent">Sign In</Link></div>;

  const statusColors: Record<string, string> = { pending: "bg-yellow-100 text-yellow-800", paid: "bg-green-100 text-green-800", shipped: "bg-blue-100 text-blue-800" };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10 flex items-center justify-between"><div><h1 className="font-heading text-3xl font-bold text-primary">My Account</h1><p className="mt-1 text-text-light">Welcome back, {user.name || user.email}</p></div><Link href="/api/auth/signout" className="flex items-center gap-2 text-sm text-text-muted hover:text-accent"><LogOut size={16} />Sign Out</Link></div>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-3">
          <Link href="/account" className="flex items-center gap-3 rounded-lg bg-bg-secondary px-4 py-3 text-sm font-medium text-primary"><User size={18} />Profile</Link>
          <Link href="/account/orders" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-text-light hover:bg-bg-secondary hover:text-primary"><Package size={18} />Orders</Link>
          <Link href="/wishlist" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-text-light hover:bg-bg-secondary hover:text-primary"><Heart size={18} />Wishlist</Link>
        </div>
        <div className="lg:col-span-2">
          <div className="border border-border p-6">
            <h2 className="mb-4 text-lg font-bold uppercase tracking-wider">Profile</h2>
            <div className="space-y-2 text-sm"><p><span className="text-text-muted">Name:</span> {user.name || "Not set"}</p><p><span className="text-text-muted">Email:</span> {user.email}</p></div>
            <button onClick={() => setEditing(!editing)} className="mt-4 border border-primary px-6 py-2 text-sm font-bold uppercase tracking-wider text-primary hover:bg-primary hover:text-white">Edit Profile</button>
          </div>
          <div className="mt-8 border border-border p-6">
            <h2 className="mb-4 text-lg font-bold uppercase tracking-wider">Recent Orders</h2>
            {orders.length === 0 ? <p className="py-8 text-center text-text-muted">No orders yet.</p> : orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between border-b border-border-light pb-3 mb-3">
                <div><p className="text-sm font-medium">Order #{order.id.slice(-8)}</p><p className="text-xs text-text-muted">{new Date(order.createdAt).toLocaleDateString()}</p></div>
                <div className="flex items-center gap-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${statusColors[order.status] ?? "bg-gray-100 text-gray-800"}`}>{order.status}</span><span className="text-sm font-bold text-primary">${order.total.toFixed(2)}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
