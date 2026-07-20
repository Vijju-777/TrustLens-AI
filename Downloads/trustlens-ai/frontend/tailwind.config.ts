import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef5ff",
          100: "#d9e8ff",
          200: "#b3d1ff",
          300: "#80b3ff",
          400: "#4d8fff",
          500: "#2166f0",
          600: "#1650c7",
          700: "#123f9c",
          800: "#0f3277",
          900: "#0c2758",
        },
        safe: "#16a34a",
        suspicious: "#f59e0b",
        scam: "#ea580c",
        dangerous: "#dc2626",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
