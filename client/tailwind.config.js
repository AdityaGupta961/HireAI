/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'SF Pro Text', 'SF Pro Icons', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['SF Pro Display', 'SF Pro Icons', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'display-large': ['56px', { lineHeight: '1.07143', letterSpacing: '-.005em', fontWeight: '700' }],
        'display-medium': ['48px', { lineHeight: '1.08349', letterSpacing: '-.002em', fontWeight: '700' }],
        'display-small': ['40px', { lineHeight: '1.1', letterSpacing: '0em', fontWeight: '700' }],
        'headline-large': ['32px', { lineHeight: '1.125', letterSpacing: '.004em', fontWeight: '600' }],
        'headline-medium': ['28px', { lineHeight: '1.14286', letterSpacing: '.007em', fontWeight: '600' }],
        'headline-small': ['24px', { lineHeight: '1.16667', letterSpacing: '.009em', fontWeight: '600' }],
        'body-large': ['17px', { lineHeight: '1.47059', letterSpacing: '-.022em', fontWeight: '400' }],
        'body-medium': ['14px', { lineHeight: '1.42859', letterSpacing: '-.016em', fontWeight: '400' }],
        'body-small': ['12px', { lineHeight: '1.33337', letterSpacing: '-.01em', fontWeight: '400' }],
      },
      colors: {
        apple: {
          black: '#1d1d1f',
          white: '#f5f5f7',
          gray: {
            light: '#86868b',
            medium: '#6e6e73',
            dark: '#424245',
          },
          blue: '#2997ff',
          'blue-dark': '#06c',
          silver: '#f5f5f7',
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      height: {
        'screen-90': '90vh',
        'screen-80': '80vh',
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(20px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.41, 0.1, 0.2, 1)',
        'slide-in': 'slideIn 1s cubic-bezier(0.41, 0.1, 0.2, 1)',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.41, 0.1, 0.2, 1)',
        'scale-in': 'scaleIn 0.8s cubic-bezier(0.41, 0.1, 0.2, 1)',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
}
