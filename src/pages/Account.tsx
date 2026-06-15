import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { api } from "../lib/api/client";
import { useApi } from "../lib/hooks/useApi";
import { useAuthStore } from "../stores/auth";
import { useWishlistStore } from "../stores/wishlist";
import { formatPrice } from "../lib/format";
import PageTransition from "../components/PageTransition";
import { PageSkeleton } from "../components/PageSkeleton";
import type { ProductSummary, PaginatedResponse } from "../types/catalog";

/**
 * Account dashboard — order history, saved addresses, wishlist.
 * Redirects to /auth if user is not logged in.
 */
export default function Account() {
  const { user, orders, addresses, logout, removeAddress, setDefaultAddress } =
    useAuthStore();
  const wishlistIds = useWishlistStore((s) => s.ids);

  const productsApi = useApi<ProductSummary[]>(
    () => api.get<PaginatedResponse<ProductSummary>>("/api/products?limit=100"),
    [],
  );

  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    productsApi.execute();
  }, [productsApi.execute]);

  const allProducts = productsApi.data ?? [];
  const catalogError = productsApi.error;
  const wishlistProducts = catalogError ? [] : allProducts.filter((p) => wishlistIds.includes(p.id));

  if (!user) return <Navigate to="/auth" replace />;

  if (productsApi.loading) {
    return (
      <PageTransition>
        <PageSkeleton />
      </PageTransition>
    );
  }

  if (productsApi.error) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-5xl px-6 py-section text-center">
          <p className="body text-muted">Unable to load products. Please try again later.</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
    <div className="mx-auto max-w-5xl px-6 py-section">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="heading-l text-ink">
            My Account
          </h1>
          <p className="mt-1 body text-dark">
            Welcome back, {user.name}
          </p>
        </div>
        <button
          onClick={logout}
          className="micro text-muted hover:text-brass-gold transition-colors"
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
                  className="block px-4 py-2.5 body text-dark hover:bg-warm-sand hover:text-ink transition-colors"
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
              className="micro text-muted mb-4"
            >
              Order History
            </h2>
            {orders.length === 0 ? (
              <div className="border border-dashed border-ink/20 p-8 text-center">
                <p className="body text-muted">
                  Orders feature coming soon — your orders will appear here when
                  available.
                </p>
                  <Link
                    to="/"
                    className="mt-3 inline-block caption text-brass-gold hover:underline"
                  >
                    Shop Now
                </Link>
              </div>
            ) : (
              <ul className="space-y-4" role="list">
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className="border border-hairline p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                    <span className="micro text-ink">
                      #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 ${
                          order.status === "delivered"
                            ? "bg-success/10 text-success"
                            : order.status === "cancelled"
                              ? "bg-error/10 text-error"
                              : "bg-warning/10 text-warning"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted">
                      {new Date(order.date).toLocaleDateString("en-IN")}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {order.items.map((item, i) => (
                        <li
                          key={i}
                          className="flex justify-between body text-dark"
                        >
                          <span>
                            {item.name} × {item.qty}
                          </span>
                          <span>{formatPrice(item.price * item.qty)}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-right text-sm font-semibold text-ink">
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
                className="micro text-muted"
              >
                Saved Addresses
              </h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="caption text-brass-gold hover:underline"
              >
                + Add
              </button>
            </div>
            {addresses.length === 0 ? (
              <p className="body text-muted">No saved addresses.</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2" role="list">
                {addresses.map((addr) => (
                  <li
                    key={addr.id}
                    className={`border p-4 ${addr.isDefault ? "border-brass-gold" : "border-hairline"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="micro text-ink">
                          {addr.label}
                        </p>
                        <p className="mt-1 body text-dark leading-relaxed">
                          {addr.name}
                          <br />
                          {addr.line1}
                          {addr.line2 ? `, ${addr.line2}` : ""}
                          <br />
                          {addr.city}, {addr.state} {addr.postalCode}
                        </p>
                      </div>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-warm-sand text-brass-gold px-2 py-0.5 font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex gap-3">
                      {!addr.isDefault && (
                        <button
                          onClick={() => setDefaultAddress(addr.id)}
                          className="text-xs text-muted hover:text-brass-gold transition-colors"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => removeAddress(addr.id)}
                        className="text-xs text-muted hover:text-red-500 transition-colors"
                        aria-label={`Remove ${addr.label} address`}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {showAddForm && (
              <div className="mt-6 border border-hairline p-6 space-y-4 bg-warm-sand">
                <h3 className="micro text-muted">Add New Address</h3>
                <p className="body-small text-muted">
                  Address management coming soon. Your saved addresses will appear here.
                </p>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="caption text-brass-gold hover:underline"
                >
                  Cancel
                </button>
              </div>
            )}
          </section>

          {/* ── Wishlist ── */}
          <section id="wishlist" aria-labelledby="wishlist-heading">
            <h2
              id="wishlist-heading"
              className="micro text-muted mb-4"
            >
              Wishlist
            </h2>
            {wishlistProducts.length === 0 ? (
              <div className="border border-dashed border-ink/20 p-8 text-center">
                <p className="body text-muted">
                  Your wishlist is empty.
                </p>
                <Link
                  to="/"
                  className="mt-3 inline-block caption text-brass-gold hover:underline"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2" role="list">
                {wishlistProducts.map((p) => (
                  <li
                    key={p.id}
                    className="flex gap-4 border border-hairline p-3"
                  >
                    <img
                      src={p.image}
                      alt={p.title}
                      className="h-16 w-16 object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/product/${p.slug}`}
                        className="body font-medium text-ink hover:text-brass-gold transition-colors line-clamp-1"
                      >
                        {p.title}
                      </Link>
                      <p className="text-xs text-muted mt-0.5">
                        {formatPrice(p.priceCents / 100)}
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
    </PageTransition>
  );
}
