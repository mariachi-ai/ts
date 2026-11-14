/**
 * Thrown for misuse of the motion API (an unknown chart kind, a chart with no data). The package has
 * no dependencies, so this is its own error class rather than @mariachi/core's; it has the same
 * shape (`code`, `message`, `metadata`). Codes: `motion/invalid-chart`, `motion/no-element`.
 */
export class MotionError extends Error {
  readonly code: string;
  readonly metadata?: Record<string, unknown>;

  constructor(code: string, message: string, metadata?: Record<string, unknown>) {
    super(message);
    this.name = 'MotionError';
    this.code = code;
    this.metadata = metadata;
  }
}
