import type { Archetype } from '../types';
import { calmTrustRecipes } from './recipes';

export const calmTrustArchetype: Archetype = {
  id: 'calm-trust',
  for: 'Money, health, insurance: anything where people need to feel safe',
  pitch: 'Quiet, exact and reassuring: every figure lines up, and nothing happens without saying so first.',
  swatches: [
    'color.bg.canvas',
    'color.bg.surface',
    'color.fg.default',
    'color.accent.default',
    'color.success.solid',
    'color.danger.solid',
  ],
  type: { body: 'Inter', heading: 'Inter', mono: 'Geist Mono' },
  icons: { set: 'lucide', stroke: 1.5, size: { text: 20, control: 16 }, style: 'outline' },
  charts: {
    categorical: [
      { name: 'Deep blue', light: 'oklch(0.48 0.13 255)', dark: 'oklch(0.68 0.12 245)' },
      { name: 'Teal', light: 'oklch(0.52 0.09 190)', dark: 'oklch(0.72 0.09 190)' },
      { name: 'Amber', light: 'oklch(0.6 0.13 70)', dark: 'oklch(0.78 0.12 75)' },
      { name: 'Violet', light: 'oklch(0.5 0.13 295)', dark: 'oklch(0.72 0.11 295)' },
      { name: 'Slate', light: 'oklch(0.52 0.03 255)', dark: 'oklch(0.72 0.02 255)' },
    ],
  },
  density: { default: 1, dense: 0.85 },
  recipes: calmTrustRecipes,
};
