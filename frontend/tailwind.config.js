/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ffis: {
          navy: '#0B1720',
          'navy-dark': '#070F15',
          'navy-light': '#10222F',
          'industrial-blue': '#163A4A',
          'steel-blue': '#315A68',
          'steel-light': '#4A7C8E',
          amber: '#F2B233',
          'amber-hover': '#F5BE4D',
          'amber-dark': '#D9981E',
          'warm-white': '#F5F3ED',
          'light-grey': '#E5E8E6',
          'dark-text': '#172027',
          'neutral-text': '#6B7880',
          'border-steel': '#315A68',
          'status-healthy': '#22C55E',
          'status-risk': '#F2B233',
          'status-critical': '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace']
      },
      boxShadow: {
        'industrial': '0 4px 20px -2px rgba(11, 23, 32, 0.5)',
        'industrial-lg': '0 10px 30px -4px rgba(11, 23, 32, 0.7)',
        'amber-subtle': '0 0 15px rgba(242, 178, 51, 0.15)'
      }
    },
  },
  plugins: [],
}
