import { formatPrice } from "../../lib/format";
import type { GiftOptions } from "../../stores/checkout";

interface OrderSummaryProps {
  totalPrice: number;
  gift: GiftOptions;
  giftSurcharge: number;
  grandTotal: number;
}

/**
 * Order summary sidebar showing subtotal, gift wrapping surcharge,
 * shipping estimate, and grand total.
 */
export default function OrderSummary({
  totalPrice,
  gift,
  giftSurcharge,
  grandTotal,
}: OrderSummaryProps) {
  return (
    <aside className="lg:col-span-2" aria-label="Order total">
      <div className="rounded border border-hairline p-6 sticky top-32">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted mb-4">
          Order Summary
        </h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-dark">Subtotal</dt>
            <dd className="font-medium text-ink">
              {formatPrice(totalPrice)}
            </dd>
          </div>
          {gift.enabled && gift.wrapping !== "none" && (
            <div className="flex justify-between">
              <dt className="text-dark">
                Gift Wrapping ({gift.wrapping})
              </dt>
              <dd className="font-medium text-ink">
                +{formatPrice(giftSurcharge)}
              </dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-dark">Shipping</dt>
            <dd className="font-medium text-green-600">
              {totalPrice >= 3000 ? "Free" : formatPrice(99)}
            </dd>
          </div>
          <div className="border-t border-hairline pt-2 flex justify-between text-base font-semibold">
            <dt className="text-ink">Total</dt>
            <dd className="text-ink">
              {formatPrice(grandTotal + (totalPrice < 3000 ? 99 : 0))}
            </dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
