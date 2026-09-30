import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14171F",
        surface: "#1C2029",
        raised: "#242A36",
        hairline: "#333947",
        paper: "#ECE8DE",
        dim: "#93959C",
        brass: "#C9A24B",
        "brass-dim": "#8A6E38",
        rise: "#5FA776",
        fall: "#B0524A",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-plex-sans)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
