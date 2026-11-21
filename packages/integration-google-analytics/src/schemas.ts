import { z } from 'zod';

/** A GA4 web stream's measurement ID: `G-` and capital letters and digits. Anything else is refused, so it is safe in a page. */
export const MEASUREMENT_ID = /^G-[A-Z0-9]+$/;
export const MeasurementId = z.string().regex(MEASUREMENT_ID, 'a measurement ID is G- followed by capital letters and digits, such as G-ABC123XYZ9');

// Measurement Protocol limits and reserved names, from its reference:
// https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference?client_type=gtag
const RESERVED_EVENTS = new Set([
  'ad_activeview', 'ad_click', 'ad_exposure', 'ad_query', 'ad_reward', 'adunit_exposure', 'app_clear_data', 'app_exception',
  'app_install', 'app_remove', 'app_store_refund', 'app_update', 'app_upgrade', 'dynamic_link_app_open', 'dynamic_link_app_update',
  'dynamic_link_first_open', 'error', 'firebase_campaign', 'firebase_in_app_message_action', 'firebase_in_app_message_dismiss',
  'firebase_in_app_message_impression', 'first_open', 'first_visit', 'notification_dismiss', 'notification_foreground',
  'notification_open', 'notification_receive', 'notification_send', 'os_update', 'session_start', 'user_engagement',
  // only for app streams
  'ad_impression', 'in_app_purchase', 'screen_view',
]);
const RESERVED_PARAM_PREFIXES = ['_', 'firebase_', 'ga_', 'google_', 'gtag.'];
const RESERVED_USER_PROPERTIES = new Set(['first_open_time', 'first_visit_time', 'last_deep_link_referrer', 'user_id', 'first_open_after_install']);

export const EventName = z
  .string()
  .max(40)
  .regex(/^[A-Za-z][A-Za-z0-9_]*$/, 'an event name starts with a letter and has only letters, digits and underscores')
  .refine((n) => !RESERVED_EVENTS.has(n), 'this event name is reserved by Google Analytics');

const ParamName = z
  .string()
  .min(1)
  .max(40)
  .refine((n) => n !== 'firebase_conversion' && !RESERVED_PARAM_PREFIXES.some((p) => n.startsWith(p)), 'this parameter name is reserved by Google Analytics');

const Scalar = z.union([z.string(), z.number().finite()]);
/** An item of an ecommerce event (`purchase`'s `items`), with GA's own parameter names. */
export const EventItem = z.record(z.string().min(1).max(40), Scalar);
export type EventItem = z.infer<typeof EventItem>;

export const EventParams = z
  .record(ParamName, z.union([Scalar, z.array(EventItem)]))
  .refine((p) => Object.keys(p).length <= 25, 'an event has at most 25 parameters');

/** One event, as the Measurement Protocol takes it. Build the recommended ones with `signUp`, `login`, `purchase` and `generateLead`. */
export const GaEvent = z.object({ name: EventName, params: EventParams.optional() });
export type GaEvent = z.infer<typeof GaEvent>;

const UserPropertyName = z
  .string()
  .min(1)
  .max(24)
  .refine((n) => !RESERVED_USER_PROPERTIES.has(n) && !['_', 'firebase_', 'ga_', 'google_'].some((p) => n.startsWith(p)), 'this user property name is reserved by Google Analytics');

export const SendEventsInput = z.object({
  /**
   * The browser's client ID, which the page tag keeps in the `_ga` cookie: `gaCookies(ctx.request.cookies).clientId`.
   * Required: Google ties the events to that visitor with it.
   */
  clientId: z.string().min(1).max(256),
  /** The app's own id for the signed-in user (never an email address), for User-ID reporting. */
  userId: z.string().min(1).max(256).optional(),
  /**
   * The visit the events belong to: `gaCookies(cookies, measurementId).sessionId`. Added to each event as `session_id`,
   * which Google needs for the events to count in sessions, engagement and Realtime.
   */
  sessionId: z.string().min(1).max(256).optional(),
  /** When the events happened, if earlier than now: Unix time in microseconds, at most 72 hours ago. */
  timestampMicros: z.number().int().positive().optional(),
  /** Up to 25 user properties: names of at most 24 characters, values of at most 36. */
  userProperties: z
    .record(UserPropertyName, z.union([z.string().max(36), z.number().finite()]))
    .refine((p) => Object.keys(p).length <= 25, 'at most 25 user properties')
    .optional(),
  /** The visitor's advertising consent, when the app knows it. Left out, Google uses what the page tag last sent. */
  consent: z.object({ adUserData: z.boolean().optional(), adPersonalization: z.boolean().optional() }).optional(),
  /** Up to 25 events. */
  events: z.array(GaEvent).min(1).max(25),
});
export type SendEventsInput = z.input<typeof SendEventsInput>;

