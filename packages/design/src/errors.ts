/**
 * Thrown for invalid themes, design configs and CSS that references unknown tokens. Codes:
 * `design/invalid-theme`, `design/invalid-config`, `design/unknown-preset`, `design/unknown-component`,
 * `design/unknown-token`, `design/invalid-color`, `design/missing-asset`.
 */
export class DesignError extends Error {
  // The design library installs nothing of the backend framework, so this is its own base class, with the same
  // shape as @mariachi/core's MariachiError: a stable `code`, a message, and optional metadata.
  constructor(
    public readonly code: string,
    message: string,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'DesignError';
  }
}
