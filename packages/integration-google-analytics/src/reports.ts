import type { Report } from './schemas';

/** One row of a report: each dimension's value as a string, each metric's as a number. */
export type ReportRow = Record<string, string | number>;

/**
 * A report's rows as plain objects keyed by the names asked for, in place of the Data API's parallel arrays:
 *
 * ```ts
 * const report = await ga.reports.run(ctx, { dimensions: ['pagePath'], metrics: ['screenPageViews'], dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }] });
 * reportRows(report);   // [{ pagePath: '/pricing', screenPageViews: 1204 }, …]
 * ```
 *
 * Every metric type the API has (integer, float, seconds, currency, distances) is a number; the API sends them as
 * strings. With several date ranges, ask for the `dateRange` dimension to tell the rows apart.
 */
export function reportRows(report: Report): ReportRow[] {
  const dimensions = report.dimensionHeaders.map((h) => h.name);
  const metrics = report.metricHeaders.map((h) => h.name);
  return report.rows.map((row) => {
    const out: ReportRow = {};
    dimensions.forEach((name, i) => {
      out[name] = row.dimensionValues[i]?.value ?? '';
    });
    metrics.forEach((name, i) => {
      const value = Number(row.metricValues[i]?.value);
      out[name] = Number.isFinite(value) ? value : 0;
    });
    return out;
  });
}
