import { describe, it, expect } from "vitest";
import {
  cloudinaryUrl,
  cloudinaryProductImage,
  cloudinaryImages,
} from "./cloudinary-images";

/**
 * Unit tests for Cloudinary URL generation helpers.
 * Uses the "demo" cloud name (default when VITE_CLOUDINARY_CLOUD_NAME is not set).
 * No network requests are made — these tests validate URL shape only.
 */
describe("cloudinaryUrl", () => {
  it("returns a string containing res.cloudinary.com", () => {
    const url = cloudinaryUrl("sample");
    expect(url).toContain("res.cloudinary.com");
  });

  it("includes the public ID in the URL path", () => {
    const url = cloudinaryUrl("product/candle-golden-hour");
    expect(url).toContain("candle-golden-hour");
  });

  it("applies auto format via f_auto in the URL", () => {
    const url = cloudinaryUrl("sample");
    expect(url).toContain("f_auto");
  });

  it("applies auto quality via q_auto in the URL", () => {
    const url = cloudinaryUrl("sample");
    expect(url).toContain("q_auto");
  });
});

describe("cloudinaryProductImage", () => {
  it("returns a string containing res.cloudinary.com", () => {
    const url = cloudinaryProductImage("sample");
    expect(url).toContain("res.cloudinary.com");
  });

  it("includes width and height in the transformation string", () => {
    const url = cloudinaryProductImage("sample", 400, 300);
    expect(url).toContain("400");
    expect(url).toContain("300");
  });

  it("defaults to 600×600 when no dimensions provided", () => {
    const url = cloudinaryProductImage("sample");
    expect(url).toContain("600");
  });

  it("includes fill crop mode (c_fill) in the URL", () => {
    const url = cloudinaryProductImage("sample");
    expect(url).toContain("c_fill");
  });
});

describe("cloudinaryImages.url (legacy compat)", () => {
  it("returns an absolute https:// URL unchanged (pass-through)", () => {
    const external = "https://cdn.example.com/product.jpg";
    expect(cloudinaryImages.url(external)).toBe(external);
  });

  it("returns an absolute http:// URL unchanged (pass-through)", () => {
    const external = "http://localhost:3000/hero.png";
    expect(cloudinaryImages.url(external)).toBe(external);
  });

  it("treats a non-url string as a public ID and returns a Cloudinary URL", () => {
    const url = cloudinaryImages.url("product/candle-jasmine");
    expect(url).toContain("res.cloudinary.com");
    expect(url).toContain("candle-jasmine");
  });

  it("treats a local /path as a public ID and returns a Cloudinary URL", () => {
    // Local paths like /hero-candle.png are not http(s) so they go through Cloudinary
    const url = cloudinaryImages.url("/hero-candle.png");
    expect(url).toContain("res.cloudinary.com");
  });
});
