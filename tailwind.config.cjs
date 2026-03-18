/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        primary: "#c4a093",
        "primary-dark": "#a8877b",
        "primary-light": "#d9c2b7",
        accent: "#8b9e7e",
        bg: "#faf7f4",
        "bg-warm": "#f3ece4",
        surface: "#ffffff",
        "text-dark": "#2d2926",
        "text-body": "#6b5e54",
        "text-muted": "#9a8d82",
        border: "#e8e0d8",
        "border-light": "#f0ebe5",
        banner: "#c4a093",
        success: "#8b9e7e",
        error: "#c96b6b",
      },
      fontFamily: {
        heading: ["Cormorant Garamond", "Playfair Display", "serif"],
        body: ["Inter", "DM Sans", "sans-serif"],
      },
      spacing: {
        72: "18rem",
        84: "21rem",
      },
      borderRadius: {
        card: "0.75rem",
      },
      boxShadow: {
        card: "0 2px 16px rgba(45, 41, 38, 0.06)",
        "card-hover": "0 8px 32px rgba(45, 41, 38, 0.1)",
        elevated: "0 12px 40px rgba(45, 41, 38, 0.12)",
      },
    },
  },
  plugins: [],
};
