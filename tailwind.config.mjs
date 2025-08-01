/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      width: {
        '62': '15.5rem', // 248px
        '72': '18rem',   // 288px
      },
      colors: {
        // Основна палітра для блогу
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        gray: {
          50: '#f2f3f7', // Changed from #f9fafb
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        // Rainbow button colors
        "color-1": "hsl(var(--color-1))",
        "color-2": "hsl(var(--color-2))",
        "color-3": "hsl(var(--color-3))",
        "color-4": "hsl(var(--color-4))",
        "color-5": "hsl(var(--color-5))",
      },
      animation: {
        rainbow: "rainbow var(--speed, 2s) infinite linear",
      },
      keyframes: {
        rainbow: {
          "0%": { "background-position": "0%" },
          "100%": { "background-position": "200%" },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': 'rgb(var(--tw-prose-body))',
            '--tw-prose-headings': 'rgb(var(--tw-prose-headings))',
            '--tw-prose-lead': 'rgb(var(--tw-prose-lead))',
            '--tw-prose-links': 'rgb(var(--tw-prose-links))',
            '--tw-prose-bold': 'rgb(var(--tw-prose-bold))',
            '--tw-prose-counters': 'rgb(var(--tw-prose-counters))',
            '--tw-prose-bullets': 'rgb(var(--tw-prose-bullets))',
            '--tw-prose-hr': 'rgb(var(--tw-prose-hr))',
            '--tw-prose-quotes': 'rgb(var(--tw-prose-quotes))',
            '--tw-prose-quote-borders': 'rgb(var(--tw-prose-quote-borders))',
            '--tw-prose-captions': 'rgb(var(--tw-prose-captions))',
            '--tw-prose-code': 'rgb(var(--tw-prose-code))',
            '--tw-prose-pre-code': 'rgb(var(--tw-prose-pre-code))',
            '--tw-prose-pre-bg': 'rgb(var(--tw-prose-pre-bg))',
            '--tw-prose-th-borders': 'rgb(var(--tw-prose-th-borders))',
            '--tw-prose-td-borders': 'rgb(var(--tw-prose-td-borders))',
            
            maxWidth: 'none',
            color: 'var(--tw-prose-body)',
            lineHeight: '1.7',
            
            // Заголовки
            'h1, h2, h3, h4, h5, h6': {
              color: 'var(--tw-prose-headings)',
              fontWeight: '600',
            },
            
            // Посилання
            a: {
              color: 'var(--tw-prose-links)',
              textDecoration: 'underline',
              fontWeight: '500',
              '&:hover': {
                color: theme('colors.primary.700'),
              },
            },
            
            // Код
            code: {
              color: 'var(--tw-prose-code)',
              backgroundColor: 'var(--tw-prose-pre-bg)',
              padding: '0.25rem 0.375rem',
              borderRadius: '0.375rem',
              fontSize: '0.875em',
              fontWeight: '600',
            },
            
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            
            // Блоки коду
            pre: {
              color: 'var(--tw-prose-pre-code)',
              backgroundColor: 'var(--tw-prose-pre-bg)',
              overflowX: 'auto',
              fontWeight: '400',
              fontSize: '0.875em',
              lineHeight: '1.7142857',
              marginTop: '1.7142857em',
              marginBottom: '1.7142857em',
              borderRadius: '0.375rem',
              paddingTop: '0.8571429em',
              paddingRight: '1.1428571em',
              paddingBottom: '0.8571429em',
              paddingLeft: '1.1428571em',
            },
            
            'pre code': {
              backgroundColor: 'transparent',
              borderWidth: '0',
              borderRadius: '0',
              padding: '0',
              fontWeight: 'inherit',
              color: 'inherit',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              lineHeight: 'inherit',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 