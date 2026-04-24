import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05070d",
          900: "#0a0e1a",
          800: "#101624",
          700: "#1a2132",
          600: "#273049",
        },
        mint: {
          50: "#e9fff6",
          100: "#c7ffe6",
          200: "#94fbd0",
          300: "#5ef0b6",
          400: "#2ee39b",
          500: "#12c983",
          600: "#08a06a",
          700: "#067a52",
        },
        sky: {
          400: "#5fb6ff",
          500: "#2e93ff",
          600: "#0f74e6",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "-apple-system",
          "BlinkMacSystemFont",
          "'SF Pro Text'",
          "'Inter'",
          "'PingFang SC'",
          "'Hiragino Sans GB'",
          "'Microsoft YaHei'",
          "sans-serif",
        ],
        display: [
          "'SF Pro Display'",
          "'Inter'",
          "ui-sans-serif",
          "'PingFang SC'",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 40px rgba(46, 227, 155, 0.25)",
        card: "0 10px 40px -12px rgba(0, 0, 0, 0.5)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse at top, rgba(46,227,155,0.12), transparent 60%), radial-gradient(ellipse at bottom, rgba(46,147,255,0.10), transparent 60%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
