/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.tsx", "./src/**/*.ts"],
  theme: {
    extend: {
      colors: {
        primary: "#0F172B",
        secondary: "#2A2A2A",
        neutral: "#777777",
        secondary: "#6C6C6C",
        muted: "#767676",
        background: {
          100: "#F5F5FF",
          200: "#EDEDFF",
        },
      },
      fontFamily: {
        lato: ["Lato", "sans-serif"],
      },
    },
  },
  plugins: [],
};
