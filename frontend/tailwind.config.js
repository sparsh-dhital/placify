/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#080B12",
        secondary: "#0D111A",
        card: "#111827",
        border: "#253047",
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
        },
        accent: {
          primary: "#6366F1",
          secondary: "#8B5CF6",
          ai: "#22D3EE",
        },
        semantic: {
          success: "#22C55E",
          warning: "#F59E0B",
          critical: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        premium: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};