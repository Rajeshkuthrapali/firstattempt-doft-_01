import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const wishlist = await prisma.wishlist.findMany({
    where: { customerId: session.user.id },
    include: { product: { include: { variants: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(wishlist);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { productId } = (await request.json()) as { productId: string };
  const existing = await prisma.wishlist.findUnique({
    where: { customerId_productId: { customerId: session.user.id, productId } },
  });
  if (existing) {
    await prisma.wishlist.delete({
      where: {
        customerId_productId: { customerId: session.user.id, productId },
      },
    });
    return NextResponse.json({ wishlisted: false });
  }
  await prisma.wishlist.create({
    data: { customerId: session.user.id, productId },
  });
  return NextResponse.json({ wishlisted: true });
}
