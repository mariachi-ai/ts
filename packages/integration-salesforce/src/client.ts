import { ConfigError, type Context, ValidationError, fromZodError } from '@mariachi/core';
import { type FailureInfo, type HttpMethod, type ProviderDeps, categoryForStatus, mappedFailure, providerRequest } from '@mariachi/integrations';
import { z } from 'zod';
import { SalesforceError } from './errors';
import { type SalesforceConfig, type SalesforceOperation, configSchema, errorMap, provider } from './generated';
import {
  Account,
  AccountCreate,
  AddNoteInput,
  CompositeInput,
  type CompositeRequest,
  CompositeResponse,
  type CompositeSubresponse,
  Contact,
  ContactCreate,
  CreateDealInput,
  DeleteInput,
  type Fields,
  GetInput,
  Lead,
  LeadCreate,
  Opportunity,
  OpportunityCreate,
  type QueryPage,
  SObjectRecord,
  SaveResult,
  TokenResponse,
  UpdateInput,
  UpsertContactByEmailInput,
  UpsertInput,
  UpsertResult,
  queryPage,
} from './schemas';
import { type SoqlQuery, isSoqlQuery, soql } from './soql';

/** The REST API version used when `SALESFORCE_API_VERSION` isn't set: Winter '27. */
export const DEFAULT_API_VERSION = 'v68.0';

/** How far ahead `createDeal` sets an opportunity's `CloseDate` when none is given. */
export const DEFAULT_CLOSE_DAYS = 30;

export interface SalesforceDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

interface Request {
  method: HttpMethod;
  /** From the org's root: `/services/data/v68.0/sobjects/Contact`. */
  path: string;
  query?: Record<string, string | undefined>;
  json?: unknown;
}

/**
 * The Salesforce client: each operation takes `ctx` first, checks its input and Salesforce's answer, and makes one
 * span (`salesforce contacts.create`). It signs in by the client credentials flow, as the External Client App's
 * Run As user, keeps the token, and asks for a new one when a call answers 401. Build it once at startup and share
 * it.
 *
 * ```ts
 * const salesforce = createSalesforce(settingsFromEnv(settings, readEnv), { tracer, metrics });
 * const { id } = await salesforce.upsertContactByEmail(ctx, { email, firstName, company });
 * ```
 */
