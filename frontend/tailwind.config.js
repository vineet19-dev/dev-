/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        neonBlue: "0 0 30px rgba(34, 211, 238, 0.2)",
        neonRed: "0 0 24px rgba(248, 113, 113, 0.35)",
        neonGreen: "0 0 24px rgba(74, 222, 128, 0.35)",
        neonYellow: "0 0 24px rgba(250, 204, 21, 0.35)"
      },
      animation: {
        blink: "blink 1.2s linear infinite"
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" }
        }
      }
    }
  },
  plugins: []
};