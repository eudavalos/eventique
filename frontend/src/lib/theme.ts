import type { PaletteKey } from '../types';

interface PaletteColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
}

export const palettes: Record<Exclude<PaletteKey, 'custom'>, PaletteColors> = {
  'nature': {
    primary: '#3E7B57',
    primaryLight: '#5A9E74',
    primaryDark: '#2B5840',
    secondary: '#EFF7EC',
    accent: '#C9A93C',
    bg: '#F8FCF6',
    surface: '#FFFFFF',
    text: '#1C2D22',
    textMuted: '#5D7A67',
    border: '#C4D9CA',
  },
  'rose-gold': {
    primary: '#B76E79',
    primaryLight: '#D4939D',
    primaryDark: '#8F4652',
    secondary: '#F5F0EB',
    accent: '#C9A84C',
    bg: '#FAF7F2',
    surface: '#FFFFFF',
    text: '#2A1F1A',
    textMuted: '#8B7355',
    border: '#E8DDD4',
  },
  'garden': {
    primary: '#5E7D5B',
    primaryLight: '#80A07D',
    primaryDark: '#3C5A39',
    secondary: '#F2F5EE',
    accent: '#C4A45A',
    bg: '#F8F9F5',
    surface: '#FFFFFF',
    text: '#1E2D1B',
    textMuted: '#6B7B5A',
    border: '#D8E4D0',
  },
  'navy-gold': {
    primary: '#1C2D5A',
    primaryLight: '#2D4480',
    primaryDark: '#0F1A38',
    secondary: '#F8F5EE',
    accent: '#C9A84C',
    bg: '#F8F5EE',
    surface: '#FFFFFF',
    text: '#0F1835',
    textMuted: '#5A6070',
    border: '#D5C9A8',
  },
  'sage': {
    primary: '#8FA68A',
    primaryLight: '#A8C0A3',
    primaryDark: '#6B8066',
    secondary: '#F5F3EF',
    accent: '#C4B5A5',
    bg: '#FAFAF7',
    surface: '#FFFFFF',
    text: '#2D2D2D',
    textMuted: '#7A7A7A',
    border: '#E0DBD3',
  },
  'midnight': {
    primary: '#9B5A6A',
    primaryLight: '#BB7A8A',
    primaryDark: '#73384A',
    secondary: '#23213A',
    accent: '#E8C977',
    bg: '#13111E',
    surface: '#1E1C2E',
    text: '#F0E6DC',
    textMuted: '#A09080',
    border: '#30283C',
  },
};

const cssVarMap: Record<keyof PaletteColors, string> = {
  primary: '--color-primary',
  primaryLight: '--color-primary-light',
  primaryDark: '--color-primary-dark',
  secondary: '--color-secondary',
  accent: '--color-accent',
  bg: '--color-bg',
  surface: '--color-surface',
  text: '--color-text',
  textMuted: '--color-text-muted',
  border: '--color-border',
};

export function applyTheme(palette: PaletteKey, customColors?: Partial<PaletteColors>): void {
  const base = palette !== 'custom' ? palettes[palette] : palettes['rose-gold'];
  const colors: PaletteColors = { ...base, ...customColors };
  const root = document.documentElement;

  (Object.keys(cssVarMap) as Array<keyof PaletteColors>).forEach((key) => {
    root.style.setProperty(cssVarMap[key], colors[key]);
  });
}

export function applyFonts(heading: string, subheading: string, body: string): void {
  const root = document.documentElement;
  root.style.setProperty('--font-heading', `'${heading}', Georgia, serif`);
  root.style.setProperty('--font-subheading', `'${subheading}', Georgia, serif`);
  root.style.setProperty('--font-body', `'${body}', system-ui, sans-serif`);
}
