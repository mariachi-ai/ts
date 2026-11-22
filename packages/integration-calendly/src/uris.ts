import { ValidationError } from '@mariachi/core';
import type { Invitee } from './schemas';

const UUID = /^[A-Za-z0-9-]+$/;

/**
 * The UUID at the end of a Calendly URI: `https://api.calendly.com/scheduled_events/ABC123` is `ABC123`. A bare UUID
 * is returned as it is. Calendly names every resource by its URI, in its answers and its webhooks; store the URI and
 * let the client take it, and reach for this only where a UUID is wanted on its own (a route parameter, say).
 */
export function uuidFromUri(uriOrUuid: string): string {
  const path = uriOrUuid.trim().split(/[?#]/)[0]!.replace(/\/+$/, '');
  const uuid = path.slice(path.lastIndexOf('/') + 1);
  if (!uuid || !UUID.test(uuid)) throw new ValidationError('Not a Calendly URI or UUID', [{ path: ['uri'], message: 'Expected https://api.calendly.com/…/<uuid> or a UUID' }]);
  return uuid;
}

/**
 * The event's and the invitee's UUIDs in an invitee's URI, `…/scheduled_events/<event>/invitees/<invitee>`. That's
 * the URI in an invitee's `uri`, in a webhook's `payload.uri`, and in the embed's `calendly.event_scheduled` message.
 */
export function inviteeUuids(inviteeUri: string): { eventUuid: string; inviteeUuid: string } {
  const match = /\/scheduled_events\/([A-Za-z0-9-]+)\/invitees\/([A-Za-z0-9-]+)\/?(?:[?#]|$)/.exec(inviteeUri.trim());
  if (!match) throw new ValidationError("Not a Calendly invitee URI (…/scheduled_events/<event>/invitees/<invitee>)", [{ path: ['inviteeUri'], message: 'Expected …/scheduled_events/<event>/invitees/<invitee>' }]);
  return { eventUuid: match[1]!, inviteeUuid: match[2]! };
}

/**
 * An invitee's answers to the booking form's questions, by question: `{ 'Company': 'Acme' }`. Calendly gives them as
 * a list in the form's order; a question is matched by its exact text, so rewording it in Calendly changes the key.
 */
export function answersByQuestion(invitee: Pick<Invitee, 'questions_and_answers'>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const qa of invitee.questions_and_answers) out[qa.question] = qa.answer;
  return out;
}

/**
 * An email as a key to match an invitee to the app's own user: trimmed and lowercased, since the invitee types it
 * on the booking form. Calendly doesn't verify it, so a match says who the booking is probably for, never who made
 * it: don't grant access on it.
 */
export function emailKey(email: string): string {
  return email.trim().toLowerCase();
}
