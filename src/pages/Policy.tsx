import { useParams } from "react-router-dom";

const POLICIES: Record<string, { title: string; content: string }> = {
  privacy: {
    title: "Privacy Policy",
    content: `Last updated: March 2026.\n\nLumière Candles collects personal data (name, email, shipping address) solely to fulfil your orders and improve our service. We do not sell your data to third parties. Payment information is processed securely via Razorpay/Stripe and never stored on our servers.\n\nYou may request deletion of your account data at any time by emailing hello@lumiere.in.`,
  },
  shipping: {
    title: "Shipping & Returns",
    content: `Free shipping on orders above ₹3,000 across India. Standard delivery: 4–7 business days. Express: 1–3 business days (₹199).\n\nReturns accepted within 7 days of delivery for sealed, undamaged products. Gift wrapping is non-refundable. Contact us at hello@lumiere.in to initiate a return.`,
  },
  faq: {
    title: "Frequently Asked Questions",
    content: `Q: Are your candles 100% natural?\nA: Yes — we use only natural soy wax, lead-free cotton wicks, and phthalate-free fragrance oils.\n\nQ: How long do candles burn?\nA: Burn times range from 45–60 hours depending on the size. Always follow the care card included in your order.\n\nQ: Can I customise a candle for a gift?\nA: Yes! Select gift wrapping and add a personal message at checkout. For bulk orders, contact us.`,
  },
  terms: {
    title: "Terms of Service",
    content: `By placing an order on lumiere.in you agree to our terms. All prices include applicable taxes. We reserve the right to cancel orders in case of stock unavailability, offering a full refund.\n\nLumière Candles is a brand of Doft Luxe Pvt. Ltd., registered in India.`,
  },
};

/**
 * Static policy pages — Privacy, Shipping & Returns, FAQ, Terms.
 * Route: /policy/:slug
 */
export default function Policy() {
  const { slug } = useParams<{ slug: string }>();
  const policy = POLICIES[slug ?? ""];

  if (!policy) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-sm text-muted">Policy page not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-section">
      <h1 className="font-heading text-3xl font-semibold text-ink mb-8">
        {policy.title}
      </h1>
      <div className="prose prose-sm max-w-none text-dark leading-relaxed">
        {policy.content.split("\n\n").map((para, i) => (
          <p key={i} className="mb-4 whitespace-pre-line">
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}
