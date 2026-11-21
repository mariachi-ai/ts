/**
 * `@mariachi/integration-pipedrive/testing`: a Pipedrive for an app's tests, held in memory, with the same shape as
 * `createPipedrive`'s client (the shared helpers run the same code over it); and a webhook delivery, with its
 * Basic credentials, to post to the app's endpoint.
 */
import type { Context } from '@mariachi/core';
import type { Pipedrive } from './client';
import { crmHelpers } from './crm';
import { PipedriveError } from './errors';
import { isCustomFieldKey } from './fields';
import type { Deal, Field, FieldValues, Note, Organization, Page, Person, Pipeline, Stage, Webhook, WebhookEvent } from './schemas';

export interface FakePipedriveSeed {
  persons?: Person[];
  organizations?: Organization[];
  deals?: Deal[];
  notes?: Note[];
  pipelines?: Pipeline[];
  stages?: Stage[];
  personFields?: Field[];
  organizationFields?: Field[];
  dealFields?: Field[];
}

export interface FakePipedrive extends Pipedrive {
  persons_: Map<number, Person>;
  organizations_: Map<number, Organization>;
  deals_: Map<number, Deal>;
  notes_: Map<number, Note>;
  webhooks_: Map<number, Webhook>;
}

/** An in-memory Pipedrive: seed it, then hand it to the code under test in place of the client. */
export function fakePipedrive(seed: FakePipedriveSeed = {}): FakePipedrive {
  const byId = <T extends { id: number }>(items: T[] = []) => new Map(items.map((x) => [x.id, x]));
  const persons_ = byId(seed.persons);
  const organizations_ = byId(seed.organizations);
  const deals_ = byId(seed.deals);
  const notes_ = byId(seed.notes);
  const webhooks_ = new Map<number, Webhook>();
  const pipelines = seed.pipelines ?? [];
  const stages = seed.stages ?? [];
  let next = 1000;
  const now = () => new Date().toISOString();
  const found = <T>(map: Map<number, T>, id: number, what: string): T => {
    const item = map.get(id);
    if (!item) throw new PipedriveError('pipedrive/not-found', `No Pipedrive ${what} with that id`, { category: 'not-found', status: 404 });
    return item;
  };
  const onePage = <T>(items: T[]): Page<T> => ({ items, nextCursor: null });
  const matches = (value: string | undefined | null, term: string, exact?: boolean) =>
    !!value && (exact ? value.toLowerCase() === term.toLowerCase() : value.toLowerCase().includes(term.toLowerCase()));
  const fieldsList = (fields: Field[] = []) => ({
    async list(_ctx: Context) {
      return onePage(fields);
    },
    async *all(_ctx: Context) {
      yield* fields;
    },
  });

  const operations: Omit<Pipedrive, 'upsertContactByEmail' | 'createDeal' | 'addNote'> = {
    persons: {
      async create(_ctx, input) {
        const person: Person = withFields(
          {
            id: next++,
            name: input.name,
            emails: (input.emails ?? []).map((e) => ({ primary: false, ...e })),
            phones: (input.phones ?? []).map((p) => ({ primary: false, ...p })),
            org_id: input.orgId ?? null,
            owner_id: input.ownerId ?? null,
            add_time: now(),
            custom_fields: {},
          },
          input.fields,
        );
        persons_.set(person.id, person);
        return person;
      },
      async get(_ctx, id) {
        return found(persons_, id, 'person');
      },
      async update(_ctx, { id, ...input }) {
        const person = found(persons_, id, 'person');
        const updated = withFields(
          {
            ...person,
            ...(input.name ? { name: input.name } : {}),
            ...(input.emails ? { emails: input.emails.map((e) => ({ primary: false, ...e })) } : {}),
            ...(input.phones ? { phones: input.phones.map((p) => ({ primary: false, ...p })) } : {}),
            ...(input.orgId ? { org_id: input.orgId } : {}),
            ...(input.ownerId ? { owner_id: input.ownerId } : {}),
            update_time: now(),
          },
          input.fields,
        );
        persons_.set(id, updated);
        return updated;
      },
      async list(_ctx, input = {}) {
        return onePage([...persons_.values()].filter((p) => (!input.orgId || p.org_id === input.orgId) && (!input.ownerId || p.owner_id === input.ownerId)));
      },
      async *all(ctx, input = {}) {
        yield* (await operations.persons.list(ctx, input)).items;
      },
      async search(_ctx, input) {
        const fields = input.fields ?? ['name', 'email', 'phone'];
        const hits = [...persons_.values()]
          .filter((p) => !input.orgId || p.org_id === input.orgId)
          .filter(
            (p) =>
              (fields.includes('name') && matches(p.name, input.term, input.exactMatch)) ||
              (fields.includes('email') && p.emails.some((e) => matches(e.value, input.term, input.exactMatch))) ||
              (fields.includes('phone') && p.phones.some((ph) => matches(ph.value, input.term, input.exactMatch))),
          )
          .slice(0, input.limit ?? 100)
          .map((p) => ({ score: 1, item: { id: p.id, name: p.name, emails: p.emails.map((e) => e.value), phones: p.phones.map((ph) => ph.value), organization: p.org_id ? { id: p.org_id } : null } }));
        return onePage(hits);
      },
      async findByEmail(ctx, email) {
        return (await operations.persons.search(ctx, { term: email, fields: ['email'], exactMatch: true, limit: 1 })).items[0]?.item;
      },
    },
    organizations: {
      async create(_ctx, input) {
        const org: Organization = withFields({ id: next++, name: input.name, owner_id: input.ownerId ?? null, add_time: now(), custom_fields: {} }, input.fields);
        organizations_.set(org.id, org);
        return org;
      },
      async get(_ctx, id) {
        return found(organizations_, id, 'organization');
      },
      async search(_ctx, input) {
        const hits = [...organizations_.values()].filter((o) => matches(o.name, input.term, input.exactMatch)).slice(0, input.limit ?? 100);
        return onePage(hits.map((o) => ({ score: 1, item: { id: o.id, name: o.name } })));
      },
      async findByName(_ctx, name) {
        const o = [...organizations_.values()].find((x) => x.name.trim().toLowerCase() === name.trim().toLowerCase());
        return o ? { id: o.id, name: o.name } : undefined;
      },
    },
    deals: {
      async create(_ctx, input) {
        const stage = input.stageId ? stages.find((s) => s.id === input.stageId) : undefined;
        if (input.stageId && !stage) throw new PipedriveError('pipedrive/invalid-request', 'No Pipedrive stage with that id', { category: 'invalid-request', status: 400 });
        const deal: Deal = withFields(
          {
            id: next++,
            title: input.title,
            value: input.value ?? 0,
            currency: input.currency ?? null,
            person_id: input.personId ?? null,
            org_id: input.orgId ?? null,
            stage_id: input.stageId ?? null,
            pipeline_id: input.pipelineId ?? stage?.pipeline_id ?? null,
            status: input.status ?? 'open',
            owner_id: input.ownerId ?? null,
            add_time: now(),
            custom_fields: {},
          },
          input.fields,
        );
        deals_.set(deal.id, deal);
        return deal;
      },
      async get(_ctx, id) {
        return found(deals_, id, 'deal');
      },
      async update(_ctx, { id, ...input }) {
        const deal = found(deals_, id, 'deal');
        const updated = withFields(
          {
            ...deal,
            ...(input.title ? { title: input.title } : {}),
            ...(input.value !== undefined ? { value: input.value } : {}),
            ...(input.currency ? { currency: input.currency } : {}),
            ...(input.stageId ? { stage_id: input.stageId } : {}),
            ...(input.status ? { status: input.status } : {}),
            ...(input.personId ? { person_id: input.personId } : {}),
            ...(input.orgId ? { org_id: input.orgId } : {}),
            update_time: now(),
          },
          input.fields,
        );
        deals_.set(id, updated);
        return updated;
      },
      async list(_ctx, input = {}) {
        return onePage(
          [...deals_.values()].filter(
            (d) =>
              (!input.personId || d.person_id === input.personId) &&
              (!input.orgId || d.org_id === input.orgId) &&
              (!input.stageId || d.stage_id === input.stageId) &&
              (!input.pipelineId || d.pipeline_id === input.pipelineId) &&
              (!input.status || input.status.includes(d.status as 'open')),
          ),
        );
      },
      async *all(ctx, input = {}) {
        yield* (await operations.deals.list(ctx, input)).items;
      },
    },
    pipelines: {
      async list() {
        return onePage(pipelines);
      },
      async *all() {
        yield* pipelines;
      },
    },
    stages: {
      async list(_ctx, input = {}) {
        return onePage(stages.filter((s) => !input.pipelineId || s.pipeline_id === input.pipelineId));
      },
      async *all(ctx, input = {}) {
        yield* (await operations.stages.list(ctx, input)).items;
      },
    },
    personFields: fieldsList(seed.personFields),
    organizationFields: fieldsList(seed.organizationFields),
    dealFields: fieldsList(seed.dealFields),
    notes: {
      async create(_ctx, input) {
        const note: Note = { id: next++, content: input.content, person_id: input.personId ?? null, org_id: input.orgId ?? null, deal_id: input.dealId ?? null, lead_id: input.leadId ?? null, add_time: now() };
        notes_.set(note.id, note);
        return note;
      },
      async list(_ctx, input = {}) {
        const items = [...notes_.values()].filter(
          (n) => (!input.personId || n.person_id === input.personId) && (!input.orgId || n.org_id === input.orgId) && (!input.dealId || n.deal_id === input.dealId),
        );
        return { items, nextStart: null };
      },
      async *all(ctx, input = {}) {
        yield* (await operations.notes.list(ctx, input)).items;
      },
    },
    webhooks: {
      async create(_ctx, input) {
        const hook: Webhook = { id: next++, event_action: input.action, event_object: input.object, subscription_url: input.url, name: input.name, version: '2.0', is_active: 1 };
        webhooks_.set(hook.id, hook);
        return hook;
      },
      async list() {
        return [...webhooks_.values()];
      },
      async delete(_ctx, id) {
        found(webhooks_, id, 'webhook');
        webhooks_.delete(id);
      },
    },
  };

  return { ...operations, ...crmHelpers(operations), persons_, organizations_, deals_, notes_, webhooks_ };
}

