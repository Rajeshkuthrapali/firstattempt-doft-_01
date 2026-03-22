import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import { draftMode } from "next/headers";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { PreviewBanner } from "@/components/cms/PreviewBanner";
import { GoogleAnalytics } from "@/lib/analytics";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXTAUTH_URL ?? "https://doftcandles.com",
  ),
  title: {
    default: "DOFT - Luxury Scented Candles & Fragrances",
    template: "%s | DOFT",
  },
  description:
    "Experience the world through smell. Handcrafted luxury candles, wax tablets, and diffusers in timeless glass. Shop DOFT for premium scented candles.",
  keywords: [
    "luxury candles",
    "scented candles",
    "wax tablets",
    "reed diffusers",
    "DOFT",
    "handcrafted candles",
    "gift candles",
    "aromatherapy",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DOFT Candles",
    title: "DOFT - Luxury Scented Candles & Fragrances",
    description:
      "Experience the world through smell. Handcrafted luxury candles in timeless glass.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DOFT - Luxury Scented Candles",
    description:
      "Handcrafted luxury candles, wax tablets, and diffusers in timeless glass.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION ?? "",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEnabled: preview } = await draftMode();

  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable}`}>
      <body className="flex min-h-screen flex-col">
        {preview && <PreviewBanner />}
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartSidebar />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
