import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Clean Black & White Palette
        'primary': '#000000',      // Black for accents, text, buttons
        'secondary': '#FFFFFF',    // White for backgrounds
        'gray-light': '#F5F5F5',   // Very light gray for subtle backgrounds
        'gray-medium': '#E5E5E5',  // Medium gray for borders
        'gray-dark': '#333333',    // Dark gray for secondary text
      },
      fontFamily: {
        'inter-tight': ['var(--font-inter-tight)', 'Inter', 'sans-serif'],
        'montserrat': ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
        'jetbrains': ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      backdropBlur: {
        'glass': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(230, 179, 30, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(230, 179, 30, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
