import { Navigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/auth";
import { useWishlistStore } from "../stores/wishlist";
import { products } from "../data/products";
import { formatPrice } from "../lib/format";

/**
 * Account dashboard — order history, saved addresses, wishlist.
 * Redirects to /auth if user is not logged in.
 */
export default function Account() {
  const { user, orders, addresses, logout, removeAddress, setDefaultAddress } =
    useAuthStore();
  const wishlistIds = useWishlistStore((s) => s.ids);
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-semibold text-[#2d2926]">
            My Account
          </h1>
          <p className="mt-1 text-sm text-[#6b5e54]">
            Welcome back, {user.name}
          </p>
        </div>
        <button
          onClick={logout}
          className="text-xs uppercase tracking-widest text-[#9a8d82] hover:text-[#c4a093] transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* ── Left column: sidebar ── */}
        <nav className="lg:col-span-1" aria-label="Account sections">
          <ul className="space-y-1">
            {["Orders", "Addresses", "Wishlist"].map((section) => (
              <li key={section}>
                <a
                  href={`#${section.toLowerCase()}`}
                  className="block px-4 py-2.5 text-sm text-[#6b5e54] rounded hover:bg-[#f3ece4] hover:text-[#2d2926] transition-colors"
                >
                  {section}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Right column: content ── */}
        <div className="lg:col-span-2 space-y-12">
          {/* ── Orders ── */}
          <section id="orders" aria-labelledby="orders-heading">
            <h2
              id="orders-heading"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8d82] mb-4"
            >
              Order History
            </h2>
            {orders.length === 0 ? (
              <div className="rounded border border-dashed border-[#e8e0d8] p-8 text-center">
                <p className="text-sm text-[#9a8d82]">No orders yet.</p>
                <Link
                  to="/"
                  className="mt-3 inline-block text-xs text-[#c4a093] hover:underline uppercase tracking-widest"
                >
                  Shop Now
                </Link>
              </div>
            ) : (
              <ul className="space-y-4" role="list">
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className="rounded border border-[#e8e0d8] p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#2d2926]">
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          order.status === "delivered"
                            ? "bg-green-50 text-green-700"
                            : order.status === "cancelled"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#9a8d82]">
                      {new Date(order.date).toLocaleDateString("en-IN")}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {order.items.map((item, i) => (
                        <li
                          key={i}
                          className="flex justify-between text-sm text-[#6b5e54]"
                        >
                          <span>
                            {item.name} × {item.qty}
                          </span>
                          <span>{formatPrice(item.price * item.qty)}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-right text-sm font-semibold text-[#2d2926]">
                      {formatPrice(order.total)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ── Addresses ── */}
          <section id="addresses" aria-labelledby="addresses-heading">
            <div className="flex items-center justify-between mb-4">
              <h2
                id="addresses-heading"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8d82]"
              >
                Saved Addresses
              </h2>
              <Link
                to="/account/address/new"
                className="text-xs text-[#c4a093] hover:underline uppercase tracking-widest"
              >
                + Add
              </Link>
            </div>
            {addresses.length === 0 ? (
              <p className="text-sm text-[#9a8d82]">No saved addresses.</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2" role="list">
                {addresses.map((addr) => (
                  <li
                    key={addr.id}
                    className={`rounded border p-4 ${addr.isDefault ? "border-[#c4a093]" : "border-[#e8e0d8]"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#2d2926]">
                          {addr.label}
                        </p>
                        <p className="mt-1 text-sm text-[#6b5e54] leading-relaxed">
                          {addr.name}
                          <br />
                          {addr.line1}
                          {addr.line2 ? `, ${addr.line2}` : ""}
                          <br />
                          {addr.city}, {addr.state} {addr.postalCode}
                        </p>
                      </div>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-[#f3ece4] text-[#c4a093] px-2 py-0.5 rounded-full font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex gap-3">
                      {!addr.isDefault && (
                        <button
                          onClick={() => setDefaultAddress(addr.id)}
                          className="text-xs text-[#9a8d82] hover:text-[#c4a093] transition-colors"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => removeAddress(addr.id)}
                        className="text-xs text-[#9a8d82] hover:text-red-500 transition-colors"
                        aria-label={`Remove ${addr.label} address`}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ── Wishlist ── */}
          <section id="wishlist" aria-labelledby="wishlist-heading">
            <h2
              id="wishlist-heading"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8d82] mb-4"
            >
              Wishlist
            </h2>
            {wishlistProducts.length === 0 ? (
              <div className="rounded border border-dashed border-[#e8e0d8] p-8 text-center">
                <p className="text-sm text-[#9a8d82]">
                  Your wishlist is empty.
                </p>
                <Link
                  to="/"
                  className="mt-3 inline-block text-xs text-[#c4a093] hover:underline uppercase tracking-widest"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2" role="list">
                {wishlistProducts.map((p) => (
                  <li
                    key={p.id}
                    className="flex gap-4 rounded border border-[#e8e0d8] p-3"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-16 w-16 rounded object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/product/${p.slug}`}
                        className="text-sm font-medium text-[#2d2926] hover:text-[#c4a093] transition-colors line-clamp-1"
                      >
                        {p.name}
                      </Link>
                      <p className="text-xs text-[#9a8d82] mt-0.5">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
