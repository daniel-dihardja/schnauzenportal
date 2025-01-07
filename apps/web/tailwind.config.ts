import type { Config } from 'tailwindcss';
import { createGlobPatternsForDependencies } from '@nx/react/tailwind';
import { nextui } from '@nextui-org/react';

export default {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    ...createGlobPatternsForDependencies(__dirname),
    '../../node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [nextui()],
} satisfies Config;
