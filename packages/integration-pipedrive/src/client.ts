import { ConfigError, type Context, fromZodError } from '@mariachi/core';
import { type FailureInfo, type HttpMethod, type ProviderDeps, mappedFailure, providerRequest } from '@mariachi/integrations';
import { z } from 'zod';
import { crmHelpers } from './crm';
import { PipedriveError } from './errors';
import { fieldsBody } from './fields';
import { type PipedriveConfig, type PipedriveOperation, configSchema, errorMap, provider } from './generated';
import {
  CreateDealInput,
  CreateNoteInput,
  CreateOrganizationInput,
  CreatePersonInput,
  CreateWebhookInput,
  Deal,
  Field,
  ListDealsInput,
  ListNotesInput,
  ListPageInput,
  ListPersonsInput,
  ListStagesInput,
  Note,
  type OffsetPage,
  Organization,
  OrganizationHit,
  type Page,
  Person,
  PersonHit,
  Pipeline,
  SearchOrganizationsInput,
  SearchPersonsInput,
  Stage,
  UpdateDealInput,
  UpdatePersonInput,
  Webhook,
  offsetPage,
  one,
  page,
  searchPage,
} from './schemas';

export interface PipedriveDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

interface Request {
  method: HttpMethod;
  path: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  json?: unknown;
}

const PositiveId = z.number().int().positive();

/**
 * The Pipedrive client: each operation takes `ctx` first, checks its input and Pipedrive's answer, and makes one
 * span (`pipedrive persons.search`). API v2 where Pipedrive has it; notes and webhooks are API v1, which is all
 * Pipedrive offers for them. Build it once at startup and share it.
 *
 * ```ts
 * const pipedrive = createPipedrive(settingsFromEnv(settings, readEnv), { tracer, metrics });
 * const { id } = await pipedrive.upsertContactByEmail(ctx, { email, firstName, company });
 * ```
 */
