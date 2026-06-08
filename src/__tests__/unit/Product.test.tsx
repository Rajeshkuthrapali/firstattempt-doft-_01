import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRoute } from "../helpers";
import Product from "../../pages/Product";
import { useCartStore } from "../../stores/cart";
import type { ProductDetail } from "../../types/catalog";

// ── Mock API client ──────────────────────────────────────────────────────────

const mockProduct: ProductDetail = {
  id: "candle-golden-hour",
  title: "Golden Hour",
  slug: "golden-hour",
  tagline: "A warm Mediterranean sunset in a jar",
  description:
    "Notes of saffron, amber, and a whisper of sea salt — a mediterranean sunset captured in wax.",
  priceCents: 249900,
  compareAtPriceCents: null,
  image: "/images/golden-hour.jpg",
  images: ["/images/golden-hour.jpg", "/images/golden-hour-alt.jpg"],
  inStock: true,
  fragranceFamily: "Warm & Spicy",
  scentNotes: ["Saffron", "Amber", "Sea Salt"],
  burnTime: 55,
  weight: 300,
  waxType: "Soy",
  giftEligible: true,
  collectionSlugs: ["signature"],
  hsnCode: "34060010",
  ingredients: "100% natural soy wax, phthalate-free fragrance oils",
  variants: [],
  collections: [{ id: "col-signature", title: "Signature", slug: "signature" }],
  relatedProducts: [
    {
      id: "candle-midnight-oud",
      title: "Midnight Oud",
      slug: "midnight-oud",
      tagline: "Deep and mysterious",
      priceCents: 349900,
      compareAtPriceCents: null,
      image: "/images/midnight-oud.jpg",
      inStock: true,
      fragranceFamily: "Woody",
      scentNotes: ["Oud", "Rose"],
      giftEligible: true,
      collectionSlugs: ["signature"],
    },
  ],
};

const mockOutOfStockProduct: ProductDetail = {
  ...mockProduct,
  id: "candle-velvet-rose",
  title: "Velvet Rose",
  slug: "velvet-rose",
  inStock: false,
  collectionSlugs: ["limited"],
};

vi.mock("../../lib/api/client", () => ({
  api: {
    get: vi.fn((url: string) => {
      if (url === "/api/products/velvet-rose") {
        return Promise.resolve({ success: true, data: mockOutOfStockProduct });
      }
      if (url === "/api/products/does-not-exist") {
        return Promise.resolve({
          success: false,
          data: null,
          error: "Product not found",
        });
      }
      // default — golden-hour
      return Promise.resolve({ success: true, data: mockProduct });
    }),
  },
}));

// ── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  useCartStore.setState({ items: [] });
});

/**
 * Helper: render the Product page at a specific slug.
 */
function renderPDP(slug: string) {
  return renderWithRoute("/product/:slug", <Product />, `/product/${slug}`);
}

describe("Product page — valid product (Golden Hour)", () => {
  it("renders the product name", async () => {
    renderPDP("golden-hour");
    const heading = await screen.findByRole("heading", { name: /golden hour/i });
    expect(heading).toBeInTheDocument();
  });

  it("renders the tagline", async () => {
    renderPDP("golden-hour");
    expect(await screen.findByText(mockProduct.tagline!)).toBeInTheDocument();
  });

  it("renders the formatted price with ₹", async () => {
    renderPDP("golden-hour");
    // Match the specific product price (₹2,499), not the shipping message ₹3,000
    expect(await screen.findByText(/₹2,499/)).toBeInTheDocument();
  });

  it("renders the product description", async () => {
    renderPDP("golden-hour");
    expect(
      await screen.findByText(/saffron, amber/i),
    ).toBeInTheDocument();
  });

  it("renders all fragrance notes", async () => {
    renderPDP("golden-hour");
    for (const note of mockProduct.scentNotes) {
      expect(await screen.findByText(note)).toBeInTheDocument();
    }
  });

  it("renders specs grid (burn time, weight, wax)", async () => {
    renderPDP("golden-hour");
    expect(await screen.findByText("Burn Time")).toBeInTheDocument();
    expect(await screen.findByText(`~${mockProduct.burnTime}h`)).toBeInTheDocument();
    expect(await screen.findByText("Weight")).toBeInTheDocument();
    expect(await screen.findByText(`${mockProduct.weight}g`)).toBeInTheDocument();
    expect(await screen.findByText("Wax")).toBeInTheDocument();
    expect(await screen.findByText("100% Soy")).toBeInTheDocument();
  });

  it("renders the category pill", async () => {
    renderPDP("golden-hour");
    expect(await screen.findByText("signature")).toBeInTheDocument();
  });

  it("renders trust badges", async () => {
    renderPDP("golden-hour");
    expect(await screen.findByText(/cruelty free/i)).toBeInTheDocument();
    expect(await screen.findByText(/eco packaging/i)).toBeInTheDocument();
    expect(await screen.findByText(/cotton wick/i)).toBeInTheDocument();
  });

  it("renders the Add to Cart button (enabled for in-stock)", async () => {
    renderPDP("golden-hour");
    const btn = await screen.findByText("Add to Cart");
    expect(btn).toBeInTheDocument();
    expect(btn).not.toBeDisabled();
  });

  it("renders breadcrumb navigation with aria-label", async () => {
    renderPDP("golden-hour");
    expect(await screen.findByLabelText("Breadcrumb")).toBeInTheDocument();
  });

  it("breadcrumb contains Home and Shop links", async () => {
    renderPDP("golden-hour");
    const breadcrumb = await screen.findByLabelText("Breadcrumb");
    const links = breadcrumb.querySelectorAll("a");
    const linkTexts = Array.from(links).map((l) => l.textContent);
    expect(linkTexts).toContain("Home");
    expect(linkTexts).toContain("Shop");
  });

  it("renders the 'You May Also Like' section", async () => {
    renderPDP("golden-hour");
    expect(await screen.findByText("You May Also Like")).toBeInTheDocument();
  });

  it("adds product to cart on button click", async () => {
    const user = userEvent.setup();
    renderPDP("golden-hour");

    const btn = await screen.findByText("Add to Cart");
    await user.click(btn);

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe(mockProduct.id);
    expect(items[0].quantity).toBe(1);
  });

  it("shows in-stock message with shipping info", async () => {
    renderPDP("golden-hour");
    expect(
      await screen.findByText(/free shipping on orders above/i),
    ).toBeInTheDocument();
  });
});

describe("Product page — out-of-stock product (Velvet Rose)", () => {
  it("renders the Sold Out CTA (disabled)", async () => {
    renderPDP("velvet-rose");
    const btn = await screen.findByText("Sold Out");
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });
});

describe("Product page — invalid slug (404)", () => {
  it("renders Product Not Found heading", async () => {
    renderPDP("does-not-exist");
    expect(await screen.findByText("Product Not Found")).toBeInTheDocument();
  });

  it("renders a Back to Home link", async () => {
    renderPDP("does-not-exist");
    expect(await screen.findByText("Back to Home")).toBeInTheDocument();
  });
});
