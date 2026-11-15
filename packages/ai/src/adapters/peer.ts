import { AIError } from '@mariachi/core';

/**
 * Imports an optional provider package on first use and remembers it. A missing package becomes a
 * `dependency/missing-peer` error that says what to install.
 */
export function lazyPeer<T>(pkg: string, feature: string, load: () => Promise<T>): () => Promise<T> {
  let loaded: Promise<T> | undefined;
  return () => {
    loaded ??= load().catch((error: unknown) => {
      loaded = undefined;
      const code = (error as NodeJS.ErrnoException | undefined)?.code;
      if (code === 'ERR_MODULE_NOT_FOUND' || code === 'MODULE_NOT_FOUND') {
        throw new AIError('dependency/missing-peer', `${feature} requires the optional peer dependency "${pkg}". Install it with: pnpm add ${pkg}`, { pkg, feature });
      }
      throw error;
    });
    return loaded;
  };
}
