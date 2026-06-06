import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const customer = await prisma.customer.findUnique({
    where: { id: session.user.id },
  });
  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json({
    user: {
      id: customer?.id ?? session.user.id,
      name: customer?.name ?? "",
      email: customer?.email ?? "",
    },
    orders: orders.map((o: any) => ({
      id: o.id,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt.toISOString(),
      itemCount: o._count.items,
    })),
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name } = (await request.json()) as { name?: string };
  const updated = await prisma.customer.update({
    where: { id: session.user.id },
    data: { name: name ?? "" },
  });
  return NextResponse.json({
    user: { id: updated.id, name: updated.name, email: updated.email },
  });
}
