/**
 * Thrown when a kit can't be read or copied. Codes:
 * `design-kits/unknown-kit`, `design-kits/unknown-file` (a path the kit's `kit.json` doesn't name), `design-kits/store-missing`,
 * `design-kits/corrupt`, `design-kits/invalid-manifest`,
 * `design-kits/edited` (the project changed its copy; `metadata.edited`, `.missing` and `.extra` list the files), `design-kits/not-a-kit`,
 * `design-kits/invalid-dir`, `design-kits/usage`, `design-kits/no-kit` (`reference` with no `--kit` and no kit in the project).
 */
export class DesignKitsError extends Error {
  // Its own base class, the same shape as @mariachi/core's MariachiError (a stable `code`, a message, optional
  // metadata): the design packages install nothing of the backend framework.
  constructor(
    public readonly code: string,
    message: string,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'DesignKitsError';
  }
}
