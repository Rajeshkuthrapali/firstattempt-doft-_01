import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
export const metadata: Metadata = { title: "Contact Us", description: "Get in touch with the DOFT Candles team." };
export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-heading text-4xl font-bold text-primary md:text-5xl">Contact Us</h1>
      <p className="mt-4 text-lg text-text-light">We&apos;d love to hear from you.</p>
      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <form className="space-y-5">
          <div><label className="mb-1 block text-sm font-bold uppercase tracking-wider">Name</label><input type="text" required className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Your name" /></div>
          <div><label className="mb-1 block text-sm font-bold uppercase tracking-wider">Email</label><input type="email" required className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-primary" placeholder="you@example.com" /></div>
          <div><label className="mb-1 block text-sm font-bold uppercase tracking-wider">Message</label><textarea rows={5} required className="w-full resize-none border border-border px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Your message…" /></div>
          <button type="submit" className="w-full bg-primary py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-accent">Send Message</button>
        </form>
        <div className="space-y-8 lg:pl-8">
          <div className="flex gap-4"><Mail size={20} className="mt-1 shrink-0 text-gold" /><div><h3 className="font-heading text-lg font-bold text-primary">Email</h3><a href="mailto:hello@doftcandles.com" className="text-text-light hover:text-primary">hello@doftcandles.com</a></div></div>
          <div className="flex gap-4"><Phone size={20} className="mt-1 shrink-0 text-gold" /><div><h3 className="font-heading text-lg font-bold text-primary">Phone</h3><p className="text-text-light">+91 98765 43210</p></div></div>
          <div className="flex gap-4"><MapPin size={20} className="mt-1 shrink-0 text-gold" /><div><h3 className="font-heading text-lg font-bold text-primary">Studio</h3><p className="text-text-light">DOFT Candles Studio<br />New Delhi, India</p></div></div>
        </div>
      </div>
    </div>
  );
}
