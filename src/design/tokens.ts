/**
 * Design tokens for the Lumière candle store.
 * Light, warm, feminine luxury aesthetic inspired by the reference site.
 * Single source of truth for palette, typography, spacing, and motion.
 */

export const palette = {
  /** Warm cream / off-white backgrounds */
  bgPrimary: "#faf7f4",
  bgSecondary: "#f3ece4",
  bgCard: "#ffffff",
  bgCardHover: "#fdf9f6",
  bgGlass: "rgba(250, 247, 244, 0.85)",

  /** Accent — dusty rose / mauve */
  accent: "#c4a093",
  accentDark: "#a8877b",
  accentLight: "#d9c2b7",
  accentMuted: "rgba(196, 160, 147, 0.15)",

  /** Sage green secondary accent */
  sage: "#8b9e7e",
  sageMuted: "rgba(139, 158, 126, 0.12)",

  /** Text hierarchy */
  textPrimary: "#2d2926",
  textSecondary: "#6b5e54",
  textMuted: "#9a8d82",

  /** Borders & dividers */
  border: "#e8e0d8",
  borderLight: "#f0ebe5",
  borderHover: "#c4a093",

  /** Status */
  success: "#8b9e7e",
  error: "#c96b6b",

  /** Cart banner */
  bannerBg: "#c4a093",
  bannerText: "#ffffff",
} as const;

export const fontFamily = {
  /** Elegant serif for headings and brand */
  heading: "'Cormorant Garamond', 'Playfair Display', serif",
  /** Script for decorative / hero accents */
  script: "'Cormorant Garamond', serif",
  /** Clean sans-serif for body */
  body: "'Inter', 'DM Sans', sans-serif",
} as const;

export const fontSize = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
  "5xl": "3rem",
  hero: "clamp(2.5rem, 6vw, 5rem)",
} as const;

export const spacing = {
  page: "clamp(1rem, 4vw, 3rem)",
  section: "clamp(3rem, 8vw, 7rem)",
  cardGap: "1.25rem",
} as const;

export const radius = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  full: "9999px",
} as const;

export const shadow = {
  card: "0 2px 16px rgba(45, 41, 38, 0.06)",
  cardHover: "0 8px 32px rgba(45, 41, 38, 0.1)",
  elevated: "0 12px 40px rgba(45, 41, 38, 0.12)",
} as const;

export const transition = {
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  base: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "400ms cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

export type Palette = typeof palette;
export type FontFamily = typeof fontFamily;
