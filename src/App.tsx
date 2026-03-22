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

        {/* Content & Legal */}
        <Route path="contact" element={<Contact />} />
        <Route path="policy/:slug" element={<Policy />} />
      </Route>
    </Routes>
  );
}
