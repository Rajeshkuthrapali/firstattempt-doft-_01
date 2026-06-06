import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../helpers";
import ProductCard from "../../components/ProductCard";
import { products } from "../../data/products";
import { useCartStore } from "../../stores/cart";

const inStockProduct = products.find((p) => p.inStock)!;
const outOfStockProduct = products.find((p) => !p.inStock)!;

beforeEach(() => {
  useCartStore.setState({ items: [] });
});

describe("ProductCard — rendering", () => {
  it("renders the product name", () => {
    renderWithRouter(<ProductCard product={inStockProduct} />);
    expect(screen.getByText(inStockProduct.name)).toBeInTheDocument();
  });

  it("renders the product tagline", () => {
    renderWithRouter(<ProductCard product={inStockProduct} />);
    expect(screen.getByText(inStockProduct.tagline)).toBeInTheDocument();
  });

  it("renders the formatted INR price", () => {
    renderWithRouter(<ProductCard product={inStockProduct} />);
    const priceElement = screen.getByText(/₹/);
    expect(priceElement).toBeInTheDocument();
  });

  it("renders the product image with correct alt text", () => {
    renderWithRouter(<ProductCard product={inStockProduct} />);
    const img = screen.getByAltText(inStockProduct.name);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", inStockProduct.image);
  });

  it("renders the product card as an article element", () => {
    renderWithRouter(<ProductCard product={inStockProduct} />);
    const article = screen.getByRole("article");
    expect(article).toBeInTheDocument();
  });

  it("links to the correct product detail page", () => {
    renderWithRouter(<ProductCard product={inStockProduct} />);
    const link = screen.getByLabelText(`View ${inStockProduct.name} details`);
    expect(link).toHaveAttribute("href", `/product/${inStockProduct.slug}`);
  });
});

describe("ProductCard — out of stock", () => {
  it("displays a 'Sold Out' overlay for out-of-stock products", () => {
    renderWithRouter(<ProductCard product={outOfStockProduct} />);
    // Both the overlay text and the quick-add button say "Sold Out"
    const soldOuts = screen.getAllByText("Sold Out");
    expect(soldOuts.length).toBeGreaterThanOrEqual(1);
  });
});

describe("ProductCard — category badges", () => {
  it("shows 'Limited Edition' badge for limited products", () => {
    const limited = products.find((p) => p.category === "limited")!;
    renderWithRouter(<ProductCard product={limited} />);
    expect(screen.getByText("Limited Edition")).toBeInTheDocument();
  });

  it("shows 'Seasonal' badge for seasonal products", () => {
    const seasonal = products.find((p) => p.category === "seasonal")!;
    renderWithRouter(<ProductCard product={seasonal} />);
    expect(screen.getByText("Seasonal")).toBeInTheDocument();
  });
});

describe("ProductCard — quick add", () => {
  it("adds item to the cart when quick-add is clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<ProductCard product={inStockProduct} />);

    const quickAddBtn = screen.getByText("Quick Add");
    await user.click(quickAddBtn);

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].product.id).toBe(inStockProduct.id);
  });

  it("quick-add button is disabled for out-of-stock products", () => {
    renderWithRouter(<ProductCard product={outOfStockProduct} />);
    const btn = document.getElementById(`quick-add-${outOfStockProduct.slug}`);
    expect(btn).toBeDisabled();
  });
});
