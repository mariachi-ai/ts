import type { Theme } from '../engine/theme';
import { basalt } from './basalt';
import { broadsheet } from './broadsheet';
import { bazaar } from './bazaar';
import { brutalist } from './brutalist';
import { carbon } from './carbon';
import { cadence } from './cadence';
import { ember } from './ember';
import { cirrus } from './cirrus';
import { confetti } from './confetti';
import { halcyon } from './halcyon';
import { meridian } from './meridian';
import { flint } from './flint';
import { comet } from './comet';
import { reel } from './reel';
import { aria } from './aria';
import { onyx } from './onyx';
import { marigold } from './marigold';
import { marquee } from './marquee';
import { linen } from './linen';
import { quill } from './quill';
import { hearth } from './hearth';
import { harbor } from './harbor';
import { prism } from './prism';
import { volt } from './volt';
import { sprint } from './sprint';
import { summit } from './summit';
import { heather } from './heather';
import { saffron } from './saffron';
import { nocturne } from './nocturne';
import { vellum } from './vellum';
import { chalk } from './chalk';
import { margin } from './margin';
import { quire } from './quire';
import { editorial } from './editorial';
import { enterprise } from './enterprise';
import { fennel } from './fennel';
import { folio } from './folio';
import { minimal } from './minimal';
import { obsidian } from './obsidian';
import { mosaic } from './mosaic';
import { ochre } from './ochre';
import { soft } from './soft';
import { solace } from './solace';
import { terminal } from './terminal';
import { zephyr } from './zephyr';
import { terracotta } from './terracotta';
import { transit } from './transit';

/** Built-in presets, in display order. */
export const presets = {
  minimal,
  brutalist,
  editorial,
  soft,
  enterprise,
  terminal,
  // The design archetypes (src/archetypes): complete languages an app is built from
  halcyon,
  fennel,
  basalt,
  ember,
  cirrus,
  zephyr,
  onyx,
  terracotta,
  marigold,
  linen,
  quill,
  folio,
  broadsheet,
  obsidian,
  carbon,
  cadence,
  mosaic,
  bazaar,
  transit,
  hearth,
  harbor,
  prism,
  confetti,
  volt,
  sprint,
  summit,
  solace,
  heather,
  saffron,
  nocturne,
  vellum,
  chalk,
  ochre,
  margin,
  quire,
  meridian,
  flint,
  comet,
  marquee,
  reel,
  aria,
} satisfies Record<string, Theme>;
export type PresetName = keyof typeof presets;

export { aria, basalt, bazaar, broadsheet, brutalist, cadence, carbon, chalk, cirrus, comet, confetti, editorial, ember, enterprise, fennel, flint, folio, halcyon, harbor, hearth, heather, linen, margin, marigold, marquee, meridian, minimal, mosaic, nocturne, obsidian, ochre, onyx, prism, quill, quire, reel, saffron, soft, solace, sprint, summit, terminal, terracotta, transit, vellum, volt, zephyr };
