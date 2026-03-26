import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import QuickViewModal from "../../components/QuickViewModal";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockCloseQuickView = vi.fn();
const mockAddItem = vi.fn();

// QuickViewModal calls useUiStore() with NO selector — it destructures the
// entire state. So the mock must return the full state object directly.
vi.mock("../../stores/ui", () => ({
  useUiStore: () => ({
    quickViewProductId: "lum-001",
    openQuickView: vi.fn(),
    closeQuickView: mockCloseQuickView,
    navOpen: false,
    cartOpen: false,
    searchOpen: false,
    toggleNav: vi.fn(),
    closeNav: vi.fn(),
    toggleCart: vi.fn(),
    closeCart: vi.fn(),
    toggleSearch: vi.fn(),
    closeSearch: vi.fn(),
  }),
}));

// useCartStore IS used with a selector: (s) => s.addItem
vi.mock("../../stores/cart", () => ({
  useCartStore: (selector: (s: object) => unknown) =>
    selector({ addItem: mockAddItem, items: [], removeItem: vi.fn(), clearCart: vi.fn() }),
}));

vi.mock("../../lib/analytics", () => ({
  trackAddToCart: vi.fn(),
  trackQuickView: vi.fn(),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderModal() {
  return render(
    <MemoryRouter>
      <QuickViewModal />
    </MemoryRouter>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("QuickViewModal", () => {
  beforeEach(() => {
    mockCloseQuickView.mockClear();
    mockAddItem.mockClear();
  });

  it("renders the product name when a product ID is set", () => {
    renderModal();
    expect(screen.getByText("Golden Hour")).toBeInTheDocument();
  });

  it("renders the product tagline", () => {
    renderModal();
    expect(screen.getByText(/warm amber meets sun-kissed vanilla/i)).toBeInTheDocument();
  });

  it("renders scent notes", () => {
    renderModal();
    expect(screen.getByText("Amber")).toBeInTheDocument();
    expect(screen.getByText("Vanilla")).toBeInTheDocument();
    expect(screen.getByText("Sandalwood")).toBeInTheDocument();
  });

  it("renders burn time and weight details", () => {
    renderModal();
    expect(screen.getByText("55h")).toBeInTheDocument();
    expect(screen.getByText("280g")).toBeInTheDocument();
  });

  it("calls closeQuickView when close button is clicked", () => {
    renderModal();
    fireEvent.click(screen.getByRole("button", { name: /close quick view/i }));
    expect(mockCloseQuickView).toHaveBeenCalledOnce();
  });

  it("calls closeQuickView when backdrop is clicked", () => {
    const { container } = renderModal();
    const backdrop = container.querySelector("[aria-hidden='true']") as HTMLElement;
    fireEvent.click(backdrop);
    expect(mockCloseQuickView).toHaveBeenCalledOnce();
  });

  it("calls addItem and closes modal when Add to Cart is clicked", () => {
    renderModal();
    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
    expect(mockAddItem).toHaveBeenCalledOnce();
    expect(mockCloseQuickView).toHaveBeenCalledOnce();
  });

  it("has correct dialog accessibility attributes", () => {
    renderModal();
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "Quick view: Golden Hour");
  });

  it("renders a View Full Details link to the product page", () => {
    renderModal();
    expect(screen.getByRole("link", { name: /view full details/i })).toBeInTheDocument();
  });
});
