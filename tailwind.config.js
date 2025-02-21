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
        black: '#00020B',
      },
      fontFamily: {
        seasons: [
          'Seasons',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
        ],

        hand: ['Caveat', 'cursive'],
        mono: ['Space Mono', 'monospace'],
      },

      fontVariationSettings: {
        normal: '"wght" 100 900, "slnt" 0, "ital" 0',
      },

      fontWeight: {
        thin: 100,
        light: 300,
        regular: 360,
        medium: 460,
        semibold: 600,
        bold: 640,
        black: 900,
      },

      fontStyle: {
        normal: 'normal',
      },

      fontSize: {
        xs: '0.75rem',
        sm: '0.9rem',
        base: '1.175rem',
        md: '1.4rem',
        lg: '1.65rem',
        xl: '1.9rem',
        '2xl': '2.15rem',
        '3xl': '2.4rem',
        '4xl': '2.65rem',
        '5xl': '2.9rem',
        '6xl': '3.15rem',
        '7xl': '3.4rem',
      },

      letterSpacing: {
        tightest: '-0.045em', // 0.25% wider
        tighter: '-0.035em', // 0.25% wider
        tight: '-0.015em', // Loosened for better spacing
        normal: '0.0125em', // 0.25% wider
        wide: '0.025em', // 0.25% wider
        wider: '0.035em', // 0.25% wider
        widest: '0.045em', // 0.25% wider
        extraWide: '0.055em', // 0.25% wider
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