export function createSalesforce(config: SalesforceConfig, deps: SalesforceDeps = {}) {
  const cfg = configSchema.parse(config);
  const instance = instanceOrigin(cfg.instanceUrl);
  const api = `/services/data/${apiVersion(cfg.apiVersion)}`;
  const server = new URL(instance).host;

  function send<T>(ctx: Context, operation: SalesforceOperation, request: Request, schema: z.ZodType<T, z.ZodTypeDef, unknown>, headers: Record<string, string>): Promise<T> {
    return providerRequest(
      ctx,
      { integration: provider.id, operation, category: provider.category, server },
      { method: request.method, url: `${instance}${request.path}`, query: request.query, json: request.json, headers },
      { schema, error: SalesforceError, failure, deps },
    );
  }

  // One token for the client, shared by concurrent calls. The flow gives no refresh token and no expiry: a call
  // that answers 401 drops it, and the next asks for another.
  let token: Promise<string> | undefined;
  function accessToken(ctx: Context): Promise<string> {
    token ??= providerRequest(
      ctx,
      { integration: provider.id, operation: 'oauth.token', category: provider.category, server },
      { method: 'POST', url: `${instance}/services/oauth2/token`, form: { grant_type: 'client_credentials', client_id: cfg.clientId, client_secret: cfg.clientSecret } },
      { schema: TokenResponse, error: SalesforceError, failure, deps },
    ).then(
      (t) => t.access_token,
      (error) => {
        token = undefined;
        throw error;
      },
    );
    return token;
  }

  async function call<T>(ctx: Context, operation: SalesforceOperation, request: Request, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
    const current = accessToken(ctx);
    const bearer = await current;
    try {
      return await send(ctx, operation, request, schema, { authorization: `Bearer ${bearer}` });
    } catch (error) {
      if (!(error instanceof SalesforceError) || error.status !== 401) throw error;
      if (token === current) token = undefined;
      return send(ctx, operation, request, schema, { authorization: `Bearer ${await accessToken(ctx)}` });
    }
  }

  function sobject<C extends z.ZodTypeAny, R extends z.ZodTypeAny>(name: string, resource: 'contacts' | 'accounts' | 'opportunities' | 'leads', create: C, record: R) {
    const path = `${api}/sobjects/${name}`;
    return {
      /** Creates one record and returns its `id`. Salesforce takes no idempotency key: a create retried after a timeout can make two. */
      async create(ctx: Context, fields: z.input<C>): Promise<SaveResult> {
        const f = parse(create, fields);
        return call(ctx, `${resource}.create`, { method: 'POST', path, json: f }, SaveResult);
      },
      /** One record by id, with all its fields or only `fields`. */
      async get(ctx: Context, input: z.input<typeof GetInput>): Promise<z.output<R>> {
        const i = parse(GetInput, input);
        return call(ctx, `${resource}.get`, { method: 'GET', path: `${path}/${i.id}`, query: { fields: i.fields?.join(',') } }, record);
      },
      /** Sets the given fields; the others are left as they are. A field set to `null` is cleared. */
      async update(ctx: Context, input: z.input<typeof UpdateInput>): Promise<void> {
        const i = parse(UpdateInput, input);
        await call(ctx, `${resource}.update`, { method: 'PATCH', path: `${path}/${i.id}`, json: i.fields }, z.unknown());
      },
      /** Moves the record to the Recycle Bin. */
      async delete(ctx: Context, input: z.input<typeof DeleteInput>): Promise<void> {
        const i = parse(DeleteInput, input);
        await call(ctx, `${resource}.delete`, { method: 'DELETE', path: `${path}/${i.id}` }, z.unknown());
      },
      /**
       * Creates or updates the record whose External ID field `externalIdField` is `externalId`, and says which
       * (`created`). Safe to retry. Two records with that value fail with `salesforce/multiple-matches`.
       */
      async upsert(ctx: Context, input: z.input<typeof UpsertInput>): Promise<UpsertResult> {
        const i = parse(UpsertInput, input);
        return call(ctx, `${resource}.upsert`, { method: 'PATCH', path: `${path}/${i.externalIdField}/${encodeURIComponent(i.externalId)}`, json: i.fields }, UpsertResult);
      },
    };
  }

  const contacts = sobject('Contact', 'contacts', ContactCreate, Contact);
  const accounts = sobject('Account', 'accounts', AccountCreate, Account);
  const opportunities = sobject('Opportunity', 'opportunities', OpportunityCreate, Opportunity);
  /**
   * Leads: people who aren't qualified yet (a signup, a form, an event list). Sales converts a lead into a contact,
   * an account and optionally an opportunity in Salesforce; the REST API has no conversion, so this client doesn't
   * either. For a person at a known customer, make a contact instead (`upsertContactByEmail`).
   */
  const leads = sobject('Lead', 'leads', LeadCreate, Lead);

  const soqlOps = {
    /**
     * The first page of a query (up to 2,000 records by default), and `nextRecordsUrl` while there are more. The
     * query must come from `soql`, which escapes every value: `soql\`SELECT Id FROM Contact WHERE Email = ${email}\``.
     * Pass a schema (`Contact`) to check and type the records.
     */
    async query<R extends z.ZodTypeAny = typeof SObjectRecord>(ctx: Context, q: SoqlQuery, record?: R): Promise<QueryPage<z.output<R>>> {
      if (!isSoqlQuery(q)) throw new ValidationError('Build the query with soql`…`, which escapes its values');
      return call(ctx, 'soql.query', { method: 'GET', path: `${api}/query`, query: { q: q.soql } }, queryPage(record ?? SObjectRecord));
    },
    /** The page after one whose `done` is false, by its `nextRecordsUrl`. */
    async queryMore<R extends z.ZodTypeAny = typeof SObjectRecord>(ctx: Context, nextRecordsUrl: string, record?: R): Promise<QueryPage<z.output<R>>> {
      if (!/^\/services\/data\/v\d+\.\d\/query\/[A-Za-z0-9-]+$/.test(nextRecordsUrl)) throw new ValidationError('nextRecordsUrl must be the one a query page gave');
      return call(ctx, 'soql.queryMore', { method: 'GET', path: nextRecordsUrl }, queryPage(record ?? SObjectRecord));
    },
    /** Every record of a query, fetching pages as they're read. Stop early with `break`. */
    async *all<R extends z.ZodTypeAny = typeof SObjectRecord>(ctx: Context, q: SoqlQuery, record?: R): AsyncGenerator<z.output<R>> {
      let page = await soqlOps.query(ctx, q, record);
      yield* page.records;
      while (!page.done && page.nextRecordsUrl) {
        page = await soqlOps.queryMore(ctx, page.nextRecordsUrl, record);
        yield* page.records;
      }
    },
  };

  /**
   * Up to 25 subrequests in one call, all or none: a later one uses an earlier one's id as `@{<referenceId>.id}`,
   * and if any fails, everything is rolled back and this fails with that subrequest's error. Returns each
   * subrequest's answer, in order.
   */
  async function composite(ctx: Context, requests: CompositeRequest[]): Promise<CompositeSubresponse[]> {
    const rs = parse(CompositeInput, requests);
    const compositeRequest = rs.map((r) => ({ method: r.method, url: `${api}/${r.path}`, referenceId: r.referenceId, ...(r.body ? { body: r.body } : {}) }));
    return call(ctx, 'composite.execute', { method: 'POST', path: `${api}/composite`, json: { allOrNone: true, compositeRequest } }, CompositeResponse.transform(throwIfFailed));
  }

  // The org's first open stage, read once: an opportunity can't be made without a stage.
  let firstStage: Promise<string> | undefined;
  function defaultStage(ctx: Context): Promise<string> {
    firstStage ??= soqlOps
      .query(ctx, soql`SELECT ApiName FROM OpportunityStage WHERE IsActive = true AND IsClosed = false ORDER BY SortOrder ASC LIMIT 1`)
      .then((page) => {
        const name = page.records[0]?.ApiName;
        if (typeof name !== 'string') throw new SalesforceError('salesforce/no-open-stage', 'The org has no active open opportunity stage: pass stage', { category: 'invalid-request' });
        return name;
      })
      .catch((error) => {
        firstStage = undefined;
        throw error;
      });
    return firstStage;
  }

  async function accountByName(ctx: Context, name: string): Promise<string> {
    const found = await soqlOps.query(ctx, soql`SELECT Id FROM Account WHERE Name = ${name} ORDER BY CreatedDate ASC LIMIT 1`);
    const id = found.records[0]?.Id;
    return id ?? (await accounts.create(ctx, { Name: name })).id;
  }

  return {
    contacts,
    accounts,
    opportunities,
    leads,
    soql: soqlOps,
    composite,

    /**
     * The contact with this email, updated with what's given, or a new one; `created` says which. On create,
     * `LastName` (which Salesforce requires) defaults to the email's local part. `company` is the contact's account,
     * found by name or made, and set on a new contact or one without an account; a contact that already has an
     * account keeps it. `properties` are more fields by API name; the named fields win over them.
     *
     * The same three helpers, with the same shapes, are in every Mariachi CRM integration.
     */
    async upsertContactByEmail(ctx: Context, input: UpsertContactByEmailInput): Promise<{ id: string; created: boolean }> {
      const i = parse(UpsertContactByEmailInput, input);
      const found = await soqlOps.query(ctx, soql`SELECT Id, AccountId FROM Contact WHERE Email = ${i.email} ORDER BY CreatedDate ASC LIMIT 1`, Contact);
      const existing = found.records[0];
      const named = defined({ FirstName: i.firstName, LastName: i.lastName, Phone: i.phone });
      if (existing?.Id) {
        const fields: Fields = { ...i.properties, ...named };
        if (i.company && !existing.AccountId) fields.AccountId = await accountByName(ctx, i.company);
        if (Object.keys(fields).length > 0) await contacts.update(ctx, { id: existing.Id, fields });
        return { id: existing.Id, created: false };
      }
      const accountId = i.company ? await accountByName(ctx, i.company) : undefined;
      const fields = { LastName: localPart(i.email), ...i.properties, ...named, Email: i.email, ...defined({ AccountId: accountId }) };
      const { id } = await contacts.create(ctx, fields);
      return { id, created: true };
    },

    /**
     * A new opportunity. `StageName` is `stage`, or the org's first active open stage (read once and kept);
     * `CloseDate` is `properties.CloseDate`, or 30 days from today (UTC). `companyId` is its account; `contactId`
     * becomes its primary contact (an OpportunityContactRole), made in the same all-or-none call.
     */
    async createDeal(ctx: Context, input: CreateDealInput): Promise<{ id: string }> {
      const i = parse(CreateDealInput, input);
      const stage = i.stage ?? (typeof i.properties?.StageName === 'string' ? i.properties.StageName : await defaultStage(ctx));
      const fields = {
        CloseDate: daysFromToday(DEFAULT_CLOSE_DAYS),
        ...i.properties,
        ...defined({ Name: i.name, StageName: stage, Amount: i.amount, CurrencyIsoCode: i.currency, AccountId: i.companyId }),
      };
      const checked = parse(OpportunityCreate, fields);
      if (!i.contactId) return { id: (await opportunities.create(ctx, checked)).id };
      const [deal] = await composite(ctx, [
        { method: 'POST', path: 'sobjects/Opportunity', referenceId: 'deal', body: checked },
        { method: 'POST', path: 'sobjects/OpportunityContactRole', referenceId: 'role', body: { OpportunityId: '@{deal.id}', ContactId: i.contactId, IsPrimary: true } },
      ]);
      return { id: idOf(deal) };
    },

    /**
     * A note (a ContentNote, what Salesforce shows under Notes) on the contact, deal and account given, made and
     * linked in one all-or-none call. The body is plain text: it's escaped, each line becomes a paragraph, and the
     * first line is the title. Everyone who can see a linked record can see the note.
     */
    async addNote(ctx: Context, input: AddNoteInput): Promise<{ id: string }> {
      const i = parse(AddNoteInput, input);
      const note = { Title: noteTitle(i.body), Content: Buffer.from(noteHtml(i.body), 'utf8').toString('base64') };
      const linked = [i.contactId, i.dealId, i.companyId].filter((id): id is string => Boolean(id));
      const [created] = await composite(ctx, [
        { method: 'POST', path: 'sobjects/ContentNote', referenceId: 'note', body: note },
        ...linked.map((id, n) => ({
          method: 'POST' as const,
          path: 'sobjects/ContentDocumentLink',
          referenceId: `link${n}`,
          body: { ContentDocumentId: '@{note.id}', LinkedEntityId: id, ShareType: 'I', Visibility: 'AllUsers' },
        })),
      ]);
      return { id: idOf(created) };
    },
  };
}