export function createPipedrive(config: PipedriveConfig, deps: PipedriveDeps = {}) {
  const cfg = configSchema.parse(config);
  const server = `${companySubdomain(cfg.companyDomain)}.pipedrive.com`;
  const base = `https://${server}`;

  function call<T>(ctx: Context, operation: PipedriveOperation, request: Request, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
    const { path, ...rest } = request;
    return providerRequest(
      ctx,
      { integration: provider.id, operation, category: provider.category, server },
      { ...rest, url: `${base}${path}`, headers: { 'x-api-token': cfg.apiToken } },
      { schema, error: PipedriveError, failure: failureFor(operation), deps },
    );
  }

  const persons = {
    /** Adds a person. `name` is required by Pipedrive; give their email addresses and phones as lists. */
    async create(ctx: Context, input: CreatePersonInput): Promise<Person> {
      const i = parse(CreatePersonInput, input);
      return call(ctx, 'persons.create', { method: 'POST', path: '/api/v2/persons', json: personBody(i) }, one(Person));
    },
    async get(ctx: Context, id: number): Promise<Person> {
      return call(ctx, 'persons.get', { method: 'GET', path: `/api/v2/persons/${parse(PositiveId, id)}` }, one(Person));
    },
    /**
     * Changes only the fields given. `emails` and `phones` replace the person's whole list: read the person
     * first to keep the others.
     */
    async update(ctx: Context, input: UpdatePersonInput): Promise<Person> {
      const { id, ...i } = parse(UpdatePersonInput, input);
      return call(ctx, 'persons.update', { method: 'PATCH', path: `/api/v2/persons/${id}`, json: personBody(i) }, one(Person));
    },
    /** One page of persons, oldest first. */
    async list(ctx: Context, input: ListPersonsInput = {}): Promise<Page<Person>> {
      const i = parse(ListPersonsInput, input);
      return call(
        ctx,
        'persons.list',
        { method: 'GET', path: '/api/v2/persons', query: { org_id: i.orgId, owner_id: i.ownerId, updated_since: i.updatedSince, limit: i.limit, cursor: i.cursor } },
        page(Person),
      );
    },
    /** Every person matching `input`, fetching pages as they're read. Stop early with `break`. */
    all(ctx: Context, input: ListPersonsInput = {}): AsyncGenerator<Person> {
      return everyPage((cursor) => persons.list(ctx, { limit: 500, ...input, cursor }), input.cursor);
    },
    /** One page of search hits, best match first. */
    async search(ctx: Context, input: SearchPersonsInput) {
      const i = parse(SearchPersonsInput, input);
      return call(
        ctx,
        'persons.search',
        {
          method: 'GET',
          path: '/api/v2/persons/search',
          query: { term: i.term, fields: i.fields?.join(','), exact_match: i.exactMatch, organization_id: i.orgId, limit: i.limit, cursor: i.cursor },
        },
        searchPage(PersonHit),
      );
    },
    /**
     * The person with this email address, or `undefined`: an exact search of the email field, not
     * case-sensitive. Where several share it, the best match.
     */
    async findByEmail(ctx: Context, email: string): Promise<PersonHit | undefined> {
      const term = parse(z.string().email(), email);
      const hits = await persons.search(ctx, { term, fields: ['email'], exactMatch: true, limit: 1 });
      return hits.items[0]?.item;
    },
  };

  const organizations = {
    async create(ctx: Context, input: CreateOrganizationInput): Promise<Organization> {
      const i = parse(CreateOrganizationInput, input);
      return call(ctx, 'organizations.create', { method: 'POST', path: '/api/v2/organizations', json: { ...fieldsBody(i.fields), ...defined({ name: i.name, owner_id: i.ownerId }) } }, one(Organization));
    },
    async get(ctx: Context, id: number): Promise<Organization> {
      return call(ctx, 'organizations.get', { method: 'GET', path: `/api/v2/organizations/${parse(PositiveId, id)}` }, one(Organization));
    },
    async search(ctx: Context, input: SearchOrganizationsInput) {
      const i = parse(SearchOrganizationsInput, input);
      return call(
        ctx,
        'organizations.search',
        { method: 'GET', path: '/api/v2/organizations/search', query: { term: i.term, fields: i.fields?.join(','), exact_match: i.exactMatch, limit: i.limit, cursor: i.cursor } },
        searchPage(OrganizationHit),
      );
    },
    /** The organization with exactly this name (not case-sensitive), or `undefined`. */
    async findByName(ctx: Context, name: string): Promise<OrganizationHit | undefined> {
      const term = parse(z.string().trim().min(1), name);
      const hits = await organizations.search(ctx, { term, fields: ['name'], exactMatch: true, limit: 10 });
      return hits.items.map((h) => h.item).find((o) => o.name.trim().toLowerCase() === term.toLowerCase());
    },
  };

  const deals = {
    /** Adds a deal. Without a stage it goes to the first stage of the default pipeline. */
    async create(ctx: Context, input: CreateDealInput): Promise<Deal> {
      const i = parse(CreateDealInput, input);
      return call(ctx, 'deals.create', { method: 'POST', path: '/api/v2/deals', json: dealBody(i) }, one(Deal));
    },
    async get(ctx: Context, id: number): Promise<Deal> {
      return call(ctx, 'deals.get', { method: 'GET', path: `/api/v2/deals/${parse(PositiveId, id)}` }, one(Deal));
    },
    /** Changes only the fields given: move it with `stageId`, close it with `status`. */
    async update(ctx: Context, input: UpdateDealInput): Promise<Deal> {
      const { id, ...i } = parse(UpdateDealInput, input);
      return call(ctx, 'deals.update', { method: 'PATCH', path: `/api/v2/deals/${id}`, json: dealBody(i) }, one(Deal));
    },
    /** One page of deals that aren't archived. */
    async list(ctx: Context, input: ListDealsInput = {}): Promise<Page<Deal>> {
      const i = parse(ListDealsInput, input);
      return call(
        ctx,
        'deals.list',
        {
          method: 'GET',
          path: '/api/v2/deals',
          query: {
            person_id: i.personId,
            org_id: i.orgId,
            pipeline_id: i.pipelineId,
            stage_id: i.stageId,
            status: i.status?.join(','),
            updated_since: i.updatedSince,
            limit: i.limit,
            cursor: i.cursor,
          },
        },
        page(Deal),
      );
    },
    all(ctx: Context, input: ListDealsInput = {}): AsyncGenerator<Deal> {
      return everyPage((cursor) => deals.list(ctx, { limit: 500, ...input, cursor }), input.cursor);
    },
  };

  const pipelines = {
    async list(ctx: Context, input: ListPageInput = {}): Promise<Page<Pipeline>> {
      const i = parse(ListPageInput, input);
      return call(ctx, 'pipelines.list', { method: 'GET', path: '/api/v2/pipelines', query: { limit: i.limit, cursor: i.cursor } }, page(Pipeline));
    },
    all(ctx: Context): AsyncGenerator<Pipeline> {
      return everyPage((cursor) => pipelines.list(ctx, { limit: 500, cursor }));
    },
  };

  const stages = {
    /** One page of stages, of every pipeline or of `pipelineId`'s. */
    async list(ctx: Context, input: ListStagesInput = {}): Promise<Page<Stage>> {
      const i = parse(ListStagesInput, input);
      return call(ctx, 'stages.list', { method: 'GET', path: '/api/v2/stages', query: { pipeline_id: i.pipelineId, limit: i.limit, cursor: i.cursor } }, page(Stage));
    },
    all(ctx: Context, input: Omit<ListStagesInput, 'cursor'> = {}): AsyncGenerator<Stage> {
      return everyPage((cursor) => stages.list(ctx, { limit: 500, ...input, cursor }));
    },
  };

  function fieldsOf(operation: 'personFields.list' | 'organizationFields.list' | 'dealFields.list', path: string) {
    const fields = {
      /** One page of fields: each `field_code` is the key a value is set under. */
      async list(ctx: Context, input: ListPageInput = {}): Promise<Page<Field>> {
        const i = parse(ListPageInput, input);
        return call(ctx, operation, { method: 'GET', path, query: { limit: i.limit, cursor: i.cursor } }, page(Field));
      },
      all(ctx: Context): AsyncGenerator<Field> {
        return everyPage((cursor) => fields.list(ctx, { limit: 500, cursor }));
      },
    };
    return fields;
  }

  const notes = {
    /** Adds a note to a person, organization, deal or lead. `content` is HTML: for plain text, `noteHtml(text)`. */
    async create(ctx: Context, input: CreateNoteInput): Promise<Note> {
      const i = parse(CreateNoteInput, input);
      return call(
        ctx,
        'notes.create',
        { method: 'POST', path: '/api/v1/notes', json: { content: i.content, person_id: i.personId, org_id: i.orgId, deal_id: i.dealId, lead_id: i.leadId } },
        one(Note),
      );
    },
    /** One page of notes, by offset: pass the answer's `nextStart` as `start` for the next. */
    async list(ctx: Context, input: ListNotesInput = {}): Promise<OffsetPage<Note>> {
      const i = parse(ListNotesInput, input);
      return call(
        ctx,
        'notes.list',
        { method: 'GET', path: '/api/v1/notes', query: { person_id: i.personId, org_id: i.orgId, deal_id: i.dealId, start: i.start, limit: i.limit } },
        offsetPage(Note),
      );
    },
    async *all(ctx: Context, input: Omit<ListNotesInput, 'start'> = {}): AsyncGenerator<Note> {
      let start: number | null = 0;
      while (start !== null) {
        const p: OffsetPage<Note> = await notes.list(ctx, { limit: 500, ...input, start });
        yield* p.items;
        start = p.nextStart;
      }
    },
  };

  const webhooks = {
    /**
     * Subscribes `url` to an event as a v2 webhook, sent with the webhook user name and password
     * (`PIPEDRIVE_WEBHOOK_USER`, `PIPEDRIVE_WEBHOOK_PASSWORD`) as HTTP Basic auth, so `pipedriveWebhookAuth` can
     * check what arrives. Each call makes another webhook: check `webhooks.list` first.
     */
    async create(ctx: Context, input: CreateWebhookInput): Promise<Webhook> {
      const i = parse(CreateWebhookInput, input);
      if (!cfg.webhookUser || !cfg.webhookPassword) {
        throw new PipedriveError('pipedrive/no-webhook-auth', 'Set the webhook user name and password (PIPEDRIVE_WEBHOOK_USER, PIPEDRIVE_WEBHOOK_PASSWORD) before making a webhook', { category: 'invalid-request' });
      }
      return call(
        ctx,
        'webhooks.create',
        {
          method: 'POST',
          path: '/api/v1/webhooks',
          json: { subscription_url: i.url, event_action: i.action, event_object: i.object, name: i.name, version: '2.0', http_auth_user: cfg.webhookUser, http_auth_password: cfg.webhookPassword },
        },
        one(Webhook),
      );
    },
    async list(ctx: Context): Promise<Webhook[]> {
      return call(ctx, 'webhooks.list', { method: 'GET', path: '/api/v1/webhooks' }, one(z.array(Webhook).nullable())).then((hooks) => hooks ?? []);
    },
    async delete(ctx: Context, id: number): Promise<void> {
      await call(ctx, 'webhooks.delete', { method: 'DELETE', path: `/api/v1/webhooks/${parse(PositiveId, id)}` }, z.unknown());
    },
  };

  const operations = {
    persons,
    organizations,
    deals,
    pipelines,
    stages,
    personFields: fieldsOf('personFields.list', '/api/v2/personFields'),
    organizationFields: fieldsOf('organizationFields.list', '/api/v2/organizationFields'),
    dealFields: fieldsOf('dealFields.list', '/api/v2/dealFields'),
    notes,
    webhooks,
  };
  return { ...operations, ...crmHelpers(operations) };
}

