import Link from "next/link";
export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-4xl">✓</div>
      <h1 className="font-heading text-4xl font-bold text-primary">Thank You!</h1>
      <p className="mt-4 text-lg text-text-light">Your order has been placed successfully.</p>
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/collections/bestsellers" className="bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-accent">Continue Shopping</Link>
        <Link href="/account" className="border border-primary px-8 py-3 text-sm font-bold uppercase tracking-wider text-primary hover:bg-primary hover:text-white">View Orders</Link>
      </div>
    </div>
  );
}
