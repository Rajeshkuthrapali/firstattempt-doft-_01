import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug") ?? "/";
  if (secret !== process.env.SANITY_API_TOKEN) return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  const draft = await draftMode();
  draft.enable();
  return NextResponse.redirect(new URL(slug, request.url));
}
