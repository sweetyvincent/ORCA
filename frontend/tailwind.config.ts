import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          950: "#02060b",
          900: "#040d1a",
          850: "#071426",
          800: "#0b1c33",
          700: "#132c4f",
          600: "#1d3f6d",
        },
        bioglow: {
          cyan: "#00f0ff",
          aqua: "#00e5a3",
          blue: "#0077fe",
          lime: "#22c55e",
          amber: "#f59e0b",
          red: "#ef4444",
        },
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
        sans: ["var(--font-geist-sans)", "Inter", "sans-serif"],
      },
      boxShadow: {
        "cyan-glow": "0 0 25px rgba(0, 240, 255, 0.25)",
        "aqua-glow": "0 0 25px rgba(0, 229, 163, 0.25)",
        "glass-panel": "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
      },
      backgroundImage: {
        "radial-dark": "radial-gradient(circle at 50% 30%, #091a2e 0%, #030810 85%, #010408 100%)",
        "grid-pattern": "linear-gradient(to right, rgba(0,240,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,240,255,0.04) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
export default config;
