import { Routes, Route } from "react-router-dom";
import LayoutShell from "./components/LayoutShell";
import Home from "./pages/Home";
import Product from "./pages/Product";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Collections from "./pages/Collections";
import Search from "./pages/Search";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import Policy from "./pages/Policy";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminInventory from "./pages/admin/AdminInventory";

import AccountLoyalty from "./pages/AccountLoyalty";
import GiftRegistry from "./pages/GiftRegistry";

/**
 * Root application component.
 * All routes wrapped in the shared LayoutShell (Nav + Footer + SearchBar).
 */
export default function App() {
  return (
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
        <Route path="account/loyalty" element={<AccountLoyalty />} />
        
        {/* Gifting */}
        <Route path="registry" element={<GiftRegistry />} />

        {/* Blog / Editorial */}
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogArticle />} />

        {/* Content & Legal */}
        <Route path="contact" element={<Contact />} />
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
  );
}

