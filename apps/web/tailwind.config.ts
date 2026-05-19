import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:       '#0E2A78',
        'navy-deep':'#081C57',
        'navy-light':'#1B3FA0',
        'navy-soft':'#2A4FBF',
        jade:       '#00C48C',
        'jade-deep':'#00A372',
        'jade-soft':'#E6FAF3',
        'jade-ink': '#0A2A1E',
        orange:     '#FF6B35',
        'orange-soft':'#FFEEE6',
        ink:        '#0A0F1F',
        ink2:       '#1A1A2E',
        'lab-text': '#1A1A2E',
        'text-mute':'#5C6079',
        'text-soft':'#8A8FA6',
        line:       '#E6E8F0',
        'line-soft':'#EFF1F7',
        surface:    '#FFFFFF',
        surface2:   '#F8F9FC',
        surface3:   '#F1F3F9',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 4px rgba(14,42,120,0.03), 0 8px 20px rgba(14,42,120,0.06)',
        'card-lg': '0 10px 30px rgba(14,42,120,0.10)',
        jade: '0 10px 24px rgba(0,196,140,0.40)',
        'jade-sm': '0 6px 14px rgba(0,196,140,0.25)',
      },
      borderRadius: {
        xl2: '18px',
        xl3: '22px',
      },
    },
  },
  plugins: [],
}

export default config
