"use client";
import Link from "next/link";

export function PreviewBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-between bg-gold px-6 py-2 text-sm text-[#111]">
      <span className="font-bold">
        ⚡ Preview Mode — You are viewing draft content
      </span>
      <Link
        href="/api/preview/exit"
        className="rounded bg-[#111] px-4 py-1 text-xs font-bold uppercase text-gold transition-colors hover:bg-[#333]"
      >
        Exit Preview
      </Link>
    </div>
  );
}
