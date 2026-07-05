/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0b',
        sidebar: '#111112',
        card: '#161618',
        border: '#27272a',
        primary: '#3b82f6',
        primaryDark: '#2563eb',
        brand: {
          qr: '#009de2',
          qrHover: '#008bc9',
          smartlink: '#8b5cf6',
          smartlinkHover: '#7e22ce',
          orange: '#f97316',
        }
      }
    },
  },
  plugins: [],
}
