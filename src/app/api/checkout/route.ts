import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2024-12-18.acacia" });

interface CartRequestItem { variantId: string; quantity: number; }

export async function POST(request: Request) {
  try {
    const { items, email } = (await request.json()) as { items: CartRequestItem[]; email?: string };
    if (!items || items.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const orderItems: { productId: string; variantId: string; quantity: number; priceAtTime: number }[] = [];

    for (const item of items) {
      const variant = await prisma.variant.findUnique({ where: { id: item.variantId }, include: { product: true } });
      if (!variant) return NextResponse.json({ error: `Variant ${item.variantId} not found` }, { status: 400 });
      if (variant.stock < item.quantity) return NextResponse.json({ error: `Insufficient stock for ${variant.product.title}` }, { status: 400 });

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: variant.product.title, description: variant.title, images: JSON.parse(variant.product.images).slice(0, 1) },
          unit_amount: Math.round(variant.price * 100),
        },
        quantity: item.quantity,
      });
      orderItems.push({ productId: variant.productId, variantId: variant.id, quantity: item.quantity, priceAtTime: variant.price });
    }

    const total = orderItems.reduce((sum, oi) => sum + oi.priceAtTime * oi.quantity, 0);
    const order = await prisma.order.create({ data: { status: "pending", total, email: email ?? "", items: { create: orderItems } } });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/checkout/success?order=${order.id}`,
      cancel_url: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/checkout/cancelled`,
      metadata: { orderId: order.id },
      customer_email: email ?? undefined,
    });

    return NextResponse.json({ url: session.url, orderId: order.id });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
