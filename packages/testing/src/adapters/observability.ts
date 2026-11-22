import type { MetricsAdapter, Span, SpanKind, SpanOptions, TracerAdapter } from '@mariachi/core';

export interface RecordedSpan {
  name: string;
  attributes: Record<string, string | number | boolean>;
  status?: { status: 'ok' | 'error'; message?: string };
  /** `internal` unless the span was started with another kind. */
  kind: SpanKind;
  events: Array<{ name: string; attributes: Record<string, string | number | boolean> }>;
  ended: boolean;
}

export class TestTracer implements TracerAdapter {
  readonly spans: RecordedSpan[] = [];

  startSpan(name: string, attributes: Record<string, string | number | boolean> = {}, options: SpanOptions = {}): Span {
    const record: RecordedSpan = { name, attributes: { ...attributes }, kind: options.kind ?? 'internal', events: [], ended: false };
    this.spans.push(record);
    return {
      setAttribute: (k, v) => {
        record.attributes[k] = v;
      },
      setStatus: (status, message) => {
        record.status = { status, message };
      },
      addEvent: (eventName, eventAttributes = {}) => {
        record.events.push({ name: eventName, attributes: { ...eventAttributes } });
      },
      end: () => {
        record.ended = true;
      },
    };
  }

  async withSpan<T>(name: string, fn: (span: Span) => Promise<T>): Promise<T> {
    const span = this.startSpan(name);
    try {
      return await fn(span);
    } finally {
      span.end();
    }
  }

  find(name: string): RecordedSpan | undefined {
    return this.spans.find((s) => s.name === name);
  }
}

export interface RecordedMetric {
  type: 'increment' | 'gauge' | 'histogram' | 'timing';
  name: string;
  value: number;
  tags?: Record<string, string>;
}

export class TestMetrics implements MetricsAdapter {
  readonly records: RecordedMetric[] = [];

  increment(name: string, value = 1, tags?: Record<string, string>): void {
    this.records.push({ type: 'increment', name, value, tags });
  }
  gauge(name: string, value: number, tags?: Record<string, string>): void {
    this.records.push({ type: 'gauge', name, value, tags });
  }
  histogram(name: string, value: number, tags?: Record<string, string>): void {
    this.records.push({ type: 'histogram', name, value, tags });
  }
  timing(name: string, value: number, tags?: Record<string, string>): void {
    this.records.push({ type: 'timing', name, value, tags });
  }

  count(name: string, tags?: Record<string, string>): number {
    return this.records
      .filter((r) => r.type === 'increment' && r.name === name)
      .filter((r) => !tags || Object.entries(tags).every(([k, v]) => r.tags?.[k] === v))
      .reduce((sum, r) => sum + r.value, 0);
  }
}
