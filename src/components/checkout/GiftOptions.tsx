import { formatPrice } from "../../lib/format";
import { trackGiftOptionSelected } from "../../lib/analytics";
import type { GiftOptions as GiftOptionsType } from "../../stores/checkout";

interface GiftOptionsProps {
  gift: GiftOptionsType;
  setGift: (partial: Partial<GiftOptionsType>) => void;
}

const GIFT_PRICES: Record<GiftOptionsType["wrapping"], number> = {
  none: 0,
  standard: 99,
  premium: 249,
};

/**
 * Gift wrapping options panel with wrapping style selection,
 * personal message, and scheduled delivery.
 */
export default function GiftOptions({ gift, setGift }: GiftOptionsProps) {
  return (
    <div className="mt-8 rounded border border-hairline p-5">
      <div className="flex items-center gap-3 mb-4">
        <input
          id="gift-wrap-toggle"
          type="checkbox"
          checked={gift.enabled}
          onChange={(e) => {
            setGift({ enabled: e.target.checked });
            if (e.target.checked)
              trackGiftOptionSelected(gift.wrapping, !!gift.message);
          }}
          className="accent-brass-gold h-4 w-4"
        />
        <label
          htmlFor="gift-wrap-toggle"
          className="text-sm font-medium text-ink cursor-pointer"
        >
          Add Gift Wrapping 🎁
        </label>
      </div>

      {gift.enabled && (
        <div className="space-y-4 animate-in">
          <fieldset>
            <legend className="text-xs font-medium uppercase tracking-widest text-muted mb-2">
              Wrapping Style
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {(["none", "standard", "premium"] as const).map((w) => (
                <label
                  key={w}
                  className={`border p-3 text-center cursor-pointer transition-colors ${gift.wrapping === w ? "border-brass-gold bg-[#fdf6f3]" : "border-hairline hover:border-brass-gold"}`}
                >
                  <input
                    type="radio"
                    name="wrapping"
                    value={w}
                    checked={gift.wrapping === w}
                    onChange={() => {
                      setGift({ wrapping: w });
                      trackGiftOptionSelected(w, !!gift.message);
                    }}
                    className="sr-only"
                  />
                  <span className="block text-xs font-semibold capitalize text-ink">
                    {w}
                  </span>
                  <span className="block text-[10px] text-muted">
                    {w === "none"
                      ? "Free"
                      : `+${formatPrice(GIFT_PRICES[w])}`}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="gift-message"
              className="block text-xs font-medium uppercase tracking-widest text-muted mb-1"
            >
              Personal Message{" "}
              <span className="normal-case">(optional, max 200 chars)</span>
            </label>
            <textarea
              id="gift-message"
              maxLength={200}
              rows={3}
              value={gift.message}
              onChange={(e) => setGift({ message: e.target.value })}
              placeholder="Write a heartfelt message for the recipient…"
              className="w-full border border-hairline bg-white px-4 py-3 text-sm text-ink placeholder:text-[#c4b8b0] outline-none focus:border-ink transition-colors resize-none"
            />
            <p className="mt-1 text-right text-[10px] text-muted">
              {gift.message.length}/200
            </p>
          </div>

          <div>
            <label
              htmlFor="scheduled-delivery"
              className="block text-xs font-medium uppercase tracking-widest text-muted mb-1"
            >
              Scheduled Delivery Date{" "}
              <span className="normal-case">(optional)</span>
            </label>
            <input
              id="scheduled-delivery"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={gift.scheduledDeliveryDate ? new Date(gift.scheduledDeliveryDate).toISOString().split("T")[0] : ""}
              onChange={(e) => setGift({ scheduledDeliveryDate: e.target.value ? new Date(e.target.value) : null })}
              className="w-full border border-hairline bg-white px-4 py-3 text-sm text-ink outline-none focus:border-ink transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
}
