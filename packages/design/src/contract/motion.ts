import { ref, t } from './tokens';

/**
 * The motion overlay's component tokens: what `@mariachi/motion` reads for its loaders and charts.
 * They have no component of their own here (motion ships the CSS), so they sit beside the
 * component tokens under `components` (`components.chart.1` → `--m-chart-1`). Every theme carries
 * them (`defineTheme` fills the defaults) and the build sets the chart colours from a language's
 * `charts.categorical`. The skeleton's `animation` lives on the skeleton component.
 */
export const motionTokens = {
  loader: {
    stroke: t.length('The spinner weight: loaders on pictures, busy buttons', '2px'),
  },
  chart: {
    1: t.color("First series colour (a language's first charts.categorical colour)", ref('color.accent.default')),
    2: t.color('Second series colour', ref('color.info.solid')),
    3: t.color('Third series colour', ref('color.success.solid')),
    4: t.color('Fourth series colour', ref('color.warning.solid')),
    5: t.color('Fifth series colour', ref('color.danger.solid')),
    stroke: t.length('Line weight of line, area and sparkline charts', '2px'),
    barRadius: t.length('Bar corners', '2px'),
    draw: t.duration('Draw-on time: lines drawing, bars growing, donuts sweeping, numbers counting', '600ms'),
  },
};

/** Paths of the overlay's component tokens every theme carries, with their defaults. */
export const overlayComponentPaths = [
  'components.skeleton.animation',
  'components.loader.stroke',
  'components.chart.1',
  'components.chart.2',
  'components.chart.3',
  'components.chart.4',
  'components.chart.5',
  'components.chart.stroke',
  'components.chart.barRadius',
  'components.chart.draw',
] as const;
