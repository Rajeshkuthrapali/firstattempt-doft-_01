import { useState } from "react";

// ── Checklist data ────────────────────────────────────────────────────────────

type CheckStatus = "done" | "pending" | "blocked";

interface CheckItem {
  id: string;
  label: string;
  status: CheckStatus;
  owner?: string;
  notes?: string;
}

interface CheckSection {
  title: string;
  emoji: string;
  items: CheckItem[];
}

const INITIAL_SECTIONS: CheckSection[] = [
  {
    title: "Code & Quality",
    emoji: "🧪",
    items: [
      { id: "q1", label: "Vitest 187+ tests passing", status: "done", owner: "Engineering" },
      { id: "q2", label: "Playwright E2E green (Chrome, Safari, Firefox)", status: "pending", owner: "QA" },
      { id: "q3", label: "Lighthouse CI ≥ 0.90 performance / accessibility / PWA", status: "pending", owner: "Engineering" },
      { id: "q4", label: "No open P0/P1 Sentry errors in staging 48h", status: "pending", owner: "DevOps" },
      { id: "q5", label: "App chunk ≤ 350kB gzip", status: "done", owner: "Engineering", notes: "Current: 328kB ✓" },
    ],
  },
  {
    title: "Catalog & Content",
    emoji: "🕯️",
    items: [
      { id: "c1", label: "12 SKUs live with images, prices, HSN codes", status: "done", owner: "Catalog", notes: "Expanded from 6 → 12 SKUs" },
      { id: "c2", label: "6 locale translations reviewed (en, hi, fr, de, ja, ar)", status: "pending", owner: "Localization" },
      { id: "c3", label: "Blog posts published and CMS webhooks validated", status: "pending", owner: "Marketing" },
      { id: "c4", label: "Legal pages live (Privacy, Terms, Refunds, Cookie)", status: "done", owner: "Legal" },
    ],
  },
  {
    title: "Payments & Checkout",
    emoji: "💳",
    items: [
      { id: "p1", label: "Stripe live keys configured and tested", status: "pending", owner: "Engineering", notes: "Switch from test keys" },
      { id: "p2", label: "Razorpay India live keys tested", status: "pending", owner: "Engineering" },
      { id: "p3", label: "PayPal production credentials verified", status: "pending", owner: "Engineering" },
      { id: "p4", label: "Apple Pay merchant validation cert installed", status: "pending", owner: "DevOps" },
      { id: "p5", label: "Google Pay merchant ID registered", status: "pending", owner: "Engineering" },
      { id: "p6", label: "Regional wallets (Paytm, PhonePe, GrabPay) sandbox tested", status: "pending", owner: "Engineering" },
    ],
  },
  {
    title: "Logistics",
    emoji: "🚚",
    items: [
      { id: "l1", label: "Shiprocket live API keys configured", status: "pending", owner: "Operations" },
      { id: "l2", label: "Delhivery account active + pickup address registered", status: "pending", owner: "Operations" },
      { id: "l3", label: "FedEx international account connected", status: "pending", owner: "Operations" },
      { id: "l4", label: "Warehouse pickup slots confirmed", status: "pending", owner: "Operations" },
      { id: "l5", label: "Packaging and labelling supplies stocked", status: "pending", owner: "Operations" },
    ],
  },
  {
    title: "Taxes & Compliance",
    emoji: "🔏",
    items: [
      { id: "t1", label: "GSTIN verified; embedded in invoices (seller: UP)", status: "pending", owner: "Finance" },
      { id: "t2", label: "EU VAT tested for UK, DE, FR checkouts", status: "pending", owner: "Engineering" },
      { id: "t3", label: "GDPR cookie banner tested across EU locales", status: "pending", owner: "Legal" },
      { id: "t4", label: "CCPA opt-out flow validated for US/CA visitors", status: "pending", owner: "Legal" },
      { id: "t5", label: "PCI DSS SAQ-A confirmed (no card data stored)", status: "done", owner: "Security" },
    ],
  },
  {
    title: "Marketing & CRM",
    emoji: "📣",
    items: [
      { id: "m1", label: "Klaviyo welcome series activated and tested", status: "pending", owner: "Marketing" },
      { id: "m2", label: "Abandoned cart trigger tested (4h delay)", status: "pending", owner: "Marketing" },
      { id: "m3", label: "Loyalty partner integrations live (IndiGo, Taj, NeuCoin)", status: "pending", owner: "Growth" },
      { id: "m4", label: "GA4 production property with all events verified", status: "pending", owner: "Analytics" },
      { id: "m5", label: "Meta Pixel and conversion events configured", status: "pending", owner: "Marketing" },
    ],
  },
  {
    title: "Monitoring & DR",
    emoji: "📡",
    items: [
      { id: "dr1", label: "Sentry DSN pointing to production project", status: "pending", owner: "DevOps" },
      { id: "dr2", label: "PagerDuty alerting configured (P0: 5min SLA)", status: "pending", owner: "DevOps" },
      { id: "dr3", label: "Uptime monitor active (60s polling)", status: "pending", owner: "DevOps" },
      { id: "dr4", label: "DB failover drill completed (RTO ≤ 120s)", status: "pending", owner: "DevOps" },
      { id: "dr5", label: "k6 load test run (100 VUs, p95 < 800ms)", status: "pending", owner: "Engineering" },
    ],
  },
  {
    title: "Customer Support",
    emoji: "💬",
    items: [
      { id: "s1", label: "Freshdesk/Intercom live chat active", status: "pending", owner: "Support" },
      { id: "s2", label: "Support widget deployed on all pages", status: "done", owner: "Engineering" },
      { id: "s3", label: "support@lumiere.in email routing verified", status: "pending", owner: "Operations" },
      { id: "s4", label: "Customer service team briefed on refund policy", status: "pending", owner: "Support" },
    ],
  },
];

