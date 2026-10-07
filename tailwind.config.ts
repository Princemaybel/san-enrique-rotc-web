import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Brand palette — matches CSS design tokens */
        forest: {
          DEFAULT: "#123C2A",
          deep:    "#071B12",
          dark:    "#0B2A1D",
          surface: "#0F3625",
          light:   "#1A4E37",
        },
        field: {
          DEFAULT: "#1F5D3A",
          vibrant: "#155D3B",
          emerald: "#1B7A4F",
          light:   "#279663",
        },
        dark:      "#071B12",
        brass:     "#D4A843",
        gold: {
          DEFAULT: "#D4A843",
          light:   "#E6C268",
          rich:    "#B88A32",
          dark:    "#8E671D",
          amber:   "#F5D47A",
        },
        cream: {
          DEFAULT: "#FAF7F0",
          soft:    "#F3EDE0",
          parchment:"#EDE5D4",
        },
        offwhite:  "#FCFCF8",
        charcoal:  "#1D2922",
        slate: {
          DEFAULT: "#66736B",
          dark:    "#3E4A43",
          light:   "#8FA397",
        },
        mist:      "#EEF5EF",

        /* Legacy aliases kept for backward compatibility */
        pine:      "#1F5D3A",
        parchment: "#F6F2E8",
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
      },

      boxShadow: {
        "card":            "0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.05)",
        "card-hover":      "0 8px 24px -4px rgba(7, 27, 18, 0.12), 0 4px 12px -2px rgba(212, 168, 67, 0.08)",
        "glow-gold":       "0 0 0 3px rgba(212, 168, 67, 0.25)",
        "glow-gold-lg":    "0 0 25px rgba(212, 168, 67, 0.35), 0 0 10px rgba(212, 168, 67, 0.2)",
        "glow-field":      "0 0 0 3px rgba(31, 93, 58, 0.18)",
        "glow-emerald-lg": "0 0 25px rgba(27, 122, 79, 0.35), 0 0 10px rgba(27, 122, 79, 0.2)",
        "glass-card":      "0 8px 32px 0 rgba(7, 27, 18, 0.08)",
        "glass-dark":      "0 12px 40px 0 rgba(0, 0, 0, 0.45)",
        "inner-sm":        "inset 0 1px 2px 0 rgb(0 0 0 / 0.06)",
      },

      borderRadius: {
        "sm": "6px",
        "md": "10px",
        "lg": "14px",
        "xl": "20px",
        "2xl": "28px",
      },

      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-18px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(18px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% center" },
          to:   { backgroundPosition: "200% center" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.6" },
        },
        "radar-sweep": {
          "0%":   { transform: "translateY(-100%)", opacity: "0" },
          "30%":  { opacity: "0.85" },
          "70%":  { opacity: "0.85" },
          "100%": { transform: "translateY(300%)", opacity: "0" },
        },
        "float-smooth": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-6px)" },
        },
        "gold-glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 12px rgba(212, 168, 67, 0.25)" },
          "50%":      { boxShadow: "0 0 28px rgba(212, 168, 67, 0.55)" },
        },
      },

      animation: {
        "fade-up":         "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in":         "fade-in 0.4s ease-out both",
        "slide-in-left":   "slide-in-left 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-in-right":  "slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer:           "shimmer 1.8s linear infinite",
        "spin-slow":       "spin-slow 3s linear infinite",
        "pulse-soft":      "pulse-soft 2.5s ease-in-out infinite",
        "radar-sweep":     "radar-sweep 3s ease-in-out infinite",
        "float-smooth":    "float-smooth 4s ease-in-out infinite",
        "gold-glow-pulse": "gold-glow-pulse 2.5s ease-in-out infinite",
      },

      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.16, 1, 0.3, 1)",
      },

      backgroundImage: {
        "grid-field": `
          linear-gradient(rgba(18,60,42,0.055) 1px, transparent 1px),
          linear-gradient(90deg, rgba(18,60,42,0.055) 1px, transparent 1px)
        `,
        "hero-gradient": "linear-gradient(145deg, #071B12 0%, #155D3B 55%, #0C2B1E 100%)",
        "gold-shimmer": "linear-gradient(90deg, #D4A843 25%, #F5D47A 50%, #D4A843 75%)",
        "card-glass": "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(250, 247, 240, 0.6) 100%)",
        "card-glass-dark": "linear-gradient(135deg, rgba(12, 43, 30, 0.85) 0%, rgba(7, 27, 18, 0.95) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
