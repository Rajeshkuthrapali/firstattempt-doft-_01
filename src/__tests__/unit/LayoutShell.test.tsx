import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithRouter } from "../helpers";
import LayoutShell from "../../components/LayoutShell";

// GSAP / ScrollTrigger is not available in jsdom — mock the animations module
vi.mock("../../lib/animations", () => ({
  pageEnter: vi.fn(),
  initScrollAnimations: vi.fn(),
}));

describe("LayoutShell", () => {
  it("renders the skip-to-content link", () => {
    renderWithRouter(<LayoutShell />);
    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");
    expect(skipLink.tagName).toBe("A");
  });

  it("renders the main element with role='main'", () => {
    renderWithRouter(<LayoutShell />);
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute("id", "main-content");
  });

  it("renders the footer with role='contentinfo'", () => {
    renderWithRouter(<LayoutShell />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders the footer brand LUMIÈRE", () => {
    renderWithRouter(<LayoutShell />);
    // Both nav and footer have LUMIÈRE
    const brand = screen.getAllByText("LUMIÈRE");
    expect(brand.length).toBeGreaterThanOrEqual(2);
  });

  it("renders footer Quick Links section", () => {
    renderWithRouter(<LayoutShell />);
    expect(screen.getByText("Quick Links")).toBeInTheDocument();
    expect(screen.getByText("Shop All")).toBeInTheDocument();
    expect(screen.getByText("Bestsellers")).toBeInTheDocument();
    expect(screen.getByText("New Arrivals")).toBeInTheDocument();
    expect(screen.getByText("Gift Sets")).toBeInTheDocument();
  });

  it("renders footer Support section", () => {
    renderWithRouter(<LayoutShell />);
    expect(screen.getByText("Support")).toBeInTheDocument();
    expect(screen.getByText("Shipping & Returns")).toBeInTheDocument();
    expect(screen.getByText("FAQ")).toBeInTheDocument();
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });

  it("renders the newsletter signup form", () => {
    renderWithRouter(<LayoutShell />);
    expect(screen.getByText("Stay in Touch")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByText("Join")).toBeInTheDocument();
  });

  it("renders copyright with Lumière branding", () => {
    renderWithRouter(<LayoutShell />);
    expect(
      screen.getByText(/Lumière\. All rights reserved/),
    ).toBeInTheDocument();
  });

  it("renders social media icons with ARIA labels", () => {
    renderWithRouter(<LayoutShell />);
    expect(screen.getByLabelText("Instagram")).toBeInTheDocument();
    expect(screen.getByLabelText("Facebook")).toBeInTheDocument();
  });
});
