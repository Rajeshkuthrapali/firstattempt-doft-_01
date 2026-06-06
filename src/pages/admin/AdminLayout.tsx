import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth";
import { useEffect } from "react";

const adminLinks = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/inventory", label: "Inventory" },
  { to: "/admin/logs", label: "Logs" },
  { to: "/admin/experiments", label: "Experiments" },
  { to: "/admin/feed", label: "Live Feed" },
  { to: "/admin/loyalty", label: "Loyalty" },
  { to: "/admin/cohorts", label: "Cohorts" },
  { to: "/admin/intelligence", label: "Intelligence" },
  { to: "/admin/launch", label: "Launch" },
];

/**
 * Admin layout — sidebar navigation + role guard.
 * Redirects non-admin users back to the home page.
 */
export default function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    // Role guard: only users with role="admin" can access this area
    if (!user || (user as { role?: string }).role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  if (!user || (user as { role?: string }).role !== "admin") return null;

  return (
    <div className="flex min-h-screen bg-[#faf7f4]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-[#e8e0d8] bg-white pt-10 px-4 flex flex-col gap-1">
        <p className="text-[10px] uppercase tracking-[0.25em] text-[#9a8d82] px-3 mb-4">
          Admin
        </p>
        {adminLinks.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `block rounded px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-[#f3ece4] text-[#2d2926] font-medium"
                  : "text-[#6b5e54] hover:bg-[#f3ece4] hover:text-[#2d2926]"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </aside>

      {/* Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