export const ValidationMessage = z
  .object({
    fieldPath: z.string().optional(),
    description: z.string().optional(),
    /** `VALUE_INVALID`, `VALUE_REQUIRED`, `NAME_INVALID`, `NAME_RESERVED`, `VALUE_OUT_OF_BOUNDS`, `EXCEEDED_MAX_ENTITIES` or `NAME_DUPLICATED`. */
    validationCode: z.string().optional(),
  })
  .passthrough();
export type ValidationMessage = z.infer<typeof ValidationMessage>;
export const ValidationResponse = z.object({ validationMessages: z.array(ValidationMessage).default([]) }).passthrough();

// Data API v1: https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport

/** `YYYY-MM-DD`, `today`, `yesterday` or `NdaysAgo`, in the property's time zone. */
const ReportDate = z.string().regex(/^(\d{4}-\d{2}-\d{2}|today|yesterday|\d+daysAgo)$/, 'a date is YYYY-MM-DD, today, yesterday or NdaysAgo');
const ApiName = z.string().min(1).max(256);

const OrderBy = z.union([
  z.object({ metric: ApiName, desc: z.boolean().optional() }).strict(),
  z.object({ dimension: ApiName, desc: z.boolean().optional() }).strict(),
]);

const Columns = {
  /** Dimension API names: `pagePath`, `country`, `eventName`, `date`. */
  dimensions: z.array(ApiName).max(9).default([]),
  /** Metric API names: `activeUsers`, `sessions`, `eventCount`, `totalRevenue`. */
  metrics: z.array(ApiName).max(10).default([]),
  /** Rows to return; Google's default is 10,000 and its most 250,000. */
  limit: z.number().int().min(1).max(250_000).optional(),
  /** Sort by a metric or a dimension in the request: `[{ metric: 'activeUsers', desc: true }]`. */
  orderBys: z.array(OrderBy).optional(),
};
const someColumn = (r: { dimensions: string[]; metrics: string[] }) => r.dimensions.length + r.metrics.length > 0;

export const RunReportInput = z
  .object({
    ...Columns,
    /** Up to 4 ranges: `[{ startDate: '28daysAgo', endDate: 'today' }]`. */
    dateRanges: z.array(z.object({ startDate: ReportDate, endDate: ReportDate, name: z.string().min(1).optional() }).strict()).min(1).max(4),
    /** The first row to return, for paging: the previous request's `offset + limit`. */
    offset: z.number().int().min(0).optional(),
  })
  .strict()
  .refine(someColumn, 'ask for at least one dimension or metric');
export type RunReportInput = z.input<typeof RunReportInput>;

export const RunRealtimeReportInput = z
  .object({
    ...Columns,
    /** Up to 2 ranges in the last 30 minutes (60 for 360 properties); the last 30 minutes when left out. */
    minuteRanges: z
      .array(z.object({ startMinutesAgo: z.number().int().min(0).optional(), endMinutesAgo: z.number().int().min(0).optional(), name: z.string().min(1).optional() }).strict())
      .max(2)
      .optional(),
  })
  .strict()
  .refine(someColumn, 'ask for at least one dimension or metric');
export type RunRealtimeReportInput = z.input<typeof RunRealtimeReportInput>;

const Value = z.object({ value: z.string().optional() }).passthrough();
const Row = z.object({ dimensionValues: z.array(Value).default([]), metricValues: z.array(Value).default([]) }).passthrough();

/** A report as the Data API answers it. Read it as plain objects with `reportRows`. */
export const Report = z
  .object({
    dimensionHeaders: z.array(z.object({ name: z.string() }).passthrough()).default([]),
    metricHeaders: z.array(z.object({ name: z.string(), type: z.string().optional() }).passthrough()).default([]),
    // Google leaves out an empty list
    rows: z.array(Row).default([]),
    /** Every row the query matched, whatever `limit` and `offset` returned. */
    rowCount: z.number().int().default(0),
    kind: z.string().optional(),
  })
  .passthrough();
export type Report = z.infer<typeof Report>;

/** A service account key file, as Google Cloud downloads it. */
export const ServiceAccount = z
  .object({
    type: z.literal('service_account'),
    client_email: z.string().min(1),
    private_key: z.string().min(1),
    private_key_id: z.string().optional(),
  })
  .passthrough();
export type ServiceAccount = z.infer<typeof ServiceAccount>;

export const AccessTokenResponse = z.object({ access_token: z.string().min(1), expires_in: z.number().positive() }).passthrough();
