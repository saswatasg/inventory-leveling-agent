/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Upcore dark-navy family
        navy: {
          900: '#07101e', // deepest page background
          800: '#0a1628', // section break
          700: '#0d1c34', // layered surface
        },
        card: '#0f2040',
        line: '#1c3354',
        accent: {
          DEFAULT: '#28ACD2', // brief-specified cyan accent
          soft: '#5fc6e6',
          dim: '#1d7fa0',
        },
        mint: '#3dddc4', // Upcore highlight / "capital freed" success accent
        txt: {
          DEFAULT: '#ffffff',
          2: '#8bbed4',
          3: '#3a6080',
        },
        // status palette (standard, reads instantly)
        critical: '#ef4444',
        low: '#fbbf24',
        optimal: '#4ade80',
        overstocked: '#3b82f6',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
