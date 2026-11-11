/**
 * Build-time theme switch. Set NEXT_PUBLIC_THEME=sand to build the sand version;
 * anything else builds the navy one. CSS tokens flip in globals.css; this file
 * exposes the same palette as literal colours for SVG attributes and animated values.
 */
export const THEME: "navy" | "sand" = process.env.NEXT_PUBLIC_THEME === "sand" ? "sand" : "navy";

const palettes = {
  navy: { bg: "#0d1e2c", bgAlt: "#142a3d", fg: "#f2e9df", muted: "#c3b3a3", dim: "#2b4a66", accent: "#b97a4e", brand: "#d9c4b0" },
  sand: { bg: "#d9c4b0", bgAlt: "#e4d4c3", fg: "#142a3d", muted: "#4c5b68", dim: "#b9a48f", accent: "#8a4a22", brand: "#172b48" },
} as const;

/** Colours that follow the theme. */
export const palette = palettes[THEME];
/** Colours for scenes that stay dark in every theme. */
export const night = palettes.navy;
