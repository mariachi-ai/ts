export type { AsymmetricAlgorithm, GoTrueAmrEntry, GoTrueConfig, GoTrueJwtPayload } from './types';
export { GoTrueAuthProvider } from './provider';
export type { GoTrueDeps } from './provider-fetch';
export { settings, operations, envNames, webhookEvents, type GotrueOperation } from './generated';
export { goTrueVerifiedEmail, type GoTrueVerifiedEmailConfig, type VerifiedEmailContext } from './verified-email';
export { GoTrueWebhookHandler, normalizeGoTrueHook } from './webhooks/handler';
export type { GoTrueHookName, GoTrueWebhookHandlerConfig } from './webhooks/handler';
export {
  parseWebhookSecrets,
  signStandardWebhook,
  verifyStandardWebhook,
  WEBHOOK_ID_HEADER,
  WEBHOOK_SIGNATURE_HEADER,
  WEBHOOK_TIMESTAMP_HEADER,
} from './webhooks/standard-webhooks';

import type { GoTrueConfig } from './types';
import { GoTrueAuthProvider } from './provider';
import type { GoTrueDeps } from './provider-fetch';

/** `deps` is the container's tracer and metrics, for the spans of the key and discovery fetches. */
export function createGoTrueAuth(config: GoTrueConfig, deps: GoTrueDeps = {}): GoTrueAuthProvider {
  return new GoTrueAuthProvider(config, undefined, deps);
}
