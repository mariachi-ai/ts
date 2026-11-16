import crypto from 'node:crypto';
import { z } from 'zod';
import { DesignKitsError } from './errors';

/** A kit's id: also its folder name and its `data-theme` value. */
export const KIT_ID = /^[a-z][a-z0-9-]*$/;

/** A file's path inside a kit: forward slashes, no empty, `.` or `..` part, nothing absolute. */
export function isKitPath(rel: string): boolean {
  if (!rel || rel.includes('\\') || rel.includes('\0') || rel.startsWith('/')) return false;
  return rel.split('/').every((part) => part !== '' && part !== '.' && part !== '..');
}

const kitPath = z.string().refine(isKitPath, 'not a path inside the kit');
const sha256Hex = z.string().regex(/^[0-9a-f]{64}$/);

/**
 * `kit.json`, as `@mariachi/design`'s build writes it. Unknown fields are kept: the layout grows by addition,
 * and a copy is never rewritten, so its bytes stay what the build wrote.
 */
export const kitManifestSchema = z
  .object({
    id: z.string().regex(KIT_ID),
    label: z.string(),
    kind: z.enum(['language', 'preset']),
    category: z.string().nullable().optional(),
    mode: z.string().optional(),
    mariachi: z.object({ package: z.string(), version: z.string(), commit: z.string() }).passthrough(),
    motion: z.object({ package: z.string(), version: z.string(), files: z.array(kitPath) }).passthrough().optional(),
    source: z.string().optional(),
    dataTheme: z.string(),
    entry: kitPath,
    fonts: z.array(
      z
        .object({
          family: z.string(),
          source: z.string().optional(),
          license: kitPath.optional(),
          files: z.array(kitPath),
          note: z.string().optional(),
        })
        .passthrough(),
    ),
    files: z.record(kitPath, sha256Hex),
  })
  .passthrough();

export type KitManifest = z.infer<typeof kitManifestSchema>;

/** Parses `kit.json`'s bytes. `where` names the file in the error. */
export function parseManifest(bytes: Uint8Array | string, where: string): KitManifest {
  let json: unknown;
  try {
    json = JSON.parse(typeof bytes === 'string' ? bytes : Buffer.from(bytes).toString('utf8'));
  } catch {
    throw new DesignKitsError('design-kits/invalid-manifest', `${where} isn't JSON`, { file: where });
  }
  const parsed = kitManifestSchema.safeParse(json);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new DesignKitsError('design-kits/invalid-manifest', `${where} isn't a kit manifest: ${issue?.path.join('.') || 'root'}: ${issue?.message}`, {
      file: where,
      issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
  }
  return parsed.data;
}

export const sha256 = (bytes: Uint8Array): string => crypto.createHash('sha256').update(bytes).digest('hex');
