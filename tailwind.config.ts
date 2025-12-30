import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // هذا السطر يبحث داخل مجلد app وجميع المجلدات الفرعية فيه
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // هذا السطر يبحث في مجلد components الخارجي الذي تضعه في الجذر
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // هذا السطر يبحث احتياطاً في أي مكان آخر
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0F0F12',
          card: '#18181B',
          surface: '#27272A'
        },
        primary: {
          400: '#D4B483', 
          500: '#C19D65', // اللون الذهبي الفخم
          600: '#A4824E',
        },
        action: {
          DEFAULT: '#2563EB', // الأزرق للأعمال
        }
      },
    },
  },
  plugins: [],
};
export default config;