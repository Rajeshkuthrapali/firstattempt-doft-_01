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
      <div className="rounded border border-[#e8e0d8] p-6 sticky top-32">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8d82] mb-4">
          Order Summary
        </h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-[#6b5e54]">Subtotal</dt>
            <dd className="font-medium text-[#2d2926]">
              {formatPrice(totalPrice)}
            </dd>
          </div>
          {gift.enabled && gift.wrapping !== "none" && (
            <div className="flex justify-between">
              <dt className="text-[#6b5e54]">
                Gift Wrapping ({gift.wrapping})
              </dt>
              <dd className="font-medium text-[#2d2926]">
                +{formatPrice(giftSurcharge)}
              </dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-[#6b5e54]">Shipping</dt>
            <dd className="font-medium text-green-600">
              {totalPrice >= 3000 ? "Free" : formatPrice(99)}
            </dd>
          </div>
          <div className="border-t border-[#e8e0d8] pt-2 flex justify-between text-base font-semibold">
            <dt className="text-[#2d2926]">Total</dt>
            <dd className="text-[#2d2926]">
              {formatPrice(grandTotal + (totalPrice < 3000 ? 99 : 0))}
            </dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
