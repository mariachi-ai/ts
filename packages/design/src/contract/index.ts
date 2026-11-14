import { componentList, componentTokens } from '../components';
import type { ContrastPair } from './contrast-pairs';
import { semanticContrastPairs } from './contrast-pairs';
import { motionTokens, overlayComponentPaths } from './motion';
import { semantic } from './semantic';
import { type FlatToken, flattenContract } from './tokens';

/**
 * The whole contract: semantic tokens plus every component's tokens under `components`, with the
 * motion overlay's loader and chart tokens beside them (see `motion.ts`).
 */
export const contract = { ...semantic, components: { ...componentTokens, ...motionTokens } };
export type Contract = typeof contract;
export type ComponentContract = typeof contract.components;

export const tokenList: FlatToken[] = flattenContract(contract);
export const tokenByPath = new Map(tokenList.map((t) => [t.path, t]));
export const tokenByVar = new Map(tokenList.map((t) => [t.cssVar, t]));

const camel = (s: string) => s.replace(/-([a-z])/g, (_, x: string) => x.toUpperCase());

/** Semantic pairs plus every component's pairs (relative component paths made absolute). */
export const contrastPairs: ContrastPair[] = [
  ...semanticContrastPairs,
  ...componentList.flatMap((c) =>
    (c.contrast ?? []).map((p) => ({
      ...p,
      fg: tokenByPath.has(p.fg) ? p.fg : `components.${camel(c.name)}.${p.fg}`,
      bg: tokenByPath.has(p.bg) ? p.bg : `components.${camel(c.name)}.${p.bg}`,
    })),
  ),
];

export { motionTokens, overlayComponentPaths, semantic, semanticContrastPairs };
export type { ContrastPair };
export { componentList };
