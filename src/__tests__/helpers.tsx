/**
 * Shared test utilities — wraps components with the providers
 * needed for routing (MemoryRouter) and renders via RTL.
 */
import { type ReactElement, type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import type { ProductSummary } from "../types/catalog";

interface WrapperProps {
  children: ReactNode;
}

/**
 * Creates a wrapper that provides MemoryRouter context.
 * @param initialEntries - Optional URL entries for the MemoryRouter history.
 */
export function createWrapper(initialEntries: string[] = ["/"]) {
  return function Wrapper({ children }: WrapperProps) {
    return (
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    );
  };
}

/**
 * Render a component inside a MemoryRouter — suitable for
 * components that use `<Link>` but NOT `useParams`.
 * @param ui - The React element to render.
 * @param options - Optional RTL render options + initialEntries.
 */
export function renderWithRouter(
  ui: ReactElement,
  options?: RenderOptions & { initialEntries?: string[] },
) {
  const { initialEntries = ["/"], ...renderOptions } = options ?? {};
  return render(ui, {
    wrapper: createWrapper(initialEntries),
    ...renderOptions,
  });
}

/**
 * Render a _page_ component that calls `useParams` — wraps
 * in `<Routes><Route path="..." element={component} />` so the
 * route parameters are actually populated.
 *
 * @param path - The route path pattern, e.g. `"/product/:slug"`.
 * @param element - The page component to render.
 * @param initialEntry - The actual URL to navigate to, e.g. `"/product/golden-hour"`.
 */
/**
 * Map a legacy mock Product (from data/products) to the ProductSummary shape.
 * Used by tests that pass mock data to components expecting API types.
 */
export function toProductSummary(p: {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  price: number;
  image: string;
  inStock: boolean;
  notes: string[];
  scentFamily: string;
  giftEligible: boolean;
  category: string;
  burnTime: number;
  weight: number;
  description: string;
  hsnCode: string;
  waxType: string;
  ingredients: string;
}): ProductSummary {
  return {
    id: p.id,
    title: p.name,
    slug: p.slug,
    tagline: p.tagline,
    priceCents: p.price * 100,
    compareAtPriceCents: null,
    image: p.image,
    inStock: p.inStock,
    fragranceFamily: p.scentFamily,
    scentNotes: p.notes,
    giftEligible: p.giftEligible,
    collectionSlugs: [p.category],
  };
}

export function renderWithRoute(
  path: string,
  element: ReactElement,
  initialEntry: string,
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path={path} element={element} />
        {/* Catch-all so non-matching URLs don't blow up */}
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </MemoryRouter>,
  );
}
