/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "var(--ink-900)",
          800: "var(--ink-800)",
          700: "var(--ink-700)",
          600: "var(--ink-600)",
          500: "var(--ink-500)",
          400: "var(--ink-400)",
          300: "var(--ink-300)",
        },
        paper: {
          100: "var(--paper-100)",
          200: "var(--paper-200)",
          300: "var(--paper-300)",
        },
        saffron: {
          400: "var(--saffron-400)",
          500: "var(--saffron-500)",
          600: "var(--saffron-600)",
        },
        blue: {
          400: "var(--blue-400)",
          500: "var(--blue-500)",
          600: "var(--blue-600)",
        },
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
        mono: "var(--font-mono)",
      },
      maxWidth: {
        prose: "var(--max-prose)",
        wide: "var(--max-wide)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      transitionTimingFunction: {
        "ease-out-expo": "var(--ease-out)",
        "ease-in-out-expo": "var(--ease-in-out)",
      },
    },
  },
  plugins: [],
};
