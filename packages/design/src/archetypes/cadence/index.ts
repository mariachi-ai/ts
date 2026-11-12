import type { Archetype } from '../types';
import { cadenceRecipes } from './recipes';

export const cadenceArchetype: Archetype = {
  id: 'cadence',
  category: 'content-first',
  tags: {
    feel: ['immersive', 'bold', 'dark', 'lively', 'confident'],
    density: 'dense',
    mode: 'dark-first',
    suits: ['music', 'audio', 'podcasts', 'streaming', 'media', 'video', 'playlists', 'libraries', 'entertainment'],
    style: ['dark', 'near-black', 'green', 'pill buttons', 'cover art', 'bold type', 'rounded panels', 'track lists'],
  },
  for: 'Music, audio and media apps where the content is the hero and people browse for hours',
  pitch:
    'Near-black panels in a black frame, one bright green for play, huge bold titles over a wash of colour, cover art everywhere and lists dense enough to scan in seconds.',
  swatches: [
    'color.bg.sunken',
    'color.bg.canvas',
    'color.bg.surface',
    'color.fg.default',
    'color.fg.muted',
    'color.brand.default',
  ],
  type: { body: 'Figtree', heading: 'Figtree', mono: 'DM Mono' },
  icons: {
    set: 'lucide',
    stroke: 2,
    size: { text: 16, control: 16 },
    style: 'outline',
    actions: {
      add: 'plus',
      edit: 'pencil',
      delete: 'trash-2',
      settings: 'settings',
      search: 'search',
      filter: 'list-filter',
      more: 'ellipsis',
      close: 'x',
      back: 'chevron-left',
      forward: 'chevron-right',
      expand: 'chevron-down',
      download: 'circle-arrow-down',
      upload: 'upload',
      copy: 'copy',
      external: 'external-link',
      send: 'send',
      refresh: 'refresh-cw',
      user: 'user',
      notifications: 'bell',
      calendar: 'calendar',
      help: 'circle-help',
      info: 'info',
      success: 'circle-check',
      warning: 'triangle-alert',
      error: 'circle-alert',
    },
  },
  charts: {
    // The green first; then the blue, pink, orange and violet of the reference's genre tiles and
    // published sets. Light uses the published darker steps so lines read on white
    categorical: [
      { name: 'Green', light: '#159542', dark: '#1ed760' },
      { name: 'Blue', light: '#0d72ea', dark: '#539df5' },
      { name: 'Pink', light: '#dc148c', dark: '#f573a0' },
      { name: 'Orange', light: '#bf6d00', dark: '#ffa42b' },
      { name: 'Violet', light: '#8400e7', dark: '#b49bc8' },
    ],
  },
  density: { default: 1, dense: 0.85 },
  recipes: cadenceRecipes,
};
