/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        mint: "#d6f5e3",
        sage: "#7bbf8a",
        softYellow: "#fff7d6",
        gold: "#e8c84a",
        peach: "#ffe0cc",
        coral: "#f4845f",
        sky: "#d4eef7",
        blue: "#6ab4d8",
        lilac: "#e8d5f5",
        cream: "#fffdf5",
        brown: "#7a5230"
      },
      fontFamily: {
        display: ["\"Palatino Linotype\"", "\"Book Antiqua\"", "Palatino", "serif"],
        body: ["\"Trebuchet MS\"", "\"Segoe UI\"", "sans-serif"]
      },
      boxShadow: {
        soft: "0 14px 45px rgba(122, 82, 48, 0.12)",
        lilac: "0 14px 55px rgba(168, 123, 200, 0.18)",
        coral: "0 10px 30px rgba(244, 132, 95, 0.28)"
      }
    }
  },
  plugins: []
};
