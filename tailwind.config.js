/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          blue: {
            light: '#BEE1E6',
            DEFAULT: '#A0C4FF',
            dark: '#6EA8FE'
          },
          pink: {
            light: '#FDE2E4',
            DEFAULT: '#FFC6FF',
            dark: '#FF85A1'
          },
          mint: '#E2ECE9',
          lavender: '#DFE7FD',
          periwinkle: '#CDDAFD',
          card: '#FFFFFF',
          bg: '#FAFAFA',
          text: '#1E293B',
          muted: '#64748B'
        }
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 14px 40px rgba(0, 0, 0, 0.08)',
        'glow-pink': '0 0 25px rgba(255, 198, 255, 0.5)',
        'glow-blue': '0 0 25px rgba(160, 196, 255, 0.5)',
      }
    },
  },
  plugins: [],
}
