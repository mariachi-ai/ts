import type { AITelemetryEntry } from './types';

export class AITelemetryTracker {
  private entries: AITelemetryEntry[] = [];
  /** Called when `persist` fails. `DefaultAI` sets it to a warning in its log unless you set one. */
  onPersistError?: (error: Error, entry: AITelemetryEntry) => void;

  constructor(
    private readonly persist?: (entry: AITelemetryEntry) => void | Promise<void>,
    onPersistError?: (error: Error, entry: AITelemetryEntry) => void,
  ) {
    this.onPersistError = onPersistError;
  }

  /** Keeps the entry and hands it to `persist` without waiting: a model call isn't held up, or failed, by its bookkeeping. */
  record(entry: AITelemetryEntry): void {
    this.entries.push(entry);
    if (!this.persist) return;
    const persist = this.persist;
    Promise.resolve()
      .then(() => persist(entry))
      .catch((error: unknown) => {
        this.onPersistError?.(error instanceof Error ? error : new Error(String(error)), entry);
      });
  }

  getEntries(sessionId?: string): AITelemetryEntry[] {
    if (sessionId) {
      return this.entries.filter((e) => e.sessionId === sessionId);
    }
    return [...this.entries];
  }
}
