import { MariachiError } from '@mariachi/core/errors';

/**
 * Thrown when a kit can't be read or copied. Codes:
 * `design-kits/unknown-kit`, `design-kits/store-missing`, `design-kits/corrupt`, `design-kits/invalid-manifest`,
 * `design-kits/edited` (the project changed its copy; `metadata.kits` lists the files), `design-kits/not-a-kit`,
 * `design-kits/invalid-dir`, `design-kits/usage`.
 */
export class DesignKitsError extends MariachiError {
  constructor(code: string, message: string, metadata?: Record<string, unknown>) {
    super(code, message, metadata);
    this.name = 'DesignKitsError';
  }
}
