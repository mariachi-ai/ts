import type { Theme } from '../engine/theme';
import { basalt } from './basalt';
import { broadsheet } from './broadsheet';
import { brutalist } from './brutalist';
import { ember } from './ember';
import { cirrus } from './cirrus';
import { halcyon } from './halcyon';
import { onyx } from './onyx';
import { marigold } from './marigold';
import { linen } from './linen';
import { quill } from './quill';
import { editorial } from './editorial';
import { enterprise } from './enterprise';
import { fennel } from './fennel';
import { folio } from './folio';
import { minimal } from './minimal';
import { soft } from './soft';
import { terminal } from './terminal';
import { zephyr } from './zephyr';
import { terracotta } from './terracotta';

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
  quill,
  folio,
  broadsheet,
  fennel,
  basalt,
  ember,
  cirrus,
  zephyr,
  onyx,
  terracotta,
  marigold,
  linen,
} satisfies Record<string, Theme>;
export type PresetName = keyof typeof presets;

export { basalt, broadsheet, brutalist, cirrus, editorial, ember, enterprise, fennel, folio, halcyon, linen, marigold, minimal, onyx, quill, soft, terminal, terracotta, zephyr };
