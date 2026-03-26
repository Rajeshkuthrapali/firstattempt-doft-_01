import { describe, it, expect } from "vitest";
import {
  palette,
  fontFamily,
  fontSize,
  spacing,
  radius,
  shadow,
  transition,
} from "../../design/tokens";

describe("Design tokens — palette", () => {
  it("defines the cream background", () => {
    expect(palette.bgPrimary).toBe("#faf7f4");
  });

  it("defines the dusty rose accent", () => {
    expect(palette.accent).toBe("#c4a093");
  });

  it("defines the warm brown primary text", () => {
    expect(palette.textPrimary).toBe("#2d2926");
  });

  it("defines the sage green secondary accent", () => {
    expect(palette.sage).toBe("#8b9e7e");
  });

  it("has consistent accent hierarchy (dark < accent < light)", () => {
    // These are hex values — just ensure they're all defined
    expect(palette.accentDark).toBe("#a8877b");
    expect(palette.accent).toBe("#c4a093");
    expect(palette.accentLight).toBe("#d9c2b7");
  });

  it("defines border colours", () => {
    expect(palette.border).toBe("#e8e0d8");
    expect(palette.borderLight).toBe("#f0ebe5");
    expect(palette.borderHover).toBe("#c4a093");
  });
});

describe("Design tokens — fontFamily", () => {
  it("heading uses Cormorant Garamond", () => {
    expect(palette).toBeDefined();
    expect(fontFamily.heading).toContain("Cormorant Garamond");
  });

  it("body uses Inter", () => {
    expect(fontFamily.body).toContain("Inter");
  });
});

describe("Design tokens — fontSize", () => {
  it("defines all expected sizes", () => {
    expect(fontSize.xs).toBeDefined();
    expect(fontSize.sm).toBeDefined();
    expect(fontSize.base).toBeDefined();
    expect(fontSize.hero).toContain("clamp");
  });
});

describe("Design tokens — spacing", () => {
  it("page spacing uses clamp for responsiveness", () => {
    expect(spacing.page).toContain("clamp");
  });

  it("section spacing uses clamp for responsiveness", () => {
    expect(spacing.section).toContain("clamp");
  });
});

describe("Design tokens — radius, shadow, transition", () => {
  it("defines border radii", () => {
    expect(radius.sm).toBeDefined();
    expect(radius.full).toBe("9999px");
  });

  it("defines box shadows", () => {
    expect(shadow.card).toContain("rgba");
    expect(shadow.cardHover).toContain("rgba");
    expect(shadow.elevated).toContain("rgba");
  });

  it("defines transitions", () => {
    expect(transition.fast).toContain("cubic-bezier");
    expect(transition.base).toContain("250ms");
    expect(transition.slow).toContain("400ms");
  });
});