export type Salesforce = ReturnType<typeof createSalesforce>;

/**
 * Salesforce's error body is a list of `{ errorCode, message, fields }`, and the token endpoint's is
 * `{ error, error_description }`. The code is kept, the message isn't (it can echo the record).
 */
function failure(status: number, body: unknown): FailureInfo | undefined {
  // An external id that matches several records: the body lists them
  if (status === 300) return { category: 'conflict', reason: 'multiple-matches' };
  const code = errorCodeOf(body);
  const mapped = mappedFailure(errorMap, code);
  return { providerCode: code, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}

function errorCodeOf(body: unknown): string | undefined {
  const first = Array.isArray(body) ? body[0] : body;
  if (typeof first !== 'object' || first === null) return undefined;
  const { errorCode, error } = first as { errorCode?: unknown; error?: unknown };
  return typeof errorCode === 'string' ? errorCode : typeof error === 'string' ? error : undefined;
}

/**
 * A composite call answers 200 even when a subrequest failed (and everything was rolled back): this turns that
 * into the failed subrequest's error, on the call's span. Subrequests that didn't run say PROCESSING_HALTED; the one
 * that failed is the one that doesn't.
 */
function throwIfFailed(response: z.output<typeof CompositeResponse>): CompositeSubresponse[] {
  const failed = response.compositeResponse.filter((r) => r.httpStatusCode >= 400);
  if (failed.length === 0) return response.compositeResponse;
  const cause = failed.find((r) => errorCodeOf(r.body) !== 'PROCESSING_HALTED') ?? failed[0]!;
  const providerCode = errorCodeOf(cause.body);
  const mapped = mappedFailure(errorMap, providerCode);
  const category = mapped?.category ?? categoryForStatus(cause.httpStatusCode);
  throw new SalesforceError(`salesforce/${mapped?.reason ?? category}`, `salesforce composite.execute failed: subrequest ${cause.referenceId} answered ${cause.httpStatusCode}`, {
    category,
    providerCode,
    details: { referenceId: cause.referenceId, subrequestStatus: cause.httpStatusCode },
  });
}

function idOf(response: CompositeSubresponse | undefined): string {
  const id = (response?.body as { id?: unknown } | null | undefined)?.id;
  if (typeof id !== 'string') throw new SalesforceError('salesforce/invalid-response', 'salesforce composite.execute answered without an id', { category: 'unavailable' });
  return id;
}

function instanceOrigin(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ConfigError('salesforce/invalid-instance-url', 'SALESFORCE_INSTANCE_URL must be the org’s My Domain URL, such as https://acme.my.salesforce.com');
  }
  if (url.protocol !== 'https:') throw new ConfigError('salesforce/invalid-instance-url', 'SALESFORCE_INSTANCE_URL must be https');
  return url.origin;
}

