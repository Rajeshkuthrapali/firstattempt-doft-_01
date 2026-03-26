import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithRouter } from "../helpers";
import Home from "../../pages/Home";

describe("Home page — Hero section", () => {
  it("renders the hero banner with aria-label", () => {
    renderWithRouter(<Home />);
    const hero = document.getElementById("hero");
    expect(hero).toBeInTheDocument();
    expect(hero).toHaveAttribute("aria-label", "Hero banner");
  });

  it("renders the 'Handcrafted Luxury' subtitle", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText("Handcrafted Luxury")).toBeInTheDocument();
  });

  it("renders the hero headline 'signature'", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText("signature")).toBeInTheDocument();
  });

  it("renders the 'Scented Collection' text", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText("Scented Collection")).toBeInTheDocument();
  });

  it("renders the 'Shop Now' CTA button", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText("Shop Now")).toBeInTheDocument();
  });

  it("has a hero image with proper alt text", () => {
    renderWithRouter(<Home />);
    const img = screen.getByAltText(
      /signature scented candle collection by lumière/i,
    );
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/hero-candle.png");
  });
});

describe("Home page — Product sections", () => {
  it("renders the 'New Arrivals' section heading", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText("New Arrivals")).toBeInTheDocument();
    expect(screen.getByText("Signature Fragrances")).toBeInTheDocument();
  });

  it("renders the 'View All Products' link", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText("View All Products")).toBeInTheDocument();
  });

  it("renders the 'Bestsellers' section heading", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText("Most Loved")).toBeInTheDocument();
    expect(screen.getByText("Bestsellers")).toBeInTheDocument();
  });

  it("renders product cards (Golden Hour should be visible)", () => {
    renderWithRouter(<Home />);
    // Golden Hour is a signature product so it appears in the grid
    const names = screen.getAllByText("Golden Hour");
    expect(names.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Home page — Value props", () => {
  it("renders value proposition titles", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText("Hand-Poured")).toBeInTheDocument();
    expect(screen.getByText("100% Natural Soy")).toBeInTheDocument();
    expect(screen.getByText("Gift-Ready")).toBeInTheDocument();
  });

  it("value props section has aria-label", () => {
    renderWithRouter(<Home />);
    const section = screen.getByLabelText("Brand values");
    expect(section).toBeInTheDocument();
  });
});

describe("Home page — Clean Burning section", () => {
  it("renders the Clean Burning headline", () => {
    renderWithRouter(<Home />);
    expect(
      screen.getByText(/clean burning so you can light/i),
    ).toBeInTheDocument();
  });

  it("renders brand story text with Lumière", () => {
    renderWithRouter(<Home />);
    expect(
      screen.getByText(/lumière candles are 100% coconut/i),
    ).toBeInTheDocument();
  });
});

describe("Home page — Lifestyle banner", () => {
  it("renders the lifestyle section with aria-label", () => {
    renderWithRouter(<Home />);
    const section = screen.getByLabelText("Lifestyle imagery and brand quote");
    expect(section).toBeInTheDocument();
  });

  it("renders the Shop Bestsellers button", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText("Shop Bestsellers")).toBeInTheDocument();
  });
});
