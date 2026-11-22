// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Google Analytics 4: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'google-analytics',
  name: 'Google Analytics 4',
  category: 'analytics',
  server: 'www.google-analytics.com',
  baseUrl: 'https://www.google-analytics.com',
  docs: 'https://developers.google.com/analytics',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'measurementId',
    env: 'GA_MEASUREMENT_ID',
    label: 'Measurement ID',
    meaning: "The web data stream the page tag and the server's events report to. It is G- followed by capital letters and digits, and it is not a secret: the page tag puts it in every page.",
    secret: false,
    required: true,
    whereToFind: 'Admin › Data collection and modification › Data streams › your web stream: Measurement ID. Google Analytics has no test mode: use a separate property (or at least a separate stream) for test.',
    url: 'https://support.google.com/analytics/answer/12270356',
    public: true,
  },
  {
    key: 'apiSecret',
    env: 'GA_API_SECRET',
    label: 'Measurement Protocol API secret',
    meaning: 'Lets the server send events to the stream (the Measurement Protocol). Leave it unset if the app only uses the page tag or reports.',
    secret: true,
    required: false,
    whereToFind: 'Admin › Data streams › your web stream › Measurement Protocol API secrets › Create. Google says to rotate it regularly.',
    url: 'https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference?client_type=gtag',
  },
  {
    key: 'propertyId',
    env: 'GA_PROPERTY_ID',
    label: 'Property ID',
    meaning: 'The property reports are read from (the Data API): a number, not the G- measurement ID. Only needed for reports.',
    secret: false,
    required: false,
    whereToFind: 'Admin › Property settings › Property details: Property ID, a number such as 123456789.',
    url: 'https://developers.google.com/analytics/devguides/reporting/data/v1/property-id',
    public: true,
  },
  {
    key: 'serviceAccountJson',
    env: 'GA_SERVICE_ACCOUNT_JSON',
    label: 'Service account key',
    meaning: "A Google Cloud service account's key file, as JSON. It signs the requests that read reports. Only needed for reports.",
    secret: true,
    required: false,
    whereToFind: "Google Cloud console › IAM & Admin › Service accounts › your service account › Keys › Add key › JSON; the whole downloaded file is the value. Enable the Google Analytics Data API in the same Cloud project, and add the service account's email as a Viewer under Google Analytics Admin › Property access management.",
    url: 'https://developers.google.com/identity/protocols/oauth2/service-account',
  },
  {
    key: 'region',
    env: 'GA_REGION',
    label: 'Collection region',
    meaning: "Set to eu to send the server's events to Google's EU collection endpoint (region1.google-analytics.com). Leave it unset otherwise.",
    secret: false,
    required: false,
    whereToFind: 'Your choice: eu, or unset.',
    url: 'https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference?client_type=gtag#transport',
    public: true,
  },
];

/** The config `createGoogleAnalytics` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  measurementId: z.string().min(1),
  apiSecret: z.string().min(1).optional(),
  propertyId: z.string().min(1).optional(),
  serviceAccountJson: z.string().min(1).optional(),
  region: z.string().min(1).optional(),
});
export type GoogleAnalyticsConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  measurementId: 'GA_MEASUREMENT_ID',
  apiSecret: 'GA_API_SECRET',
  propertyId: 'GA_PROPERTY_ID',
  serviceAccountJson: 'GA_SERVICE_ACCOUNT_JSON',
  region: 'GA_REGION',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'events.send': {
    purpose: 'Sends up to 25 events from the server for one browser (its client_id from the _ga cookie): POST /mp/collect?measurement_id=…&api_secret=… with { client_id, user_id?, timestamp_micros?, user_properties?, consent?, events: [{ name, params }] }. With region eu the host is region1.google-analytics.com. It answers 2xx whenever the request arrives, even when the events are invalid and dropped: only events.validate checks them.',
    method: 'POST',
    path: '/mp/collect',
    idempotency: 'none',
  },
  'events.validate': {
    purpose: "Checks events without recording them: the same request as events.send, at /debug/mp/collect, with validation_behavior ENFORCE_RECOMMENDATIONS. Answers { validationMessages: [{ fieldPath, description, validationCode }] }, empty when the events are valid. It doesn't check the API secret or the measurement ID.",
    method: 'POST',
    path: '/debug/mp/collect',
    idempotency: 'natural',
  },
  'reports.run': {
    purpose: "Runs a report on the property's event data: POST https://analyticsdata.googleapis.com/v1beta/properties/{propertyId}:runReport with { dimensions, metrics, dateRanges, limit, offset, orderBys }, authorized with the service account's access token (scope analytics.readonly).",
    method: 'POST',
    idempotency: 'natural',
  },
  'reports.runRealtime': {
    purpose: 'Runs a report on the last 30 minutes of events: POST https://analyticsdata.googleapis.com/v1beta/properties/{propertyId}:runRealtimeReport with { dimensions, metrics, limit, orderBys, minuteRanges }, authorized like reports.run.',
    method: 'POST',
    idempotency: 'natural',
  },
  'serviceAccount.token': {
    purpose: "Exchanges a JWT signed with the service account's key (RS256; iss its client_email, scope https://www.googleapis.com/auth/analytics.readonly, aud https://oauth2.googleapis.com/token, exp at most an hour after iat) for an access token: POST https://oauth2.googleapis.com/token, form grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer and assertion. The token is reused until shortly before it expires.",
    method: 'POST',
    idempotency: 'natural',
  },
} as const;
export type GoogleAnalyticsOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  PERMISSION_DENIED: {
    category: 'forbidden',
    reason: 'permission-denied',
  },
  UNAUTHENTICATED: {
    category: 'unauthorized',
    reason: 'unauthenticated',
  },
  INVALID_ARGUMENT: {
    category: 'invalid-request',
    reason: 'invalid-argument',
  },
  RESOURCE_EXHAUSTED: {
    category: 'rate-limited',
    reason: 'quota-exhausted',
  },
  invalid_grant: {
    category: 'unauthorized',
    reason: 'invalid-grant',
  },
};
