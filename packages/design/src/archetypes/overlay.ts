import { tokenByPath } from '../contract';
import type { TokenValue } from '../contract/tokens';
import type { Theme } from '../engine/theme';
import { archetypes } from './index';

const same = (a: TokenValue | undefined, b: TokenValue | undefined) => JSON.stringify(a) === JSON.stringify(b);

/**
 * A theme with the motion overlay's chart colours taken from its design language: `--m-chart-1` to
 * `--m-chart-5` become the language's `charts.categorical`, light and dark, wherever the theme still
 * has the contract's default. Themes that aren't (or don't extend) a language, and chart colours a
 * theme sets itself, are left as they are.
 */
export function withMotionOverlay(theme: Theme): Theme {
  const language = archetypes.find((a) => a.id === theme.name) ?? archetypes.find((a) => a.id === theme.extends);
  if (!language) return theme;
  const tokens = { ...theme.tokens };
  language.charts.categorical.slice(0, 5).forEach((c, i) => {
    const path = `components.chart.${i + 1}`;
    if (theme.tokens[path] === undefined || same(theme.tokens[path], tokenByPath.get(path)?.def.default)) {
      tokens[path] = c.light === c.dark ? c.light : { light: c.light, dark: c.dark };
    }
  });
  return { ...theme, tokens };
}
