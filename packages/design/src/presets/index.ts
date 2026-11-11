import type { Theme } from '../engine/theme';
import { basalt } from './basalt';
import { brutalist } from './brutalist';
import { halcyon } from './halcyon';
import { editorial } from './editorial';
import { enterprise } from './enterprise';
import { fennel } from './fennel';
import { minimal } from './minimal';
import { soft } from './soft';
import { terminal } from './terminal';

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
} satisfies Record<string, Theme>;
export type PresetName = keyof typeof presets;

export { basalt, brutalist, editorial, enterprise, fennel, halcyon, minimal, soft, terminal };
