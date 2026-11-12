import type { Archetype } from '../types';
import { marqueeRecipes } from './recipes';

export const marqueeArchetype: Archetype = {
  id: 'marquee',
  category: 'content-first',
  tags: {
    feel: ['immersive', 'cinematic', 'dark', 'bold', 'dramatic'],
    density: 'balanced',
    mode: 'dark-first',
    suits: ['video', 'streaming', 'film', 'television', 'media', 'entertainment', 'catalogues', 'courses', 'libraries'],
    style: ['dark', 'near-black', 'red', 'hero billboard', 'poster rows', 'rounded cards', 'pill buttons', 'bold type'],
  },
  for: 'Video, film and streaming apps where people browse big artwork and press play',
  pitch:
    'A near-black screening room: a big rounded billboard with white and grey pills, rows of rounded posters that grow into a preview, one signature red, and plain light pages for the account.',
  swatches: [
    'color.bg.sunken',
    'color.bg.canvas',
    'color.bg.surface',
    'color.fg.default',
    'color.fg.muted',
    'color.brand.default',
  ],
  type: { body: 'Instrument Sans', heading: 'Instrument Sans', mono: 'Geist Mono' },
  icons: {
    set: 'lucide',
    stroke: 2,
    size: { text: 20, control: 20 },
    style: 'outline',
    actions: {
      add: 'plus',
      edit: 'pencil',
      delete: 'trash-2',
      settings: 'settings',
      search: 'search',
      filter: 'sliders-horizontal',
      more: 'ellipsis',
      close: 'x',
      back: 'arrow-left',
      forward: 'chevron-right',
      expand: 'chevron-down',
      download: 'arrow-down-to-line',
      upload: 'arrow-up-from-line',
      copy: 'copy',
      external: 'external-link',
      send: 'send',
      refresh: 'rotate-cw',
      user: 'circle-user',
      notifications: 'bell',
      calendar: 'calendar',
      help: 'circle-help',
      info: 'info',
      success: 'circle-check',
      warning: 'triangle-alert',
      error: 'circle-x',
    },
  },
  charts: {
    // The red first; then the published success green, warning amber and the account blue, and a
    // violet from the account page's plan gradient. Light uses darker steps so lines read on white
    categorical: [
      { name: 'Red', light: '#e50914', dark: '#e50914' },
      { name: 'Blue', light: '#0071eb', dark: '#448ef4' },
      { name: 'Green', light: '#1f8f57', dark: '#2bb871' },
      { name: 'Amber', light: '#a86f00', dark: '#d89d31' },
      { name: 'Violet', light: '#7a3cb3', dark: '#a875e0' },
    ],
  },
  density: { default: 1, dense: 0.85 },
  recipes: marqueeRecipes,
};