const STATUS_CONFIG = {
  done: { label: "Done", color: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700", dot: "bg-amber-400" },
  blocked: { label: "Blocked", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

/**
 * Admin launch readiness dashboard.
 * Live Go/No-Go checklist for v3.0.0 public release.
 */
export default function AdminLaunch() {
  const [sections, setSections] = useState<CheckSection[]>(INITIAL_SECTIONS);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  function cycleStatus(sectionTitle: string, itemId: string) {
    const cycle: CheckStatus[] = ["pending", "done", "blocked"];
    setSections((prev) =>
      prev.map((sec) =>
        sec.title !== sectionTitle ? sec : {
          ...sec,
          items: sec.items.map((item) =>
            item.id !== itemId ? item : {
              ...item,
              status: cycle[(cycle.indexOf(item.status) + 1) % cycle.length],
            }
          ),
        }
      )
    );
  }

  const totalItems = sections.reduce((s, sec) => s + sec.items.length, 0);
  const doneItems = sections.reduce((s, sec) => s + sec.items.filter((i) => i.status === "done").length, 0);
  const blockedItems = sections.reduce((s, sec) => s + sec.items.filter((i) => i.status === "blocked").length, 0);
  const readinessPct = Math.round((doneItems / totalItems) * 100);
  const isGoForLaunch = doneItems === totalItems;

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-medium text-[#2d2926]">
            Launch Readiness
          </h1>
          <p className="text-xs text-[#9a8d82] mt-1">v3.0.0 Go/No-Go checklist — click any item to cycle status</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${isGoForLaunch ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-700"}`}>
          <span className={`h-2 w-2 rounded-full ${isGoForLaunch ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`} />
          {isGoForLaunch ? "🚀 GO for Launch" : "⏳ Not Ready"}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="mb-6 rounded border border-[#e8e0d8] bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#2d2926]">Overall readiness</span>
          <span className="text-sm font-semibold text-[#2d2926]">{doneItems}/{totalItems} items</span>
        </div>
        <div className="h-2 bg-[#f3ece4] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#2d2926] transition-all duration-500"
            style={{ width: `${readinessPct}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3 text-[10px] text-[#9a8d82]">
          <span>✅ {doneItems} done</span>
          <span>⏳ {totalItems - doneItems - blockedItems} pending</span>
          {blockedItems > 0 && <span className="text-red-600">🔴 {blockedItems} blocked</span>}
          <span className="ml-auto font-semibold text-[#2d2926]">{readinessPct}%</span>
        </div>
      </div>

      {/* ── Sections ── */}
      <div className="space-y-3">
        {sections.map((sec) => {
          const secDone = sec.items.filter((i) => i.status === "done").length;
          const isExpanded = expandedSection === sec.title;
          return (
            <div key={sec.title} className="rounded border border-[#e8e0d8] bg-white overflow-hidden">
              <button
                onClick={() => setExpandedSection(isExpanded ? null : sec.title)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#faf7f4] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{sec.emoji}</span>
                  <span className="font-medium text-[#2d2926] text-sm">{sec.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#9a8d82]">{secDone}/{sec.items.length}</span>
                  <div className="h-1.5 w-20 bg-[#f3ece4] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#2d2926] transition-all"
                      style={{ width: `${(secDone / sec.items.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-[#9a8d82] text-xs">{isExpanded ? "▲" : "▼"}</span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-[#e8e0d8] divide-y divide-[#f3ece4]">
                  {sec.items.map((item) => {
                    const cfg = STATUS_CONFIG[item.status];
                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 px-4 py-3 hover:bg-[#faf7f4] cursor-pointer transition-colors"
                        onClick={() => cycleStatus(sec.title, item.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && cycleStatus(sec.title, item.id)}
                        aria-label={`${item.label}: ${item.status}`}
                      >
                        <span className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${item.status === "done" ? "line-through text-[#9a8d82]" : "text-[#2d2926]"}`}>
                            {item.label}
                          </p>
                          {item.notes && <p className="text-[10px] text-[#9a8d82] mt-0.5">{item.notes}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {item.owner && <span className="text-[10px] text-[#9a8d82]">{item.owner}</span>}
                          <span className={`text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-[#c4b8ac] mt-6 text-center">
        Click any checklist item to cycle: pending → done → blocked. State is local — export via browser print for sign-off.
      </p>
    </div>
  );
}
