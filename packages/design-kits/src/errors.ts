import { MariachiError } from '@mariachi/core/errors';

/**
 * Thrown when a kit can't be read or copied. Codes:
 * `design-kits/unknown-kit`, `design-kits/unknown-file` (a path the kit's `kit.json` doesn't name), `design-kits/store-missing`,
 * `design-kits/corrupt`, `design-kits/invalid-manifest`,
 * `design-kits/edited` (the project changed its copy; `metadata.edited`, `.missing` and `.extra` list the files), `design-kits/not-a-kit`,
 * `design-kits/invalid-dir`, `design-kits/usage`.
 */
export class DesignKitsError extends MariachiError {
  constructor(code: string, message: string, metadata?: Record<string, unknown>) {
    super(code, message, metadata);
    this.name = 'DesignKitsError';
  }
}
