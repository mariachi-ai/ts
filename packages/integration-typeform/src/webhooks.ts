import type { Context, TracerAdapter } from '@mariachi/core';
import { type RawBody, WebhookSignatureError, hmac, receiveProviderWebhook, safeEqual } from '@mariachi/integrations';
import { provider } from './generated';
import { FormResponseEvent } from './schemas';

/** Whether `header` (`Typeform-Signature`) is the HMAC of the raw body with the webhook secret. */
export function verifyTypeformSignature(rawBody: RawBody, header: string | undefined, secret: string): boolean {
  if (!header?.startsWith('sha256=')) return false;
  return safeEqual(header.slice('sha256='.length), hmac('sha256', secret, rawBody, 'base64'));
}

export interface TypeformWebhookRequest {
  /** The body's bytes as they arrived. */
  rawBody: RawBody;
  headers: Record<string, string | string[] | undefined>;
}

/**
 * Checks and reads one Typeform webhook, with its SERVER span. Throws `typeform/invalid-signature` (401) when the
 * signature doesn't match. Typeform retries a delivery that fails, so the same response can arrive twice: dedupe
 * by `payload.form_response.token`.
 *
 * ```ts
 * const { payload } = await receiveTypeformWebhook(ctx, { rawBody: ctx.request.rawBody, headers }, { webhookSecret });
 * const answers = answersByRef(payload.form_response);
 * ```
 */
export function receiveTypeformWebhook(ctx: Context, request: TypeformWebhookRequest, config: { webhookSecret: string }, deps: { tracer?: TracerAdapter } = {}) {
  return receiveProviderWebhook(
    ctx,
    provider.id,
    () => {
      const header = headerOf(request.headers, 'typeform-signature');
      if (!verifyTypeformSignature(request.rawBody, header, config.webhookSecret)) throw new WebhookSignatureError(provider.id);
      const payload = FormResponseEvent.parse(JSON.parse(Buffer.from(typeof request.rawBody === 'string' ? request.rawBody : Buffer.from(request.rawBody)).toString()));
      return { event: payload.event_type, payload };
    },
    deps,
  );
}

function headerOf(headers: TypeformWebhookRequest['headers'], name: string): string | undefined {
  const found = Object.entries(headers).find(([k]) => k.toLowerCase() === name)?.[1];
  return Array.isArray(found) ? found[0] : found;
}
