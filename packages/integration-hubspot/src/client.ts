import { type Context, fromZodError } from '@mariachi/core';
import { type ErrorCategory, type FailureInfo, type ProviderDeps, type ProviderRequest, type ProviderRequestOptions, mappedFailure, providerRequest } from '@mariachi/integrations';
import { z } from 'zod';
import { ASSOCIATION_TYPES } from './associations';
import { HubSpotError } from './errors';
import { type HubspotConfig, type HubspotOperation, configSchema, errorMap, provider } from './generated';
import {
  AddNoteInput,
  AssociateInput,
  AssociationPage,
  type AssociationInput,
  CreateDealInput,
  CreateInput,
  CreateNoteInput,
  CrmObject,
  GetInput,
  ListAssociationsInput,
  MoveDealInput,
  PipelineList,
  type Properties,
  SearchInput,
  SearchPage,
  UpdateInput,
  UpsertBatch,
  UpsertContactByEmailInput,
  UpsertContactsInput,
} from './schemas';

export interface HubSpotDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

type Resource = 'contacts' | 'companies' | 'deals';

/**
 * The HubSpot client: each operation takes `ctx` first, checks its input and HubSpot's answer, and makes one span
 * (`hubspot contacts.search`). Build it once at startup and share it.
 *
 * ```ts
 * const hubspot = createHubSpot(settingsFromEnv(settings, readEnv), { tracer, metrics });
 * const { id, created } = await hubspot.upsertContactByEmail(ctx, { email, firstName });
 * ```
 */
