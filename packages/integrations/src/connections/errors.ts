import { IntegrationError } from '@mariachi/core';

/**
 * A connection can't be used or made. The codes, and what an app does about each:
 *
 * | Code | Status | Means |
 * | --- | --- | --- |
 * | `integrations/connection-not-found` | 404 | the user has no connection to the provider (or not this one): offer to connect |
 * | `integrations/reconnect-required` | 409 | the provider refused the refresh token, or it expired with none: ask the user to connect again |
 * | `integrations/invalid-state` | 400 | the callback's `state` is forged, expired, used already, or another user's: start again |
 * | `integrations/provider-not-found` | 404 | no OAuth provider is configured with that id |
 * | `integrations/user-required` | 401 | connecting needs a signed-in user |
 *
 * None of them is an `auth/*` code: a dead connection must not sign the user out of the app.
 * Messages never carry a token, a code or a state.
 */
export class ConnectionError extends IntegrationError {
  readonly statusCode: number;

  constructor(code: ConnectionErrorCode, message: string, metadata?: Record<string, unknown>) {
    super(code, message, metadata);
    this.name = 'ConnectionError';
    this.statusCode = STATUS[code];
  }
}

export type ConnectionErrorCode =
  | 'integrations/connection-not-found'
  | 'integrations/reconnect-required'
  | 'integrations/invalid-state'
  | 'integrations/provider-not-found'
  | 'integrations/user-required';

const STATUS: Record<ConnectionErrorCode, number> = {
  'integrations/connection-not-found': 404,
  'integrations/reconnect-required': 409,
  'integrations/invalid-state': 400,
  'integrations/provider-not-found': 404,
  'integrations/user-required': 401,
};
