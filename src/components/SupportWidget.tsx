import { useState } from "react";
import { createSupportTicket, searchHelpCenter, showLiveChat, type TicketCategory, type TicketPriority } from "../lib/support";

const CATEGORIES: { value: TicketCategory; label: string; emoji: string }[] = [
  { value: "order", label: "Order Issue", emoji: "📦" },
  { value: "shipping", label: "Shipping", emoji: "🚚" },
  { value: "refund", label: "Return / Refund", emoji: "↩️" },
  { value: "product", label: "Product Question", emoji: "🕯️" },
  { value: "loyalty", label: "Loyalty & Rewards", emoji: "⭐" },
  { value: "technical", label: "Technical Issue", emoji: "🔧" },
  { value: "other", label: "Other", emoji: "💬" },
];

/**
 * In-app support widget: help center search, quick FAQ,
 * ticket form, and live chat trigger.
 */
export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"home" | "ticket" | "search">("home");
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", category: "order" as TicketCategory, priority: "medium" as TicketPriority, customerName: "", customerEmail: "", orderId: "" });

  const results = query.length > 2 ? searchHelpCenter(query) : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await createSupportTicket(form);
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <>
      {/* ── Trigger Button ── */}
      <button
        id="support-widget-trigger"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#2d2926] px-4 py-3 text-white shadow-lg hover:bg-[#4a3f38] transition-all"
        aria-label="Open support"
      >
        <span className="text-lg">💬</span>
        <span className="text-sm font-medium hidden sm:block">Help</span>
      </button>

      {/* ── Widget Panel ── */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 max-h-[520px] flex flex-col rounded-2xl bg-white shadow-2xl border border-[#e8e0d8] overflow-hidden">
          {/* Header */}
          <div className="bg-[#2d2926] text-white px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Lumière Support</p>
              <p className="text-[10px] text-white/60">We typically reply within 2 hours</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-lg leading-none">✕</button>
          </div>

          {/* Nav tabs */}
          <div className="flex border-b border-[#e8e0d8] text-[10px] uppercase tracking-wider">
            {(["home", "search", "ticket"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`flex-1 py-2 transition-colors ${view === v ? "bg-[#f3ece4] text-[#2d2926] font-semibold" : "text-[#9a8d82] hover:bg-[#faf7f4]"}`}>
                {v === "home" ? "Help" : v === "search" ? "Search" : "Contact"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* ── Home ── */}
            {view === "home" && (
              <div className="space-y-3">
                <p className="text-xs text-[#6b5e54] font-medium">Quick help</p>
                {CATEGORIES.map((cat) => (
                  <button key={cat.value}
                    onClick={() => { setForm((f) => ({ ...f, category: cat.value })); setView("ticket"); }}
                    className="w-full flex items-center gap-3 rounded-lg border border-[#e8e0d8] px-3 py-2.5 hover:bg-[#f3ece4] text-left transition-colors">
                    <span className="text-base">{cat.emoji}</span>
                    <span className="text-sm text-[#2d2926]">{cat.label}</span>
                  </button>
                ))}
                <div className="pt-2 border-t border-[#e8e0d8]">
                  <button onClick={showLiveChat}
                    className="w-full rounded-lg bg-[#2d2926] text-white py-2.5 text-sm font-medium hover:bg-[#4a3f38] transition-colors">
                    💬 Start Live Chat
                  </button>
                </div>
              </div>
            )}

            {/* ── Search ── */}
            {view === "search" && (
              <div>
                <input
                  id="support-search-input"
                  type="text"
                  placeholder="Search help articles…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full border border-[#e8e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d2926]"
                />
                <div className="mt-3 space-y-2">
                  {results.length === 0 && query.length > 2 && (
                    <p className="text-xs text-[#9a8d82] text-center py-4">No articles found. <button className="underline" onClick={() => setView("ticket")}>Submit a ticket?</button></p>
                  )}
                  {results.map((a) => (
                    <a key={a.id} href={a.url}
                      className="block rounded-lg border border-[#e8e0d8] px-3 py-2.5 hover:bg-[#f3ece4] transition-colors">
                      <p className="text-sm font-medium text-[#2d2926]">{a.title}</p>
                      <p className="text-[11px] text-[#9a8d82] mt-0.5 line-clamp-2">{a.excerpt}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* ── Ticket Form ── */}
            {view === "ticket" && !submitted && (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input id="support-name" required placeholder="Your name" value={form.customerName}
                  onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                  className="w-full border border-[#e8e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d2926]" />
                <input id="support-email" required type="email" placeholder="Email address" value={form.customerEmail}
                  onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
                  className="w-full border border-[#e8e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d2926]" />
                <select id="support-category" value={form.category} aria-label="Issue category"
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as TicketCategory }))}
                  className="w-full border border-[#e8e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d2926]">
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <input id="support-order-id" placeholder="Order ID (optional)" value={form.orderId}
                  onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))}
                  className="w-full border border-[#e8e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d2926]" />
                <textarea id="support-description" required rows={3} placeholder="Describe your issue…" value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border border-[#e8e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d2926] resize-none" />
                <button type="submit" disabled={loading}
                  className="w-full rounded-lg bg-[#2d2926] text-white py-2.5 text-sm font-medium hover:bg-[#4a3f38] transition-colors disabled:opacity-60">
                  {loading ? "Submitting…" : "Submit Request"}
                </button>
              </form>
            )}

            {view === "ticket" && submitted && (
              <div className="py-8 text-center">
                <p className="text-3xl mb-3">✅</p>
                <p className="font-medium text-[#2d2926]">Request received!</p>
                <p className="text-xs text-[#9a8d82] mt-1">We'll reply within 24 hours.</p>
                <button onClick={() => { setSubmitted(false); setView("home"); }}
                  className="mt-4 text-xs text-[#2d2926] underline">Back to help</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
