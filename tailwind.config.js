/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          green: '#25D366',
          lightgreen: '#DCF8C6',
          darkgreen: '#075E54',
          teal: '#128C7E',
          background: '#ECE5DD',
        },
      },
    },
  },
  plugins: [],
}
