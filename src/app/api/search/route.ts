import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchProducts } from "@/lib/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const scent = searchParams.get("scent");
  const sort = searchParams.get("sort");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const collection = searchParams.get("collection");

  const filters: string[] = [];
  if (scent) filters.push(`scentFamily = "${scent}"`);
  if (minPrice) filters.push(`price >= ${minPrice}`);
  if (maxPrice) filters.push(`price <= ${maxPrice}`);
  if (collection) filters.push(`collections = "${collection}"`);
  const filterStr = filters.length > 0 ? filters.join(" AND ") : undefined;

  const sortArr =
    sort === "price-asc"
      ? ["price:asc"]
      : sort === "price-desc"
        ? ["price:desc"]
        : sort === "title-asc"
          ? ["title:asc"]
          : sort === "title-desc"
            ? ["title:desc"]
            : undefined;

  try {
    const results = await searchProducts(query, {
      filter: filterStr,
      sort: sortArr,
    });
    return NextResponse.json(results);
  } catch {
    // Prisma fallback
    const where: Record<string, unknown> = {};
    if (query)
      where.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
        { scentFamily: { contains: query } },
      ];
    if (scent) where.scentFamily = scent;
    const products = await prisma.product.findMany({
      where,
      include: { variants: true },
      take: 20,
    });
    let filtered = products;
    if (minPrice)
      filtered = filtered.filter(
        (p: any) => (p.variants[0]?.price ?? 0) >= parseFloat(minPrice),
      );
    if (maxPrice)
      filtered = filtered.filter(
        (p: any) => (p.variants[0]?.price ?? 0) <= parseFloat(maxPrice),
      );
    if (sort === "price-asc")
      filtered.sort(
        (a: any, b: any) =>
          (a.variants[0]?.price ?? 0) - (b.variants[0]?.price ?? 0),
      );
    else if (sort === "price-desc")
      filtered.sort(
        (a: any, b: any) =>
          (b.variants[0]?.price ?? 0) - (a.variants[0]?.price ?? 0),
      );
    const hits = filtered.map((p: any) => {
      const images: string[] = JSON.parse(p.images);
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        scentFamily: p.scentFamily,
        price: p.variants[0]?.price ?? 0,
        image: images[0] ?? "",
      };
    });
    return NextResponse.json({
      hits,
      query,
      processingTimeMs: 0,
      estimatedTotalHits: hits.length,
      fallback: true,
    });
  }
}
