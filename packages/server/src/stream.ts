import type { Readable } from 'node:stream';
import { ConfigError } from '@mariachi/core';

export type StreamChunk = string | Uint8Array;

export interface StreamOptions {
  /** Default 200. */
  status?: number;
  /** Default `application/octet-stream`. */
  contentType?: string;
  headers?: Record<string, string>;
}

/** One server-sent event. `data` that isn't a string is sent as JSON. */
export interface ServerSentEvent {
  data: unknown;
  /** The event's type; the browser's `EventSource` dispatches it under this name (default `message`). */
  event?: string;
  /** Sets the client's last event id, which it sends back as `Last-Event-ID` when it reconnects. */
  id?: string;
  /** Tells the client how long to wait before reconnecting, in milliseconds. */
  retry?: number;
}

export interface SseOptions {
  /** A comment line this often keeps proxies from closing a quiet stream. Default 15000; 0 turns it off. */
  heartbeatMs?: number;
  /** Default 200. */
  status?: number;
  headers?: Record<string, string>;
}

/**
 * Return from a handler to send a body as it's produced, without buffering it. The transport ends the
 * iterable (its `finally` blocks run) when the client goes away. An error after the first byte can't
 * become an error response: the connection is cut and the error logged.
 */
export class StreamResponse {
  constructor(
    readonly body: AsyncIterable<StreamChunk> | Readable,
    readonly options: StreamOptions = {},
  ) {}
}

/** Return from a handler to send server-sent events. See `sseResponse`. */
export class SseResponse {
  constructor(
    readonly events: AsyncIterable<ServerSentEvent | string>,
    readonly options: SseOptions = {},
  ) {}
}

/** A body sent as it's produced: an async iterable (or generator) of strings and bytes, or a Node stream. */
export const streamResponse = (body: AsyncIterable<StreamChunk> | Readable, options?: StreamOptions) => new StreamResponse(body, options);

/**
 * Server-sent events from an async iterable (or generator): each item is one event, or a string for
 * its data. The stream ends when the iterable does. If it throws, the client gets a last
 * `event: error` with the usual error envelope as its data, and the stream ends.
 */
export const sseResponse = (events: AsyncIterable<ServerSentEvent | string>, options?: SseOptions) => new SseResponse(events, options);

const oneLine = (value: string, what: string): string => {
  if (/[\r\n]/.test(value)) throw new ConfigError('http/invalid-sse-event', `A server-sent event's ${what} can't hold a line break`);
  return value;
};

/** The bytes of one event. Line breaks in `data` become several `data:` lines; `event` and `id` can't hold any. */
export function formatSseEvent(event: ServerSentEvent | string): string {
  const e: ServerSentEvent = typeof event === 'string' ? { data: event } : event;
  let out = '';
  if (e.event !== undefined) out += `event: ${oneLine(e.event, 'event name')}\n`;
  if (e.id !== undefined) out += `id: ${oneLine(e.id, 'id')}\n`;
  if (e.retry !== undefined) {
    if (!Number.isInteger(e.retry) || e.retry < 0) throw new ConfigError('http/invalid-sse-event', "A server-sent event's retry is a whole number of milliseconds");
    out += `retry: ${e.retry}\n`;
  }
  const data = typeof e.data === 'string' ? e.data : JSON.stringify(e.data ?? null);
  for (const line of data.split(/\r\n|\r|\n/)) out += `data: ${line}\n`;
  return `${out}\n`;
}

const BEAT = Symbol('beat');

/**
 * Events as text, with a comment line whenever `heartbeatMs` passes without one. `onError` turns a
 * failure of the source into the last event. Ending this generator ends the source too.
 */
export async function* encodeSse(
  events: AsyncIterable<ServerSentEvent | string>,
  heartbeatMs: number,
  onError: (error: unknown) => ServerSentEvent,
): AsyncGenerator<string> {
  const iterator = events[Symbol.asyncIterator]();
  let pending: Promise<IteratorResult<ServerSentEvent | string>> | undefined;
  try {
    while (true) {
      pending ??= iterator.next();
      let timer: NodeJS.Timeout | undefined;
      const beat =
        heartbeatMs > 0
          ? new Promise<typeof BEAT>((resolve) => {
              timer = setTimeout(() => resolve(BEAT), heartbeatMs);
              timer.unref?.();
            })
          : undefined;
      let next: IteratorResult<ServerSentEvent | string> | typeof BEAT;
      try {
        next = await (beat ? Promise.race([pending, beat]) : pending);
      } catch (error) {
        pending = undefined;
        yield formatSseEvent(onError(error));
        return;
      } finally {
        clearTimeout(timer);
      }
      if (next === BEAT) {
        yield ': keep-alive\n\n';
        continue;
      }
      pending = undefined;
      if (next.done) return;
      let text: string;
      try {
        text = formatSseEvent(next.value);
      } catch (error) {
        yield formatSseEvent(onError(error));
        return;
      }
      yield text;
    }
  } finally {
    // Not awaited: a source parked on a slow upstream would hold the response open. It ends when that settles.
    void Promise.resolve(iterator.return?.()).catch(() => undefined);
  }
}