export function createHubSpot(config: HubspotConfig, deps: HubSpotDeps = {}) {
  const cfg = configSchema.parse(config);
  const base = provider.baseUrl;
  const server = provider.server;

  function call<T>(
    ctx: Context,
    operation: HubspotOperation,
    request: Omit<ProviderRequest, 'url' | 'headers'> & { path: string },
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
    failureInBody?: ProviderRequestOptions<T>['failureInBody'],
  ): Promise<T> {
    const { path, ...rest } = request;
    return providerRequest(
      ctx,
      { integration: provider.id, operation, category: provider.category, server },
      { ...rest, url: `${base}${path}`, headers: { authorization: `Bearer ${cfg.accessToken}` } },
      { schema, error: HubSpotError, failure, failureInBody, deps },
    );
  }

  /** create, get, update and search, the same for contacts, companies and deals. */
  function records(resource: Resource) {
    const path = `/crm/v3/objects/${resource}`;
    return {
      /**
       * Creates the record. HubSpot takes no idempotency key, so a create retried after HubSpot did it (a timeout,
       * a 5xx) can make two: for contacts, prefer `upsertContactByEmail`.
       */
      async create(ctx: Context, input: CreateInput) {
        const i = parse(CreateInput, input);
        return call(ctx, `${resource}.create`, { method: 'POST', path, json: { properties: wire(i.properties), associations: i.associations.map(association) } }, CrmObject);
      },
      /** One record by its id, with the properties asked for. A record that isn't there fails with `hubspot/not-found`. */
      async get(ctx: Context, input: GetInput) {
        const i = parse(GetInput, input);
        return call(ctx, `${resource}.get`, { method: 'GET', path: `${path}/${segment(i.id)}`, query: { properties: i.properties?.join(',') } }, CrmObject);
      },
      /** Sets these properties and leaves the others. `null` clears one. */
      async update(ctx: Context, input: UpdateInput) {
        const i = parse(UpdateInput, input);
        return call(ctx, `${resource}.update`, { method: 'PATCH', path: `${path}/${segment(i.id)}`, json: { properties: wire(i.properties) } }, CrmObject);
      },
      /**
       * One page of records matching the filters. Search is limited to five requests a second per account, and a
       * record created or changed a moment ago may not be found yet.
       */
      async search(ctx: Context, input: SearchInput) {
        const i = parse(SearchInput, input);
        return call(ctx, `${resource}.search`, { method: 'POST', path: `${path}/search`, json: i }, SearchPage);
      },
    };
  }

  async function findOne(ctx: Context, resource: Resource, propertyName: string, value: string, properties?: string[]): Promise<CrmObject | null> {
    const page = await records(resource).search(ctx, { filterGroups: [{ filters: [{ propertyName, operator: 'EQ', value }] }], properties, limit: 1 });
    return page.results.at(0) ?? null;
  }

  const contacts = {
    ...records('contacts'),
    /** The contact with this email, or null. Search lags writes by a moment: to create-or-update, use `upsertContactByEmail`. */
    async findByEmail(ctx: Context, input: { email: string; properties?: string[] }) {
      const i = parse(z.object({ email: z.string().email(), properties: z.array(z.string().min(1)).optional() }), input);
      return findOne(ctx, 'contacts', 'email', i.email, i.properties);
    },
    /**
     * Creates or updates up to 100 contacts, each matched by email, in one call; each result's `new` says which.
     * Unlike search then create, two of these racing for one email don't make two contacts. When none of them
     * worked (HubSpot's 207 with no results), it fails with the category of HubSpot's first error.
     */
    async upsertByEmail(ctx: Context, input: UpsertContactsInput) {
      const i = parse(UpsertContactsInput, input);
      const inputs = i.contacts.map((c) => ({ id: c.email, idProperty: 'email', properties: wire({ email: c.email, ...c.properties }) }));
      return call(ctx, 'contacts.batchUpsert', { method: 'POST', path: '/crm/v3/objects/contacts/batch/upsert', json: { inputs } }, UpsertBatch, batchFailure);
    },
  };

  const companies = {
    ...records('companies'),
    /** The company with this domain, or null. A URL is cut to its host: `https://example.com/about` finds `example.com`. */
    async findByDomain(ctx: Context, input: { domain: string; properties?: string[] }) {
      const i = parse(z.object({ domain: z.string().min(1), properties: z.array(z.string().min(1)).optional() }), input);
      return findOne(ctx, 'companies', 'domain', bareDomain(i.domain), i.properties);
    },
  };

  const deals = {
    ...records('deals'),
    /** Moves a deal to another stage, by the stage's internal id (and the pipeline's, when it changes pipeline). */
    async moveToStage(ctx: Context, input: MoveDealInput) {
      const i = parse(MoveDealInput, input);
      return deals.update(ctx, { id: i.id, properties: { dealstage: i.stage, ...(i.pipeline ? { pipeline: i.pipeline } : {}) } });
    },
  };

  const dealPipelines = {
    /** The account's deal pipelines and their stages, in display order. */
    async list(ctx: Context) {
      const { results } = await call(ctx, 'dealPipelines.list', { method: 'GET', path: '/crm/v3/pipelines/deals' }, PipelineList);
      return results
        .filter((p) => !p.archived)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((p) => ({ ...p, stages: p.stages.filter((s) => !s.archived).sort((a, b) => a.displayOrder - b.displayOrder) }));
    },
  };

  const notes = {
    /** A note on the timeline of each record it's associated with (`ASSOCIATION_TYPES.noteToContact`...). */
    async create(ctx: Context, input: CreateNoteInput) {
      const i = parse(CreateNoteInput, input);
      const properties = { hs_note_body: i.body, hs_timestamp: String(i.timestamp ?? new Date().toISOString()) };
      return call(ctx, 'notes.create', { method: 'POST', path: '/crm/v3/objects/notes', json: { properties, associations: i.associations.map(association) } }, CrmObject);
    },
  };

  const associations = {
    /** Associates two records with HubSpot's default type for the pair. Doing it again changes nothing. */
    async create(ctx: Context, input: AssociateInput) {
      const { from, to } = parse(AssociateInput, input);
      await call(
        ctx,
        'associations.create',
        { method: 'PUT', path: `/crm/v4/objects/${segment(from.type)}/${segment(from.id)}/associations/default/${segment(to.type)}/${segment(to.id)}` },
        z.unknown(),
      );
    },
    /** One page of the records of `toType` that `from` is associated with. */
    async list(ctx: Context, input: ListAssociationsInput) {
      const i = parse(ListAssociationsInput, input);
      return call(
        ctx,
        'associations.list',
        { method: 'GET', path: `/crm/v4/objects/${segment(i.from.type)}/${segment(i.from.id)}/associations/${segment(i.toType)}`, query: { limit: i.limit, after: i.after } },
        AssociationPage,
      );
    },
    /** Removes every association between the two records; the records stay. */
    async delete(ctx: Context, input: AssociateInput) {
      const { from, to } = parse(AssociateInput, input);
      await call(
        ctx,
        'associations.delete',
        { method: 'DELETE', path: `/crm/v4/objects/${segment(from.type)}/${segment(from.id)}/associations/${segment(to.type)}/${segment(to.id)}` },
        z.unknown(),
      );
    },
  };

  /**
   * The same three in every Mariachi CRM integration (HubSpot, Salesforce, Pipedrive): the same names, inputs and
   * results, so an app can change CRM without changing its calls. `properties` keys are HubSpot's own names.
   */
  const shared = {
    /** Creates the contact with this email, or updates the one there is, in one call. */
    async upsertContactByEmail(ctx: Context, input: UpsertContactByEmailInput): Promise<{ id: string; created: boolean }> {
      const i = parse(UpsertContactByEmailInput, input);
      const properties = { firstname: i.firstName, lastname: i.lastName, phone: i.phone, company: i.company, ...i.properties };
      const batch = await contacts.upsertByEmail(ctx, { contacts: [{ email: i.email, properties: defined(properties) }] });
      const result = batch.results.at(0);
      // A batch with no results and no errors: batchFailure had nothing to report, but there's no contact either
      if (!result) throw new HubSpotError('hubspot/upsert-failed', "HubSpot didn't create or update the contact", { category: 'invalid-request' });
      return { id: result.id, created: result.new };
    },

    /** Creates a deal, associated with the contact and company given. Without a stage, the first pipeline's first stage. */
    async createDeal(ctx: Context, input: CreateDealInput): Promise<{ id: string }> {
      const i = parse(CreateDealInput, input);
      const properties: Properties = defined({ dealname: i.name, amount: i.amount, deal_currency_code: i.currency, dealstage: i.stage, ...i.properties });
      if (properties.dealstage === undefined) {
        const first = (await dealPipelines.list(ctx)).find((p) => p.stages.length > 0);
        if (!first) throw new HubSpotError('hubspot/no-pipeline', 'The HubSpot account has no deal pipeline with a stage', { category: 'invalid-request' });
        properties.dealstage = first.stages[0]!.id;
        properties.pipeline ??= first.id;
      }
      const links: AssociationInput[] = [
        ...(i.contactId ? [{ toId: i.contactId, typeId: ASSOCIATION_TYPES.dealToContact }] : []),
        ...(i.companyId ? [{ toId: i.companyId, typeId: ASSOCIATION_TYPES.dealToPrimaryCompany }] : []),
      ];
      const deal = await deals.create(ctx, { properties, associations: links });
      return { id: deal.id };
    },

    /** A note on the contact's, deal's and company's timelines (at least one). */
    async addNote(ctx: Context, input: AddNoteInput): Promise<{ id: string }> {
      const i = parse(AddNoteInput, input);
      const links: AssociationInput[] = [
        ...(i.contactId ? [{ toId: i.contactId, typeId: ASSOCIATION_TYPES.noteToContact }] : []),
        ...(i.dealId ? [{ toId: i.dealId, typeId: ASSOCIATION_TYPES.noteToDeal }] : []),
        ...(i.companyId ? [{ toId: i.companyId, typeId: ASSOCIATION_TYPES.noteToCompany }] : []),
      ];
      const note = await notes.create(ctx, { body: i.body, associations: links });
      return { id: note.id };
    },
  };

  return { contacts, companies, deals, dealPipelines, notes, associations, ...shared };
}