/** Field values set the way Pipedrive keeps them: custom ones (40-character codes) under `custom_fields`. */
function withFields<T extends { custom_fields?: Record<string, unknown> | null }>(item: T, fields: FieldValues | undefined): T {
  const out: T = { ...item, custom_fields: { ...(item.custom_fields ?? {}) } };
  for (const [key, value] of Object.entries(fields ?? {})) {
    if (isCustomFieldKey(key)) (out.custom_fields as Record<string, unknown>)[key] = value;
    else (out as Record<string, unknown>)[key] = value;
  }
  return out;
}

/** A v2 webhook body, for a test: `meta` filled in around what's given. */
export function pipedriveEvent(input: { entity: string; action: 'create' | 'change' | 'delete'; data?: Record<string, unknown> | null; previous?: Record<string, unknown> | null; id?: string; attempt?: number }): WebhookEvent {
  const entityId = input.data?.id ?? input.previous?.id;
  return {
    meta: {
      id: input.id ?? `00000000-0000-4000-8000-${String(Math.floor(Math.random() * 1e12)).padStart(12, '0')}`,
      action: input.action,
      entity: input.entity,
      ...(entityId !== undefined ? { entity_id: String(entityId) } : {}),
      timestamp: new Date().toISOString(),
      version: '2.0',
      attempt: input.attempt ?? 1,
      change_source: 'api',
      is_bulk_edit: false,
    },
    data: input.action === 'delete' ? null : (input.data ?? {}),
    previous: input.action === 'create' ? null : (input.previous ?? {}),
  };
}

/** The body and `Authorization` header Pipedrive would send for this event, with the webhook's Basic credentials. */
export function pipedriveWebhook(event: WebhookEvent, credentials: { user: string; password: string }): { rawBody: string; headers: Record<string, string> } {
  return {
    rawBody: JSON.stringify(event),
    headers: { authorization: `Basic ${Buffer.from(`${credentials.user}:${credentials.password}`).toString('base64')}` },
  };
}