export type Pipedrive = ReturnType<typeof createPipedrive>;

function personBody(i: Omit<z.output<typeof UpdatePersonInput>, 'id'>): Record<string, unknown> {
  return { ...fieldsBody(i.fields), ...defined({ name: i.name, emails: i.emails, phones: i.phones, org_id: i.orgId, owner_id: i.ownerId }) };
}

function dealBody(i: Omit<z.output<typeof UpdateDealInput>, 'id'>): Record<string, unknown> {
  return {
    ...fieldsBody(i.fields),
    ...defined({
      title: i.title,
      value: i.value,
      currency: i.currency,
      person_id: i.personId,
      org_id: i.orgId,
      pipeline_id: i.pipelineId,
      stage_id: i.stageId,
      status: i.status,
      owner_id: i.ownerId,
      expected_close_date: i.expectedCloseDate,
    }),
  };
}

/** The values that are set, so a field given in `fields` isn't overwritten by an option that wasn't. */
function defined(values: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined));
}

async function* everyPage<T>(list: (cursor: string | undefined) => Promise<Page<T>>, first?: string): AsyncGenerator<T> {
  let cursor = first;
  for (;;) {
    const p = await list(cursor);
    yield* p.items;
    if (!p.nextCursor) return;
    cursor = p.nextCursor;
  }
}