function apiVersion(value: string | undefined): string {
  if (!value) return DEFAULT_API_VERSION;
  const match = /^v?(\d{2,3}\.0)$/.exec(value.trim());
  if (!match) throw new ConfigError('salesforce/invalid-api-version', 'SALESFORCE_API_VERSION must look like v68.0');
  return `v${match[1]}`;
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Salesforce input');
  return parsed.data;
}

function defined<T extends Record<string, unknown>>(fields: T): { [K in keyof T]?: Exclude<T[K], undefined> } {
  return Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined)) as { [K in keyof T]?: Exclude<T[K], undefined> };
}

/** The email's local part, as a contact's `LastName` when none is given (Salesforce requires one; at most 80 characters). */
export function localPart(email: string): string {
  return email.slice(0, email.lastIndexOf('@')).slice(0, 80) || email.slice(0, 80);
}

function daysFromToday(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

/** The note's title: its first non-blank line, at most 255 characters. */
export function noteTitle(body: string): string {
  return (body.split(/\r?\n/).find((line) => line.trim()) ?? 'Note').trim().slice(0, 255);
}

/** Plain text as a ContentNote's HTML: escaped, a paragraph a line (Salesforce strips raw newlines). */
export function noteHtml(body: string): string {
  return body
    .split(/\r?\n/)
    .map((line) => `<p>${line.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c] ?? c)}</p>`)
    .join('');
}

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
