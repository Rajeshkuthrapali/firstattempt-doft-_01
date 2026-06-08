"use client";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cart";
import { Link } from "react-router-dom";

export function CartSidebar() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalPrice,
    totalItems,
  } = useCartStore();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50" onClick={closeCart} />
      <div className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-surface shadow-2xl animate-slide-in">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-heading text-xl font-bold">Your Cart</h2>
          <button
            onClick={closeCart}
            className="text-text-muted hover:text-text"
            aria-label="Close cart"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="py-12 text-center text-text-muted">
              Your cart is empty
            </p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.variantId}
                  className="flex gap-4 border-b border-border-light pb-4"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-bg-secondary">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        to={`/products/${item.slug}`}
                        className="text-sm font-medium hover:text-primary"
                        onClick={closeCart}
                      >
                        {item.title}
                      </Link>
                      {item.variantTitle !== "Single" && (
                        <p className="text-xs text-text-muted">
                          {item.variantTitle}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity - 1)
                          }
                          className="flex h-7 w-7 items-center justify-center border border-border text-xs hover:border-primary"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity + 1)
                          }
                          className="flex h-7 w-7 items-center justify-center border border-border text-xs hover:border-primary"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-primary">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-text-muted hover:text-accent"
                          aria-label="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5">
            <div className="mb-4 flex justify-between text-lg font-bold">
              <span>Total ({totalItems()} items)</span>
              <span className="text-primary">${totalPrice().toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="block w-full bg-primary py-3.5 text-center text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-accent"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
