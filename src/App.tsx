import { Routes, Route } from "react-router-dom";
import LayoutShell from "./components/LayoutShell";
import Home from "./pages/Home";
import Product from "./pages/Product";

/**
 * Root application component.
 * Wraps all routes inside the shared LayoutShell (Nav + Footer).
 */
export default function App() {
  return (
    <Routes>
      <Route element={<LayoutShell />}>
        <Route index element={<Home />} />
        <Route path="product/:slug" element={<Product />} />
      </Route>
    </Routes>
  );
}
