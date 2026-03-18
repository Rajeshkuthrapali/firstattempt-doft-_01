import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithRouter } from "../helpers";
import Nav from "../../components/Nav";

describe("Nav component", () => {
  it("renders the LUMIÈRE brand wordmark", () => {
    renderWithRouter(<Nav />);
    expect(screen.getByText("LUMIÈRE")).toBeInTheDocument();
  });

  it("renders the announcement bar with free shipping text", () => {
    renderWithRouter(<Nav />);
    expect(
      screen.getByText(/free shipping on orders above/i),
    ).toBeInTheDocument();
    expect(screen.getByText("INR 3000/-")).toBeInTheDocument();
  });

  it("renders all navigation links (desktop + mobile instances)", () => {
    renderWithRouter(<Nav />);
    // Each link appears twice: once in desktop menubar, once in mobile drawer
    expect(screen.getAllByText("Home")).toHaveLength(2);
    expect(screen.getAllByText("Shop")).toHaveLength(2);
    expect(screen.getAllByText("Our Story")).toHaveLength(2);
    expect(screen.getAllByText("Contact")).toHaveLength(2);
  });

  it("has proper ARIA attributes on the nav element", () => {
    renderWithRouter(<Nav />);
    const nav = screen.getByRole("navigation", { name: /main navigation/i });
    expect(nav).toBeInTheDocument();
  });

  it("renders the cart toggle button with ARIA label", () => {
    renderWithRouter(<Nav />);
    const cartBtn = screen.getByLabelText(/open cart/i);
    expect(cartBtn).toBeInTheDocument();
  });

  it("renders search button with ARIA label (desktop)", () => {
    renderWithRouter(<Nav />);
    const searchBtn = screen.getByLabelText("Search");
    expect(searchBtn).toBeInTheDocument();
  });

  it("renders the mobile hamburger with ARIA label", () => {
    renderWithRouter(<Nav />);
    const toggleBtn = screen.getByLabelText(/open menu/i);
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveAttribute("aria-expanded", "false");
  });

  it("has role='banner' on the header element", () => {
    renderWithRouter(<Nav />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("links the brand wordmark to the home page", () => {
    renderWithRouter(<Nav />);
    const link = screen.getByLabelText("Lumière home");
    expect(link).toHaveAttribute("href", "/");
  });

  it("desktop menubar has menuitem roles", () => {
    renderWithRouter(<Nav />);
    const menubar = screen.getByRole("menubar");
    expect(menubar).toBeInTheDocument();
    // Desktop menubar should have 4 menu items
    const desktopItems = menubar.querySelectorAll("[role='menuitem']");
    expect(desktopItems).toHaveLength(4);
  });
});
