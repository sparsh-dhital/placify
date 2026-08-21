/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Upgraded to a premium, OLED-style Zinc/Slate palette
        background: "#09090B",
        secondary: "#18181B",
        card: "#121214",
        border: "#27272A",
        text: {
          primary: "#FAFAFA",
          secondary: "#A1A1AA",
        },
        accent: {
          primary: "#6366F1", // Brand Indigo
          secondary: "#818CF8",
          ai: "#22D3EE", // AI Cyan
        },
        semantic: {
          success: "#10B981",
          warning: "#F59E0B",
          critical: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        premium: "0 4px 20px -2px rgba(0, 0, 0, 0.7)",
      },
    },
  },
  plugins: [],
};