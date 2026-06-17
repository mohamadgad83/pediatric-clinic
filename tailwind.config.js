/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // تفعل الوضع الداكن بشكل ذكي عبر كلاس المظهر المريح للعين
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        // الحركات القديمة الخاصة بمشروعك
        'spin-slow': 'spin-slow 20s linear infinite',
        'bounce-delay': 'bounce-delay 0.5s ease-in-out infinite',
        
        // الحركة المضافة الجديدة الخاصة بمؤشر كفاءة العيادة (سرعة دوران هادئة تليق بالهوية الطبية)
        'spin-slow-medical': 'spin 8s linear infinite', 
      },
      keyframes: {
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'bounce-delay': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
