/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // v4 Design System
        bg: '#050608',
        layer1: '#0C1017',
        layer2: '#121826',
        layer3: '#171F2D',
        cards: '#1C2535',
        surface: '#121826', // Alias for layer2
        elevated: '#171F2D', // Alias for layer3
        highest: '#1C2535',
        border: 'rgba(255,255,255,0.08)',
        glass: 'rgba(255,255,255,0.05)',

        // Semantic Colors
        citizen: '#2563EB', // Blue
        ai: '#7C3AED', // Purple
        resolved: '#10B981', // Emerald
        warning: '#F59E0B', // Amber
        critical: '#EF4444', // Red
        leaderboard: '#EAB308', // Gold
        xp: '#F97316', // Orange
        notifications: '#EC4899', // Pink
        map: '#06B6D4', // Cyan
        infrastructure: '#64748B', // Slate

        primary: {
          DEFAULT: '#2563EB',
          light: '#3B82F6',
          dark: '#1D4ED8',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        accent: {
          DEFAULT: '#7C3AED',
          light: '#8B5CF6',
          dark: '#6D28D9',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
          400: '#34D399',
          500: '#10B981',
        },
        danger: {
          DEFAULT: '#EF4444',
          400: '#FCA5A5',
          500: '#EF4444',
        },

        // Text
        'text-primary': '#F9FAFB',
        'text-secondary': '#9CA3AF',
        'text-tertiary': '#6B7280',
        'text-muted': '#4B5563',

        // Category colors
        'cat-pothole': '#F97316',
        'cat-water': '#2563EB', // Using Citizen Blue
        'cat-light': '#EAB308', // Using Leaderboard Gold
        'cat-garbage': '#10B981', // Using Resolved Emerald
        'cat-sewage': '#7C3AED', // Using AI Purple
        'cat-encroach': '#EF4444', // Using Critical Red

        // Legacy compatibility
        'on-primary': '#ffffff',
        'on-secondary': '#ffffff',
        'on-surface': '#F9FAFB',
        'on-surface-variant': '#9CA3AF',
        'on-background': '#F9FAFB',
        'surface-container': '#0C1017',
        'surface-container-low': '#121826',
        'surface-container-lowest': '#050608',
        'surface-container-high': '#171F2D',
        'surface-container-highest': '#1C2535',
        outline: 'rgba(255,255,255,0.3)',
        'outline-variant': 'rgba(255,255,255,0.08)',
        'surface-dim': '#050608',
        'surface-bright': '#121826',
        'inverse-surface': '#F9FAFB',
        'inverse-on-surface': '#050608',
        error: '#EF4444',
        'on-error': '#ffffff',
        'error-container': 'rgba(239,68,68,0.15)',
        'on-error-container': '#FCA5A5',
        secondary: '#7C3AED',
        'secondary-container': 'rgba(124,58,237,0.2)',
        'on-secondary-container': '#A78BFA',
        tertiary: '#10B981',
        'tertiary-container': 'rgba(16,185,129,0.2)',
        'on-tertiary-container': '#34D399',
        background: '#050608',
      },

      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        headline: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        label: ['Inter', 'sans-serif'],
        'label-md': ['Inter', 'sans-serif'],
        'body-md': ['Inter', 'sans-serif'],
        'body-lg': ['Inter', 'sans-serif'],
        'headline-md': ['Space Grotesk', 'sans-serif'],
        'headline-lg': ['Space Grotesk', 'sans-serif'],
        'headline-xl': ['Space Grotesk', 'sans-serif'],
        'headline-xl-mobile': ['Space Grotesk', 'sans-serif'],
        caption: ['Inter', 'sans-serif'],
      },

      fontSize: {
        display: ['72px', { lineHeight: '1.05', fontWeight: '700', letterSpacing: '-0.03em' }],
        'headline-xl': ['56px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.03em' }],
        'headline-xl-mobile': [
          '36px',
          { lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.02em' },
        ],
        'headline-lg': ['36px', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '-0.02em' }],
        'headline-md': ['24px', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.01em' }],
        'headline-sm': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.7', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '1.4', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
        caption: ['12px', { lineHeight: '1.5', fontWeight: '400' }],
      },

      spacing: {
        'margin-mobile': '16px',
        'margin-desktop': '64px',
        'container-max': '1280px',
        gutter: '24px',
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '48px',
        base: '8px',
      },

      borderRadius: {
        DEFAULT: '6px',
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '20px',
        '2xl': '28px',
        '3xl': '36px',
        full: '9999px',
      },

      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.3)',
        md: '0 4px 16px rgba(0,0,0,0.4)',
        lg: '0 12px 40px rgba(0,0,0,0.5)',
        xl: '0 24px 64px rgba(0,0,0,0.6)',
        card: '0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.5)',
        'glow-blue': '0 0 24px rgba(37,99,235,0.3)',
        'glow-violet': '0 0 24px rgba(124,58,237,0.3)',
        'glow-green': '0 0 20px rgba(16,185,129,0.25)',
        nav: '0 2px 8px rgba(0,0,0,0.3)',
      },

      animation: {
        'fade-up': 'fade-up 0.5s ease forwards',
        'fade-in': 'fade-in 0.3s ease forwards',
        'scale-in': 'scale-in 0.35s ease forwards',
        'slide-right': 'slide-in-right 0.4s ease forwards',
        float: 'float 4s ease-in-out infinite',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        gradient: 'gradient-shift 4s ease infinite',
        'rotate-slow': 'rotate-slow 12s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'ping-slow': 'ping-slow 2s ease-in-out infinite',
        'mesh-float-1': 'mesh-float-1 18s ease-in-out infinite',
        'mesh-float-2': 'mesh-float-2 22s ease-in-out infinite',
        'bounce-soft': 'bounce-soft 0.5s ease-out',
      },

      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'rotate-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'ping-slow': {
          '0%,100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.4)', opacity: '0.6' },
        },
        'mesh-float-1': {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(5%,8%) scale(1.08)' },
          '66%': { transform: 'translate(-4%,4%) scale(0.95)' },
        },
        'mesh-float-2': {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(-6%,-5%) scale(1.05)' },
          '66%': { transform: 'translate(4%,-8%) scale(1.1)' },
        },
        'bounce-soft': {
          '0%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },

      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '20px',
        xl: '32px',
        '2xl': '48px',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
