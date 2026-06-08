import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter, toProductSummary } from "../helpers";
import ProductCard from "../../components/ProductCard";
import { products } from "../../../backup/06-mock-data/products";
import { useCartStore } from "../../stores/cart";

const inStockProduct = toProductSummary(products.find((p) => p.inStock)!);
const outOfStockProduct = toProductSummary(products.find((p) => !p.inStock)!);

beforeEach(() => {
  useCartStore.setState({ items: [] });
});

describe("ProductCard — rendering", () => {
  it("renders the product name in a heading", () => {
    renderWithRouter(<ProductCard product={inStockProduct} />);
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent(inStockProduct.title);
  });

  it("renders the product tagline", () => {
    renderWithRouter(<ProductCard product={inStockProduct} />);
    const taglines = screen.getAllByText(inStockProduct.tagline!);
    expect(taglines.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the formatted INR price", () => {
    renderWithRouter(<ProductCard product={inStockProduct} />);
    const prices = screen.getAllByText(/₹/);
    expect(prices.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the product image with correct alt text", () => {
    renderWithRouter(<ProductCard product={inStockProduct} />);
    const images = screen.getAllByAltText(inStockProduct.title);
    expect(images.length).toBeGreaterThanOrEqual(1);
    expect(images[0]).toHaveAttribute("src", inStockProduct.image);
  });

  it("renders the product card as an article element", () => {
    renderWithRouter(<ProductCard product={inStockProduct} />);
    const articles = screen.getAllByRole("article");
    expect(articles.length).toBeGreaterThanOrEqual(1);
  });

  it("links to the correct product detail page", () => {
    renderWithRouter(<ProductCard product={inStockProduct} />);
    // There may be multiple links with the same aria-label (image + text)
    const links = screen.getAllByLabelText(`View ${inStockProduct.title} details`);
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0]).toHaveAttribute("href", `/product/${inStockProduct.slug}`);
  });
});

describe("ProductCard — out of stock", () => {
  it("displays a 'Sold Out' overlay for out-of-stock products", () => {
    renderWithRouter(<ProductCard product={outOfStockProduct} />);
    const soldOuts = screen.getAllByText("Sold Out");
    expect(soldOuts.length).toBeGreaterThanOrEqual(1);
  });
});

describe("ProductCard — category badges", () => {
  it("shows 'Limited Edition' badge for limited products", () => {
    const limited = toProductSummary(products.find((p) => p.category === "limited")!);
    renderWithRouter(<ProductCard product={limited} />);
    const badges = screen.getAllByText("Limited Edition");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("shows 'Seasonal' badge for seasonal products", () => {
    const seasonal = toProductSummary(products.find((p) => p.category === "seasonal")!);
    renderWithRouter(<ProductCard product={seasonal} />);
    expect(screen.getByText("Seasonal")).toBeInTheDocument();
  });
});

describe("ProductCard — quick add", () => {
  it("adds item to the cart when quick-add is clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<ProductCard product={inStockProduct} />);

    const quickAddBtn = document.getElementById(`quick-add-${inStockProduct.slug}`);
    expect(quickAddBtn).not.toBeNull();
    await user.click(quickAddBtn!);

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe(inStockProduct.id);
  });

  it("quick-add button is disabled for out-of-stock products", () => {
    renderWithRouter(<ProductCard product={outOfStockProduct} />);
    const btn = document.getElementById(`quick-add-${outOfStockProduct.slug}`);
    expect(btn).toBeDisabled();
  });
});
