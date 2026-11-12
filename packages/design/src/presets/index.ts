import type { Theme } from '../engine/theme';
import { basalt } from './basalt';
import { broadsheet } from './broadsheet';
import { bazaar } from './bazaar';
import { brutalist } from './brutalist';
import { carbon } from './carbon';
import { cadence } from './cadence';
import { ember } from './ember';
import { cirrus } from './cirrus';
import { halcyon } from './halcyon';
import { onyx } from './onyx';
import { marigold } from './marigold';
import { linen } from './linen';
import { quill } from './quill';
import { hearth } from './hearth';
import { harbor } from './harbor';
import { editorial } from './editorial';
import { enterprise } from './enterprise';
import { fennel } from './fennel';
import { folio } from './folio';
import { minimal } from './minimal';
import { obsidian } from './obsidian';
import { mosaic } from './mosaic';
import { soft } from './soft';
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
  hearth,
  harbor,
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
} satisfies Record<string, Theme>;
export type PresetName = keyof typeof presets;

export { basalt, bazaar, broadsheet, brutalist, cadence, carbon, cirrus, editorial, ember, enterprise, fennel, folio, halcyon, harbor, hearth, linen, marigold, minimal, mosaic, obsidian, onyx, quill, soft, terminal, terracotta, transit, zephyr };
