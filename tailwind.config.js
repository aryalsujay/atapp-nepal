/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Teacher (Orange/Brown)
        sf: '#D4760E',
        sfd: '#A85C08',
        sfl: '#FDF1E3',
        sfm: '#FAE0C0',

        // Approved / Forest (Green)
        fo: '#3D6847',
        fol: '#E8F2EA',
        fom: '#C8DFCB',

        // Neutral / Surface (Beige/Cream)
        cr: '#F8F3EB',
        cr2: '#F0E9DC',
        cr3: '#E5DDD0',

        // Text (Brown scale)
        tx: '#1C1410',
        tx2: '#7A6A58',
        tx3: '#B0A090',

        // Borders
        bd: '#EAE2D4',
        bd2: '#DDD4C5',

        // Error / Urgent (Red)
        ur: '#C0392B',
        url: '#FDECEA',

        // Gold
        gd: '#C89000',
        gdl: '#FFF8E3',

        // Admin (Blue)
        bl: '#1A5C96',
        bll: '#E6F0FA',

        // Server (Tan/Brown)
        sv: '#8B5E14',
        svl: '#FBF0E0',
        svm: '#F5DFB8',
      },
      fontFamily: {
        sans: ['PlusJakartaSans', 'system-ui'],
        devanagari: ['NotoSansDevanagari', 'system-ui'],
      },
      borderRadius: {
        card: '14px',
        chip: '20px',
        input: '12px',
      },
    },
  },
  plugins: [],
};
