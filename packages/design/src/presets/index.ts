import type { Theme } from '../engine/theme';
import { basalt } from './basalt';
import { brutalist } from './brutalist';
import { ember } from './ember';
import { cirrus } from './cirrus';
import { halcyon } from './halcyon';
import { onyx } from './onyx';
import { editorial } from './editorial';
import { enterprise } from './enterprise';
import { fennel } from './fennel';
import { minimal } from './minimal';
import { soft } from './soft';
import { terminal } from './terminal';
import { zephyr } from './zephyr';

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
} satisfies Record<string, Theme>;
export type PresetName = keyof typeof presets;

export { basalt, brutalist, cirrus, editorial, ember, enterprise, fennel, halcyon, minimal, onyx, soft, terminal, zephyr };
