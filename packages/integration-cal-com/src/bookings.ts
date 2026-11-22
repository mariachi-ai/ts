/**
 * The attendees' email addresses, trimmed, lowercased and each once: the way to match a booking (from the API or from
 * `webhookBooking`) to the app's users. Cal.com keeps an address as the booker typed it, so compare lowercased on both
 * sides. The list holds the booker and any guests added as attendees; for a seated event type, a webhook names only
 * the seat that changed.
 */
export function attendeeEmails(booking: { attendees: ReadonlyArray<{ email?: string | null }> }): string[] {
  const emails = booking.attendees.map((a) => a.email?.trim().toLowerCase()).filter((e): e is string => !!e);
  return [...new Set(emails)];
}