/**
 * Pipedrive's error body is `{ success: false, error, error_info }`, sometimes with `additional_data.code`. The
 * code is kept; `error` isn't (it can echo input). Statuses Pipedrive documents a meaning for get their own reason.
 */
function failureFor(operation: PipedriveOperation) {
  return (status: number, body: unknown): FailureInfo => {
    const extra = (body as { additional_data?: { code?: unknown } } | null)?.additional_data;
    const code = typeof extra?.code === 'string' ? extra.code : undefined;
    const mapped = mappedFailure(errorMap, code);
    if (mapped) return { providerCode: code, category: mapped.category, reason: mapped.reason };
    // https://pipedrive.readme.io/docs/core-api-concepts-http-status-codes
    if (status === 402) return { providerCode: code, category: 'forbidden', reason: 'account-not-open' };
    if (status === 415) return { providerCode: code, category: 'forbidden', reason: 'feature-not-enabled' };
    if (status === 422 && operation === 'webhooks.create') return { providerCode: code, category: 'invalid-request', reason: 'webhooks-limit' };
    if (status === 501) return { providerCode: code, category: 'invalid-request', reason: 'not-implemented' };
    return { providerCode: code };
  };
}

/** `acme` from `acme`, `acme.pipedrive.com` or `https://acme.pipedrive.com/`. */
function companySubdomain(value: string): string {
  const sub = value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/\.pipedrive\.com$/, '');
  if (!/^[a-z0-9][a-z0-9-]*$/.test(sub)) {
    throw new ConfigError('pipedrive/invalid-company-domain', 'PIPEDRIVE_COMPANY_DOMAIN should be the company subdomain: acme for https://acme.pipedrive.com');
  }
  return sub;
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Pipedrive input');
  return parsed.data;
}
