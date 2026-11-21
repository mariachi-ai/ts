import { type Context, fromZodError } from '@mariachi/core';
import { type FailureInfo, type ProviderDeps, type ProviderRequest, mappedFailure, providerRequest } from '@mariachi/integrations';
import { SignJWT, importPKCS8 } from 'jose';
import { z } from 'zod';
import { GoogleAnalyticsError, settingError } from './errors';
import { type GoogleAnalyticsConfig, type GoogleAnalyticsOperation, configSchema, errorMap, operations, provider } from './generated';
import {
  AccessTokenResponse,
  type Report,
  Report as ReportSchema,
  RunRealtimeReportInput,
  RunReportInput,
  SendEventsInput,
  ServiceAccount,
  type ValidationMessage,
  ValidationResponse,
} from './schemas';
import { checkedMeasurementId } from './tag';

const EU_COLLECTION = 'https://region1.google-analytics.com';
const DATA_API = 'https://analyticsdata.googleapis.com/v1beta';
const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
/** An access token is fetched again this long before it expires. */
const TOKEN_MARGIN_MS = 5 * 60_000;

export interface GoogleAnalyticsDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

/**
 * Google Analytics 4 from the server: events through the Measurement Protocol, and reports through the Data API.
 * Each operation takes `ctx` first, checks its input and Google's answer, and makes one span
 * (`google-analytics events.send`). Build it once at startup and share it: it keeps the reports' access token.
 *
 * ```ts
 * const ga = createGoogleAnalytics(settingsFromEnv(settings, readEnv), { tracer, metrics });
 * await ga.events.send(ctx, { clientId, sessionId, events: [purchase({ transactionId, value, currency, items })] });
 * ```
 *
 * The API secret travels in the Measurement Protocol's query string, as Google requires. Spans never record a URL
 * and the client logs nothing, so it is never in a span, a log line or an error.
 */
export function createGoogleAnalytics(config: GoogleAnalyticsConfig, deps: GoogleAnalyticsDeps = {}) {
  const cfg = configSchema.parse(config);
  const measurementId = checkedMeasurementId(cfg.measurementId);
  if (cfg.region !== undefined && cfg.region !== 'eu') throw settingError('invalid-region', 'GA_REGION is eu, or unset');
  if (cfg.propertyId !== undefined && !/^\d+$/.test(cfg.propertyId)) {
    throw settingError('invalid-property-id', 'GA_PROPERTY_ID is the property\'s number (Admin › Property settings), not the G- measurement ID');
  }
  const serviceAccount = cfg.serviceAccountJson ? parseServiceAccount(cfg.serviceAccountJson) : undefined;
  const collection = cfg.region === 'eu' ? EU_COLLECTION : provider.baseUrl;

  function call<T>(ctx: Context, operation: GoogleAnalyticsOperation, request: ProviderRequest, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
    // A read (a report, a validation, a token) is safe to repeat after an outage; a send isn't, so it's retried only after a rate limit
    const safe = operations[operation].idempotency === 'natural';
    return providerRequest(
      ctx,
      { integration: provider.id, operation, category: provider.category, server: new URL(request.url).host },
      request,
      { schema, error: GoogleAnalyticsError, failure, deps: safe ? { ...deps, retry: { unsafe: false, ...deps.retry } } : deps },
    );
  }

  function collect(ctx: Context, operation: 'events.send' | 'events.validate', input: SendEventsInput) {
    const i = parse(SendEventsInput, input);
    if (!cfg.apiSecret) {
      return Promise.reject(settingError('no-api-secret', 'Set GA_API_SECRET to send events from the server: Admin › Data streams › your web stream › Measurement Protocol API secrets'));
    }
    const validate = operation === 'events.validate';
    const body = {
      client_id: i.clientId,
      user_id: i.userId,
      timestamp_micros: i.timestampMicros,
      user_properties: i.userProperties ? Object.fromEntries(Object.entries(i.userProperties).map(([k, value]) => [k, { value }])) : undefined,
      consent: i.consent
        ? {
            ad_user_data: i.consent.adUserData === undefined ? undefined : i.consent.adUserData ? 'GRANTED' : 'DENIED',
            ad_personalization: i.consent.adPersonalization === undefined ? undefined : i.consent.adPersonalization ? 'GRANTED' : 'DENIED',
          }
        : undefined,
      validation_behavior: validate ? 'ENFORCE_RECOMMENDATIONS' : undefined,
      events: i.events.map((e) => ({ name: e.name, params: i.sessionId && e.params?.session_id === undefined ? { ...e.params, session_id: i.sessionId } : e.params })),
    };
    return call(
      ctx,
      operation,
      {
        method: 'POST',
        url: `${collection}${validate ? '/debug/mp/collect' : '/mp/collect'}`,
        query: { measurement_id: measurementId, api_secret: cfg.apiSecret },
        json: body,
      },
      validate ? ValidationResponse : z.unknown(),
    );
  }

  const events = {
    /**
     * Sends up to 25 events for one visitor. Google answers 2xx whenever the request arrives, even when it drops
     * the events as invalid, so a resolved promise means "delivered", not "recorded": check new events with
     * `validate` first. Events show in reports after Google processes them (Realtime within minutes).
     */
    async send(ctx: Context, input: SendEventsInput): Promise<void> {
      await collect(ctx, 'events.send', input);
    },
    /**
     * Checks the same request against Google's validation server, which records nothing, with Google's strictest
     * checks. Returns what's wrong (`[]` when nothing is). It doesn't check the API secret or the measurement ID.
     */
    async validate(ctx: Context, input: SendEventsInput): Promise<ValidationMessage[]> {
      const res = (await collect(ctx, 'events.validate', input)) as z.infer<typeof ValidationResponse>;
      return res.validationMessages;
    },
  };

  const reports = {
    /**
     * A report on the property's events: dimensions, metrics, up to 4 date ranges. Read its rows with `reportRows`.
     * Page with `limit` and `offset`; `rowCount` is every row the query matched.
     */
    async run(ctx: Context, input: RunReportInput): Promise<Report> {
      const i = parse(RunReportInput, input);
      return dataApi(ctx, 'reports.run', 'runReport', {
        ...columns(i),
        dateRanges: i.dateRanges,
        offset: i.offset,
      });
    },
    /** A report on the last 30 minutes (Realtime): dimensions, metrics, optionally up to 2 minute ranges. */
    async runRealtime(ctx: Context, input: RunRealtimeReportInput): Promise<Report> {
      const i = parse(RunRealtimeReportInput, input);
      return dataApi(ctx, 'reports.runRealtime', 'runRealtimeReport', { ...columns(i), minuteRanges: i.minuteRanges });
    },
  };

  async function dataApi(ctx: Context, operation: GoogleAnalyticsOperation, method: string, body: Record<string, unknown>): Promise<Report> {
    if (!cfg.propertyId) throw settingError('no-property-id', 'Set GA_PROPERTY_ID to read reports: Admin › Property settings');
    const token = await accessToken(ctx);
    try {
      return await call(
        ctx,
        operation,
        { method: 'POST', url: `${DATA_API}/properties/${cfg.propertyId}:${method}`, headers: { authorization: `Bearer ${token}` }, json: body },
        ReportSchema,
      );
    } catch (error) {
      // A token Google no longer takes is fetched again on the next call
      if (error instanceof GoogleAnalyticsError && error.category === 'unauthorized') cached = undefined;
      throw error;
    }
  }

  let cached: { value: string; expiresAt: number } | undefined;
  let pending: Promise<string> | undefined;
  let signingKey: ReturnType<typeof importPKCS8> | undefined;

  /**
   * An access token for the service account: a JWT signed with its key, exchanged at Google's token endpoint, and
   * reused until five minutes before it expires. One exchange at a time.
   */
  function accessToken(ctx: Context): Promise<string> {
    if (!serviceAccount) {
      return Promise.reject(settingError('no-service-account', 'Set GA_SERVICE_ACCOUNT_JSON to read reports: a service account key added as a Viewer under Admin › Property access management'));
    }
    if (cached && cached.expiresAt - TOKEN_MARGIN_MS > Date.now()) return Promise.resolve(cached.value);
    pending ??= (async () => {
      signingKey ??= importPKCS8(serviceAccount.private_key, 'RS256').catch(() => {
        signingKey = undefined;
        throw settingError('invalid-service-account', "The service account key's private_key can't be read: set GA_SERVICE_ACCOUNT_JSON to the whole downloaded key file");
      });
      const iat = Math.floor(Date.now() / 1000);
      const assertion = await new SignJWT({ scope: SCOPE })
        .setProtectedHeader({ alg: 'RS256', typ: 'JWT', ...(serviceAccount.private_key_id ? { kid: serviceAccount.private_key_id } : {}) })
        .setIssuer(serviceAccount.client_email)
        .setAudience(OAUTH_TOKEN_URL)
        .setIssuedAt(iat)
        .setExpirationTime(iat + 3600)
        .sign(await signingKey);
      const started = Date.now();
      const res = await call(
        ctx,
        'serviceAccount.token',
        { method: 'POST', url: OAUTH_TOKEN_URL, form: { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion } },
        AccessTokenResponse,
      );
      cached = { value: res.access_token, expiresAt: started + res.expires_in * 1000 };
      return res.access_token;
    })().finally(() => {
      pending = undefined;
    });
    return pending;
  }

  return { events, reports };
}

