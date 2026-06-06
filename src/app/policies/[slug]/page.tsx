import Link from "next/link";
const POLICY_FALLBACKS: Record<string, { title: string; content: string[] }> = {
  shipping: {
    title: "Shipping Policy",
    content: [
      "We offer free standard shipping on all orders over $50.",
      "Standard shipping takes 5–7 business days.",
    ],
  },
  returns: {
    title: "Returns & Exchange Policy",
    content: [
      "You may return items within 14 days of delivery.",
      "Items must be unused and in original packaging.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    content: [
      "We respect your privacy and protect your personal information.",
      "We never sell your data.",
    ],
  },
  terms: {
    title: "Terms of Service",
    content: [
      "By using our website, you agree to these terms.",
      "Prices are subject to change without notice.",
    ],
  },
  refund: {
    title: "Refund Policy",
    content: [
      "Refunds are processed within 5–7 business days.",
      "Shipping costs are non-refundable.",
    ],
  },
};
export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fallback = POLICY_FALLBACKS[slug];
  if (!fallback)
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="font-heading text-3xl font-bold text-primary">
          Policy Not Found
        </h1>
        <Link
          href="/"
          className="mt-6 inline-block text-sm text-primary underline"
        >
          Go Home
        </Link>
      </div>
    );
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-heading text-4xl font-bold text-primary">
        {fallback.title}
      </h1>
      <div className="mt-8 space-y-4">
        {fallback.content.map((p, i) => (
          <p key={i} className="leading-relaxed text-text-light">
            {p}
          </p>
        ))}
      </div>
      <div className="mt-12 border-t border-border pt-6">
        <p className="text-sm text-text-muted">
          Last updated: February 2026. Contact{" "}
          <a
            href="mailto:hello@doftcandles.com"
            className="text-primary underline"
          >
            hello@doftcandles.com
          </a>
        </p>
      </div>
    </div>
  );
}
