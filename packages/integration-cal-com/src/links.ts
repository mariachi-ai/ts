import { ValidationError } from '@mariachi/core';

/**
 * The Cal link of an event type, `<username>/<event slug>`: what Cal.com's embed takes as `calLink`, and the path of
 * its booking page. Just the username links to the user's page of every event type.
 */
export function calLink(username: string, eventSlug?: string): string {
  if (!username.trim()) throw new ValidationError('A Cal link needs the username');
  return eventSlug ? `${encodeURIComponent(username)}/${encodeURIComponent(eventSlug)}` : encodeURIComponent(username);
}

export interface BookingPageInput {
  username: string;
  eventSlug?: string;
  /** Where the booking pages are served: `https://cal.com` for Cal.com's cloud, a self-hosted instance's own address otherwise. */
  origin?: string;
  /**
   * Answers the booking form starts with, by each field's identifier: `name`, `email`, `notes`, or a custom field's
   * (shown under the event type's Advanced › Booking questions). An array fills a field that takes several values.
   */
  prefill?: Record<string, string | string[] | undefined>;
}

/**
 * The public booking page for a user's event type: `https://cal.com/alice/intro?email=…`. When the app has the event
 * type, its `bookingUrl` is the page Cal.com itself gives (right for teams and organizations too); this builds the
 * same for a username and slug the app knows, and adds the answers to prefill.
 */
export function bookingPageUrl(input: BookingPageInput): string {
  const url = new URL(`/${calLink(input.username, input.eventSlug)}`, input.origin ?? 'https://cal.com');
  for (const [field, value] of Object.entries(input.prefill ?? {})) {
    for (const v of Array.isArray(value) ? value : value === undefined ? [] : [value]) url.searchParams.append(field, v);
  }
  return url.toString();
}
