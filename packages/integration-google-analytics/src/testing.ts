/**
 * `@mariachi/integration-google-analytics/testing`: a Google Analytics for an app's tests, with the same shape as
 * `createGoogleAnalytics`'s client. It keeps what was sent, checks events by the same rules as the real client, and
 * answers reports from what the test gives it.
 */
import { fromZodError } from '@mariachi/core';
import type { z } from 'zod';
import type { GoogleAnalytics } from './client';
import { type Report, Report as ReportSchema, RunRealtimeReportInput, RunReportInput, SendEventsInput } from './schemas';

export interface FakeGoogleAnalytics extends GoogleAnalytics {
  /** Every `events.send`, in order, as it was given. */
  sent: SendEventsInput[];
  /** The report `reports.run` answers with. */
  report: Report;
  /** The report `reports.runRealtime` answers with. */
  realtimeReport: Report;
}

/**
 * An in-memory Google Analytics: hand it to the code under test in place of the client, then look at `sent`.
 *
 * ```ts
 * const ga = fakeGoogleAnalytics({ report: gaReport({ dimensions: ['pagePath'], metrics: ['screenPageViews'], rows: [['/pricing', 12]] }) });
 * ```
 */
export function fakeGoogleAnalytics(seed: { report?: Report; realtimeReport?: Report } = {}): FakeGoogleAnalytics {
  const fake: FakeGoogleAnalytics = {
    sent: [],
    report: seed.report ?? gaReport(),
    realtimeReport: seed.realtimeReport ?? gaReport(),
    events: {
      async send(_ctx, input) {
        check(SendEventsInput, input);
        fake.sent.push(input);
      },
      async validate(_ctx, input) {
        check(SendEventsInput, input);
        return [];
      },
    },
    reports: {
      async run(_ctx, input) {
        check(RunReportInput, input);
        return fake.report;
      },
      async runRealtime(_ctx, input) {
        check(RunRealtimeReportInput, input);
        return fake.realtimeReport;
      },
    },
  };
  return fake;
}

/** A report as the Data API answers it: `rows` are the values in the order of `dimensions`, then `metrics`. */
export function gaReport(spec: { dimensions?: string[]; metrics?: string[]; rows?: Array<Array<string | number>> } = {}): Report {
  const dimensions = spec.dimensions ?? [];
  const metrics = spec.metrics ?? [];
  const rows = spec.rows ?? [];
  return ReportSchema.parse({
    dimensionHeaders: dimensions.map((name) => ({ name })),
    metricHeaders: metrics.map((name) => ({ name, type: 'TYPE_INTEGER' })),
    rows: rows.map((r) => ({
      dimensionValues: r.slice(0, dimensions.length).map((v) => ({ value: String(v) })),
      metricValues: r.slice(dimensions.length).map((v) => ({ value: String(v) })),
    })),
    rowCount: rows.length,
    kind: 'analyticsData#runReport',
  });
}

function check(schema: z.ZodTypeAny, input: unknown): void {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Google Analytics input');
}
