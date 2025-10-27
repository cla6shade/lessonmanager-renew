import { defineConfig, createSystem, defaultConfig } from '@chakra-ui/react';

const colors = {
  brandDark: '#ae895d',
  brand: '#cdb97e',
  brandPanel: '#1c252c',
  brandPanelDark: '#151d23',
};

export const brandPalette = {
  50: '#faf9f7',
  100: '#f4f1eb',
  200: '#e8e0d4',
  300: '#dac8b3',
  400: colors.brand,
  500: colors.brand,
  600: colors.brandDark,
  700: '#9a7952',
  800: '#7d6142',
  900: '#5f4932',
  950: '#3d2f20',
};

export const themeConfig = defineConfig({
  theme: {
    semanticTokens: {
      colors: {
        brand: {
          50: { value: brandPalette[50] },
          100: { value: brandPalette[100] },
          200: { value: brandPalette[200] },
          300: { value: brandPalette[300] },
          400: { value: brandPalette[400] },
          500: { value: brandPalette[500] },
          600: { value: brandPalette[600] },
          700: { value: brandPalette[700] },
          800: { value: brandPalette[800] },
          900: { value: brandPalette[900] },
          950: { value: brandPalette[950] },
        },
      },
    },
    tokens: {
      colors: {
        brand: {
          50: { value: brandPalette[50] },
          100: { value: brandPalette[100] },
          200: { value: brandPalette[200] },
          300: { value: brandPalette[300] },
          400: { value: brandPalette[400] },
          500: { value: brandPalette[500] },
          600: { value: brandPalette[600] },
          700: { value: brandPalette[700] },
          800: { value: brandPalette[800] },
          900: { value: brandPalette[900] },
          950: { value: brandPalette[950] },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, themeConfig);

export default colors;
