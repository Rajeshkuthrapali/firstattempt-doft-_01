import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRoute } from "../helpers";
import Product from "../../pages/Product";
import { useCartStore } from "../../stores/cart";
import { products } from "../../data/products";

const goldenHour = products[0];

beforeEach(() => {
  useCartStore.setState({ items: [] });
});

/**
 * Helper: render the Product page at a specific slug.
 * Uses `renderWithRoute` so that `useParams()` resolves correctly.
 */
function renderPDP(slug: string) {
  return renderWithRoute(
    "/product/:slug",
    <Product />,
    `/product/${slug}`,
  );
}

describe("Product page — valid product (Golden Hour)", () => {
  it("renders the product name", () => {
    renderPDP(goldenHour.slug);
    // Name appears as h1 and potentially also in breadcrumb
    const headings = screen.getAllByText(goldenHour.name);
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the tagline", () => {
    renderPDP(goldenHour.slug);
    expect(screen.getByText(goldenHour.tagline)).toBeInTheDocument();
  });

  it("renders the formatted price with ₹", () => {
    renderPDP(goldenHour.slug);
    const priceElements = screen.getAllByText(/₹/);
    expect(priceElements.length).toBeGreaterThan(0);
  });

  it("renders the product description", () => {
    renderPDP(goldenHour.slug);
    expect(screen.getByText(/mediterranean sunset/i)).toBeInTheDocument();
  });

  it("renders all fragrance notes", () => {
    renderPDP(goldenHour.slug);
    goldenHour.notes.forEach((note) => {
      expect(screen.getByText(note)).toBeInTheDocument();
    });
  });

  it("renders specs grid (burn time, weight, wax)", () => {
    renderPDP(goldenHour.slug);
    expect(screen.getByText("Burn Time")).toBeInTheDocument();
    expect(screen.getByText(`~${goldenHour.burnTime}h`)).toBeInTheDocument();
    expect(screen.getByText("Weight")).toBeInTheDocument();
    expect(screen.getByText(`${goldenHour.weight}g`)).toBeInTheDocument();
    expect(screen.getByText("Wax")).toBeInTheDocument();
    expect(screen.getByText("100% Soy")).toBeInTheDocument();
  });

  it("renders the category pill", () => {
    renderPDP(goldenHour.slug);
    expect(screen.getByText(goldenHour.category)).toBeInTheDocument();
  });

  it("renders trust badges", () => {
    renderPDP(goldenHour.slug);
    expect(screen.getByText(/cruelty free/i)).toBeInTheDocument();
    expect(screen.getByText(/eco packaging/i)).toBeInTheDocument();
    expect(screen.getByText(/cotton wick/i)).toBeInTheDocument();
  });

  it("renders the Add to Cart button (enabled for in-stock)", () => {
    renderPDP(goldenHour.slug);
    const btn = screen.getByText("Add to Cart");
    expect(btn).toBeInTheDocument();
    expect(btn).not.toBeDisabled();
  });

  it("renders breadcrumb navigation with aria-label", () => {
    renderPDP(goldenHour.slug);
    const breadcrumb = screen.getByLabelText("Breadcrumb");
    expect(breadcrumb).toBeInTheDocument();
  });

  it("breadcrumb contains Home and Shop links", () => {
    renderPDP(goldenHour.slug);
    const breadcrumb = screen.getByLabelText("Breadcrumb");
    // "Home" and "Shop" are inside the breadcrumb
    const links = breadcrumb.querySelectorAll("a");
    const linkTexts = Array.from(links).map((l) => l.textContent);
    expect(linkTexts).toContain("Home");
    expect(linkTexts).toContain("Shop");
  });

  it("renders the 'You May Also Like' section", () => {
    renderPDP(goldenHour.slug);
    expect(screen.getByText("You May Also Like")).toBeInTheDocument();
  });

  it("adds product to cart on button click", async () => {
    const user = userEvent.setup();
    renderPDP(goldenHour.slug);

    await user.click(screen.getByText("Add to Cart"));

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].product.id).toBe(goldenHour.id);
    expect(items[0].qty).toBe(1);
  });

  it("shows in-stock message with shipping info", () => {
    renderPDP(goldenHour.slug);
    expect(
      screen.getByText(/free shipping on orders above/i),
    ).toBeInTheDocument();
  });
});

describe("Product page — out-of-stock product (Velvet Rose)", () => {
  const velvetRose = products.find((p) => !p.inStock)!;

  it("renders the Sold Out CTA (disabled)", () => {
    renderPDP(velvetRose.slug);
    const btn = screen.getByText("Sold Out");
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });
});

describe("Product page — invalid slug (404)", () => {
  it("renders Product Not Found heading", () => {
    renderPDP("does-not-exist");
    expect(screen.getByText("Product Not Found")).toBeInTheDocument();
  });

  it("renders a Back to Home link", () => {
    renderPDP("does-not-exist");
    expect(screen.getByText("Back to Home")).toBeInTheDocument();
  });
});
