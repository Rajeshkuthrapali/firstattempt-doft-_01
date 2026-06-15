import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../helpers";
import CartDrawer from "../../components/CartDrawer";
import { useCartStore } from "../../stores/cart";
import { useUiStore } from "../../stores/ui";
import { products } from "../../../backup/06-mock-data/products";

const goldenHour = products[0];

function makeCartItem(product: (typeof products)[number]) {
  return {
    productId: product.id,
    variantId: product.id,
    title: product.name,
    variantTitle: "Single",
    price: product.price,
    image: product.image,
    slug: product.slug,
    maxStock: product.inStock ? 100 : 0,
  };
}

beforeEach(() => {
  useCartStore.setState({ items: [] });
  useUiStore.setState({ cartOpen: true, navOpen: false });
});

describe("CartDrawer — structure", () => {
  it("renders the CART heading", () => {
    renderWithRouter(<CartDrawer />);
    expect(screen.getByText("Cart")).toBeInTheDocument();
  });

  it("has role='dialog' and aria-modal on the aside", () => {
    renderWithRouter(<CartDrawer />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "Shopping cart");
  });

  it("renders the free shipping banner", () => {
    renderWithRouter(<CartDrawer />);
    expect(
      screen.getByText(/free shipping on orders above/i),
    ).toBeInTheDocument();
  });

  it("renders the close button with ARIA label", () => {
    renderWithRouter(<CartDrawer />);
    expect(screen.getByLabelText("Close cart")).toBeInTheDocument();
  });

});

describe("CartDrawer — empty state", () => {
  it("shows empty cart message when no items", () => {
    renderWithRouter(<CartDrawer />);
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it("does not show checkout button when empty", () => {
    renderWithRouter(<CartDrawer />);
    expect(screen.queryByText("Checkout")).not.toBeInTheDocument();
  });
});

describe("CartDrawer — with items", () => {
  beforeEach(() => {
    useCartStore.getState().addItem(makeCartItem(goldenHour));
  });

  it("displays the product name in the cart", () => {
    renderWithRouter(<CartDrawer />);
    expect(screen.getByText(goldenHour.name)).toBeInTheDocument();
  });

  it("displays the per-item price", () => {
    renderWithRouter(<CartDrawer />);
    expect(screen.getByText(/each/)).toBeInTheDocument();
  });

  it("shows the checkout button when items are present", () => {
    renderWithRouter(<CartDrawer />);
    expect(screen.getByText("Checkout")).toBeInTheDocument();
  });

  it("shows the subtotal section", () => {
    renderWithRouter(<CartDrawer />);
    expect(screen.getByText("Subtotal")).toBeInTheDocument();
  });

  it("shows shipping notice", () => {
    renderWithRouter(<CartDrawer />);
    expect(
      screen.getByText(/shipping & taxes calculated at checkout/i),
    ).toBeInTheDocument();
  });
});

describe("CartDrawer — quantity controls", () => {
  beforeEach(() => {
    useCartStore.getState().addItem(makeCartItem(goldenHour));
  });

  it("has increase quantity button with ARIA label", () => {
    renderWithRouter(<CartDrawer />);
    expect(
      screen.getByLabelText(`Increase ${goldenHour.name} quantity`),
    ).toBeInTheDocument();
  });

  it("has decrease quantity button with ARIA label", () => {
    renderWithRouter(<CartDrawer />);
    expect(
      screen.getByLabelText(`Decrease ${goldenHour.name} quantity`),
    ).toBeInTheDocument();
  });

  it("has remove button with ARIA label", () => {
    renderWithRouter(<CartDrawer />);
    expect(
      screen.getByLabelText(`Remove ${goldenHour.name} from cart`),
    ).toBeInTheDocument();
  });

  it("increments qty when + is clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<CartDrawer />);

    const incBtn = screen.getByLabelText(
      `Increase ${goldenHour.name} quantity`,
    );
    await user.click(incBtn);

    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it("removes the item when − is clicked at qty=1", async () => {
    const user = userEvent.setup();
    renderWithRouter(<CartDrawer />);

    const decBtn = screen.getByLabelText(
      `Decrease ${goldenHour.name} quantity`,
    );
    await user.click(decBtn);

    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe("CartDrawer — clear cart", () => {
  it("clears all items when Clear cart is clicked", async () => {
    useCartStore.getState().addItem(makeCartItem(goldenHour));
    const user = userEvent.setup();
    renderWithRouter(<CartDrawer />);

    const clearBtn = screen.getByText("Clear cart");
    await user.click(clearBtn);

    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
