import type { CalComOperation } from './generated';

/**
 * The `cal-api-version` header each operation sends, in one place. Cal.com versions each family of endpoints on its
 * own date, and an endpoint called without its version answers in an older shape, so every call names one where
 * Cal.com asks for it. `me` and `webhooks` take none. Change a date here only with the schemas that read the answer.
 */
export const CAL_API_VERSIONS: Readonly<Partial<Record<CalComOperation, string>>> = {
  'eventTypes.list': '2026-06-12',
  'eventTypes.get': '2026-06-12',
  'slots.list': '2024-09-04',
  'bookings.create': '2026-02-25',
  'bookings.get': '2026-02-25',
  'bookings.list': '2026-05-01',
  'bookings.cancel': '2026-02-25',
  'bookings.reschedule': '2026-02-25',
  'bookings.confirm': '2026-02-25',
  'bookings.decline': '2026-02-25',
};
