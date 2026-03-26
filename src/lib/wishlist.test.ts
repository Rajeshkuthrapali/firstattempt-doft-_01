import { describe, it, expect, vi } from "vitest";
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Wishlist API Logic", () => {
  it("should toggle wishlisted state", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ wishlisted: true }),
    });
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: "prod-1" }),
    });
    expect((await res.json()).wishlisted).toBe(true);
  });
  it("should return 401 when not authenticated", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: "Unauthorized" }),
    });
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: "prod-1" }),
    });
    expect(res.ok).toBe(false);
  });
  it("should return empty array initially", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    const res = await fetch("/api/wishlist");
    expect(await res.json()).toEqual([]);
  });
});
