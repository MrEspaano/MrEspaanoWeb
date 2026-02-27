import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        board: {
          bg: "var(--bg)",
          panel: "var(--panel)",
          text: "var(--text)",
          muted: "var(--muted)",
          border: "var(--border)"
        }
      },
      boxShadow: {
        card: "0 8px 24px rgba(15, 23, 42, 0.08)"
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  plugins: []
};

export default config;
