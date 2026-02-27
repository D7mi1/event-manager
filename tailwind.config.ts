import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 1. ألوان مِراس (متوافقة مع shadcn/ui)
      colors: {
        background: {
          DEFAULT: '#0F0F12',
          card: '#18181B',
          surface: '#27272A'
        },
        primary: {
          400: '#60A5FA',
          500: '#3B82F6', // الأزرق الأساسي
          600: '#2563EB',
        },
        action: {
          DEFAULT: '#2563EB',
        }
      },
      // 2. إعدادات النصوص للمدونة
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': '#D4D4D8',
            '--tw-prose-headings': '#FFFFFF',
            '--tw-prose-lead': '#A1A1AA',
            '--tw-prose-links': '#3B82F6',
            '--tw-prose-bold': '#FFFFFF',
            '--tw-prose-counters': '#3B82F6',
            '--tw-prose-bullets': '#3B82F6',
            '--tw-prose-hr': '#3F3F46',
            '--tw-prose-quotes': '#F4F4F5',
            '--tw-prose-quote-borders': '#3B82F6',

            fontSize: '1.125rem',

            p: {
              marginTop: '2.5em',
              marginBottom: '2.5em',
              lineHeight: '2.4',
              color: '#D4D4D8',
            },

            'h2, h3': {
              marginTop: '3em',
              marginBottom: '1.5em',
            },

            h3: {
              color: '#3B82F6',
              fontSize: '1.75rem',
            },

            li: {
              marginTop: '1em',
              marginBottom: '1em',
            },

            a: {
              textDecoration: 'none',
              fontWeight: '600',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