export type GoogleAnalytics = ReturnType<typeof createGoogleAnalytics>;

/** The service account key, checked: valid JSON in the shape Google Cloud downloads. */
function parseServiceAccount(json: string): ServiceAccount {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw settingError('invalid-service-account', 'GA_SERVICE_ACCOUNT_JSON is not JSON: set it to the whole downloaded key file');
  }
  const parsed = ServiceAccount.safeParse(raw);
  if (!parsed.success) {
    throw settingError('invalid-service-account', `GA_SERVICE_ACCOUNT_JSON is not a service account key file (${parsed.error.issues.map((i) => i.path.join('.')).join(', ')})`);
  }
  return parsed.data;
}

function columns(i: { dimensions: string[]; metrics: string[]; limit?: number; orderBys?: Array<{ metric: string; desc?: boolean } | { dimension: string; desc?: boolean }> }) {
  return {
    dimensions: i.dimensions.map((name) => ({ name })),
    metrics: i.metrics.map((name) => ({ name })),
    limit: i.limit,
    orderBys: i.orderBys?.map((o) => ('metric' in o ? { metric: { metricName: o.metric }, desc: o.desc } : { dimension: { dimensionName: o.dimension }, desc: o.desc })),
  };
}

/**
 * Google's API errors are `{ error: { code, message, status } }` (the Data API) or `{ error, error_description }`
 * (the token endpoint). The status or code is kept; the message isn't (it can echo the request).
 */
function failure(_status: number, body: unknown): FailureInfo | undefined {
  const error = typeof body === 'object' && body !== null ? (body as { error?: unknown }).error : undefined;
  const code = typeof error === 'string' ? error : typeof error === 'object' && error !== null && typeof (error as { status?: unknown }).status === 'string' ? (error as { status: string }).status : undefined;
  const mapped = mappedFailure(errorMap, code);
  return { providerCode: code, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Google Analytics input');
  return parsed.data;
}
