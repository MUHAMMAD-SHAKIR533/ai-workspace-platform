import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { surface: "#0b1326", primary: "#c3c0ff", emerald: "#4edea3", outline: "#464555" },
      borderRadius: { card: "1rem" },
      fontFamily: { display: ["Geist"], body: ["Inter"], mono: ["JetBrains Mono"] },
    },
  },
  plugins: [],
} satisfies Config;
