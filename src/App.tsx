import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import LayoutShell from "./components/LayoutShell";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";

/* ── Lazy-loaded page components ──────────────── */
const Home = lazy(() => import("./pages/Home"));
const Product = lazy(() => import("./pages/Product"));
const Auth = lazy(() => import("./pages/Auth"));
const Account = lazy(() => import("./pages/Account"));
const Collections = lazy(() => import("./pages/Collections"));
const Search = lazy(() => import("./pages/Search"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Policy = lazy(() => import("./pages/Policy"));

/* Admin */
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminInventory = lazy(() => import("./pages/admin/AdminInventory"));

/**
 * Root application component.
 * All page components are lazy-loaded with a shared Suspense + LoadingSpinner
 * fallback. A top-level ErrorBoundary catches render errors on any route.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route element={<LayoutShell />}>
            {/* Core */}
            <Route index element={<Home />} />
            <Route path="product/:slug" element={<Product />} />

            {/* Catalog */}
            <Route path="collections" element={<Collections />} />
            <Route path="search" element={<Search />} />

            {/* Checkout */}
            <Route path="checkout" element={<Checkout />} />

            {/* Auth & Account */}
            <Route path="auth" element={<Auth />} />
            <Route path="account" element={<Account />} />

            {/* Content & Legal */}
            <Route path="policy/:slug" element={<Policy />} />
          </Route>

          {/* Admin — own layout with sidebar + role guard */}
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="inventory" element={<AdminInventory />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
