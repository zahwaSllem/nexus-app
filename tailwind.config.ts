import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Existing surface tokens ─────────────────────────── */
        background: "var(--background)",
        foreground: "var(--foreground)",

        /* ── Brand color tokens (CSS-var driven, theme-aware) ── */
        brand: {
          DEFAULT: "var(--color-brand)",
          dim:     "var(--color-brand-dim)",
          deep:    "var(--color-brand-deep)",
          tint:    "var(--color-brand-tint)",
          border:  "var(--color-brand-border)",
          on:      "var(--color-on-brand)",
        },
        "brand-violet": {
          DEFAULT: "var(--color-violet)",
          dim:     "var(--color-violet-dim)",
          tint:    "var(--color-violet-tint)",
          border:  "var(--color-violet-border)",
        },
      },

      fontFamily: {
        sans: ["Plus Jakarta Sans Variable", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },

      /* ── Custom shadows (CSS-var driven) ─────────────────────── */
      boxShadow: {
        brand:    "var(--shadow-brand)",
        "brand-lg": "var(--shadow-brand-lg)",
        card:     "var(--shadow-card)",
      },

      /* ── Transition timing functions ─────────────────────────── */
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
