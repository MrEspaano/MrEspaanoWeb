import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "hsl(var(--bg))",
        fg: "hsl(var(--fg))",
        muted: "hsl(var(--muted))",
        accent: "hsl(var(--accent))",
        card: "hsl(var(--card))",
        line: "hsl(var(--line))"
      },
      boxShadow: {
        glass: "0 20px 60px rgba(15, 18, 35, 0.26)",
        card: "0 10px 30px rgba(8, 10, 22, 0.18)"
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
        glow:
          "radial-gradient(circle at 20% 20%, rgba(110,198,255,0.35), transparent 48%), radial-gradient(circle at 80% 0%, rgba(255,136,162,0.26), transparent 42%), radial-gradient(circle at 50% 100%, rgba(130,255,204,0.22), transparent 44%)"
      },
      animation: {
        "pulse-soft": "pulseSoft 4s ease-in-out infinite"
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { opacity: "0.75" },
          "50%": { opacity: "1" }
        }
      }
    }
  },
  plugins: []
};

export default config;
