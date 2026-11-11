import type { Theme } from '../engine/theme';
import { brutalist } from './brutalist';
import { calmTrust } from './calm-trust';
import { editorial } from './editorial';
import { enterprise } from './enterprise';
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
  'calm-trust': calmTrust,
} satisfies Record<string, Theme>;
export type PresetName = keyof typeof presets;

export { brutalist, calmTrust, editorial, enterprise, minimal, soft, terminal };
