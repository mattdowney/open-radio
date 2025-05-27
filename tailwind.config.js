/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        white: '#FBFBFB',
        pink: '#FF65D2',
        orange: '#FF5101',
        yellow: '#FFF200',
        green: '#5EEDA1',
        blue: '#002EFF',
        dark: '#2E2F35',
        black: '#000000',
      },
      fontFamily: {
        sans: [
          "Geist",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        
        geist: [
          "Geist",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        
        polymath: [
          "Polymath",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        
        hand: ["Caveat", "cursive"],
        mono: [
          "Geist Mono",
          "Space Mono",
          "monospace",
        ],
      },

      fontVariationSettings: {
      normal: '"wght" 100 900, "slnt" 0, "ital" 0',
    },

    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      regular: 360,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },

    fontSize: {
      xs: "0.75rem",
      sm: "0.85rem",
      base: "1.1rem",
      md: "1.3rem",
      lg: "1.5rem",
      xl: "1.8rem",
      "2xl": "2rem",
      "3xl": "2.2rem",
      "4xl": "2.45rem",
      "5xl": "2.6rem",
      "6xl": "3rem",
      "7xl": "3.12rem",
    },

    letterSpacing: {
      tightest: "-0.045em", // 0.25% wider
      tighter: "-0.035em", // 0.25% wider
      tight: "-0.015em", // Loosened for better spacing
      normal: "0.0125em", // 0.25% wider
      wide: "0.025em", // 0.25% wider
      wider: "0.035em", // 0.25% wider
      widest: "0.045em", // 0.25% wider
      extraWide: "0.055em", // 0.25% wider
    },

      animation: {
        'spin-fast': 'spin 0.6s linear infinite',
        'fade-in-dramatic': 'fadeInDramatic 1.2s ease-out forwards',
        'spin-pulse': 'spinAndPulse 120s linear infinite',
        'spin-only': 'spinOnly 120s linear infinite',
        marquee: 'marquee 15s linear infinite',
      },
      keyframes: {
        fadeInDramatic: {
          '0%': {
            opacity: '0',
            transform: 'scale(1)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        spinAndPulse: {
          '0%': {
            transform: 'rotate(0deg) scale(1.75)',
          },
          '50%': {
            transform: 'rotate(180deg) scale(3.5)',
          },
          '100%': {
            transform: 'rotate(360deg) scale(1.75)',
          },
        },
        spinOnly: {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '100%': {
            transform: 'rotate(360deg)',
          },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },

    transitionDuration: {
      'duration-fast': '300ms',
      'duration-standard': '450ms',
      'duration-slow': '600ms',
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.font-width-normal': {
          fontVariationSettings: "'wdth' 100",
        },
        '.font-width-expanded': {
          fontVariationSettings: "'wdth' 110",
        },
        '.font-width-condensed': {
          fontVariationSettings: "'wdth' 90",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
