import { hmac, invalidSignature, safeEqual, secretList, signatureDigest, type VerifiedWebhook } from './common';

export interface HmacOptions {
  /** Default `sha256`. */
  algorithm?: 'sha1' | 'sha256' | 'sha512';
  /** How the signature is written. Default `hex`. */
  encoding?: 'hex' | 'base64';
  /** Text before the signature, such as `sha256=`. */
  prefix?: string;
  /** The sender's name, for error messages. Default `HMAC`. */
  provider?: string;
}

/**
 * Checks a plain HMAC of the raw body: the scheme of GitHub (`sha256=<hex>`), Shopify (base64) and
 * most home-grown senders. Pass the body's exact bytes, never re-serialised JSON. `secret` may be
 * a list during a rotation. Throws `webhooks/invalid-signature`. The `eventId` it returns is a
 * digest of the signature, so a replayed body deduplicates even when the sender's own delivery id
 * (an unsigned header) has been changed.
 */
export function verifyHmacSignature(rawBody: string | Buffer, signature: string | undefined, secret: string | string[], options: HmacOptions = {}): VerifiedWebhook {
  const provider = options.provider ?? 'HMAC';
  const secrets = secretList(secret, provider);
  if (!signature) return invalidSignature(provider, 'signature is missing');
  const prefix = options.prefix ?? '';
  if (!signature.startsWith(prefix)) return invalidSignature(provider, `signature does not start with ${prefix}`);
  const encoding = options.encoding ?? 'hex';
  const text = signature.slice(prefix.length).trim();
  if (encoding === 'hex' ? !/^[0-9a-fA-F]+$/.test(text) || text.length % 2 !== 0 : !/^[A-Za-z0-9+/]+={0,2}$/.test(text)) {
    return invalidSignature(provider, `signature is not ${encoding}`);
  }
  const offered = Buffer.from(text, encoding);
  const matches = secrets.some((key) => safeEqual(offered, hmac(options.algorithm ?? 'sha256', key, [rawBody])));
  if (!matches) return invalidSignature(provider, 'signature mismatch');
  return { eventId: signatureDigest(offered) };
}