export type HubSpot = ReturnType<typeof createHubSpot>;

/**
 * HubSpot's error body is `{ status, message, correlationId, category, ... }`: the category is kept (it's the code
 * an app acts on), the message isn't (it can echo input, such as the existing contact's id).
 */
function failure(_status: number, body: unknown): FailureInfo | undefined {
  const code = typeof body === 'object' && body !== null && typeof (body as { category?: unknown }).category === 'string' ? (body as { category: string }).category : undefined;
  const mapped = mappedFailure(errorMap, code);
  return { providerCode: code, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}

/**
 * A batch call that did nothing answers 207 (a 2xx) with `results: []` and `errors`: that's a failure, with the
 * category of the first error, so the span and the metrics say so. A partial batch (some results) isn't.
 */
function batchFailure(body: unknown): (FailureInfo & { category: ErrorCategory }) | undefined {
  const b = body as { results?: unknown; errors?: unknown } | null;
  if (typeof b !== 'object' || b === null || !Array.isArray(b.results) || b.results.length > 0) return undefined;
  if (!Array.isArray(b.errors) || b.errors.length === 0) return undefined;
  const first = b.errors[0] as { category?: unknown } | null;
  const code = typeof first?.category === 'string' ? first.category : undefined;
  const mapped = mappedFailure(errorMap, code);
  return { category: mapped?.category ?? 'invalid-request', reason: mapped?.reason ?? 'upsert-failed', providerCode: code };
}

/** HubSpot keeps every property as text: numbers and booleans are sent as strings, and `null` (clear it) as "". */
function wire(properties: Properties): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(properties)) out[key] = value === null ? '' : String(value);
  return out;
}

function association(a: AssociationInput) {
  const { toId, typeId, category = 'HUBSPOT_DEFINED' } = a;
  return { to: { id: toId }, types: [{ associationCategory: category, associationTypeId: typeId }] };
}

function defined<T extends Record<string, unknown>>(record: T): { [K in keyof T]: Exclude<T[K], undefined> } {
  return Object.fromEntries(Object.entries(record).filter(([, v]) => v !== undefined)) as { [K in keyof T]: Exclude<T[K], undefined> };
}

/** `https://Example.com/about` → `example.com`: a company's domain is a host, never a URL. */
function bareDomain(value: string): string {
  return value.trim().toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/[/?#].*$/, '');
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid HubSpot input');
  return parsed.data;
}

function segment(value: string): string {
  return encodeURIComponent(value);
}
