import { useRef, useEffect } from "react";
import { useUiStore } from "../stores/ui";
import { useCartStore } from "../stores/cart";

/**
 * Cart drawer — light luxury style: white background,
 * dusty-rose accent banner, clean typography, and a slide-in
 * panel from the right. Auto-focuses when opened for keyboard a11y.
 */
export default function CartDrawer() {
  const { cartOpen, closeCart } = useUiStore();
  const { items, addItem, removeItem, deleteLine, clearCart, totalPrice } =
    useCartStore();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  /** Move focus into drawer when it opens */
  useEffect(() => {
    if (cartOpen) {
      // Short delay to let the transition begin before focusing
      const timer = setTimeout(() => closeBtnRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [cartOpen]);

  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalPrice());

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 transition-opacity duration-300 ${
          cartOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        id="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 z-[70] flex h-full w-full max-w-[420px] flex-col bg-white shadow-elevated transition-transform duration-300 ease-in-out ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Header ─────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-[15px] font-bold uppercase tracking-[0.2em] text-[#2d2926]">
            Cart
          </h2>
          <button
            id="close-cart"
            ref={closeBtnRef}
            onClick={closeCart}
            className="p-1 text-[#2d2926] hover:text-[#c4a093] transition-colors"
            aria-label="Close cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        {/* ── Free shipping banner ───────────── */}
        <div className="mx-0 bg-[#c4a093] py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-white">
          Free Shipping on Orders Above{" "}
          <span className="font-bold">INR 3000/-</span>
        </div>

        {/* ── Items list ─────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-28 text-center">
              <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-[#9a8d82]">
                Your cart is empty
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-5">
              {items.map(({ product, qty }) => (
                <li
                  key={product.id}
                  className="flex gap-4 border-b border-[#f0ebe5] pb-5 last:border-0 last:pb-0"
                >
                  {/* Product image */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-24 w-20 flex-shrink-0 rounded-md object-cover bg-[#f3ece4]"
                  />

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-[#2d2926]">
                        {product.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#9a8d82]">
                        {formatPrice(product.price)} each
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Qty controls */}
                      <div className="flex items-center border border-[#e8e0d8] rounded-sm">
                        <button
                          onClick={() => removeItem(product.id)}
                          className="px-2.5 py-1 text-[13px] text-[#6b5e54] hover:text-[#2d2926] transition-colors"
                          aria-label={`Decrease ${product.name} quantity`}
                        >
                          −
                        </button>
                        <span className="min-w-[2rem] text-center text-[12px] font-medium text-[#2d2926] border-x border-[#e8e0d8] py-1">
                          {qty}
                        </span>
                        <button
                          onClick={() => addItem(product)}
                          className="px-2.5 py-1 text-[13px] text-[#6b5e54] hover:text-[#2d2926] transition-colors"
                          aria-label={`Increase ${product.name} quantity`}
                        >
                          +
                        </button>
                      </div>

                      {/* Line total + remove */}
                      <div className="flex items-center gap-3">
                        <span className="text-[13px] font-medium text-[#2d2926]">
                          {formatPrice(product.price * qty)}
                        </span>
                        <button
                          onClick={() => deleteLine(product.id)}
                          className="text-[#9a8d82] hover:text-[#c96b6b] transition-colors"
                          aria-label={`Remove ${product.name} from cart`}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Footer / checkout ──────────────── */}
        {items.length > 0 && (
          <div className="border-t border-[#e8e0d8] px-6 py-5 space-y-4 bg-[#faf7f4]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] uppercase tracking-[0.15em] text-[#9a8d82]">
                Subtotal
              </span>
              <span className="text-[16px] font-semibold text-[#2d2926]">
                {formattedTotal}
              </span>
            </div>

            <p className="text-[11px] text-[#9a8d82] text-center">
              Shipping & taxes calculated at checkout
            </p>

            <button
              id="checkout-btn"
              className="w-full bg-[#c4a093] py-3.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a8877b] active:scale-[0.98]"
            >
              Checkout
            </button>

            <button
              onClick={clearCart}
              className="w-full text-center text-[11px] text-[#9a8d82] hover:text-[#c96b6b] transition-colors underline underline-offset-2"
            >
              Clear cart
            </button>
          </div>
        )}
      </aside>

      {/* ── WhatsApp FAB (matches reference) ─── */}
      <a
        href="https://wa.me/919876543210"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg hover:bg-[#20bd5a] transition-colors"
        aria-label="Chat on WhatsApp"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </>
  );
}
