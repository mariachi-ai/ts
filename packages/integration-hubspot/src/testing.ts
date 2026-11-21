/**
 * `@mariachi/integration-hubspot/testing`: a HubSpot for an app's tests, held in memory, with the same shape as
 * `createHubSpot`'s client; and a signed webhook to post to the app's endpoint.
 */
import { createHmac } from 'node:crypto';
import { ConflictError, NotFoundError } from '@mariachi/core';
import type { HubSpot } from './client';
import type { Association, CrmObject, Pipeline, Properties, WebhookEvent } from './schemas';

type Kind = 'contacts' | 'companies' | 'deals' | 'notes';

export interface FakeHubSpot extends HubSpot {
  /** Every record by kind, then id, to seed and to assert on. */
  records_: Record<Kind, Map<string, CrmObject>>;
  /** Associations as `contact:1 -> deal:2` pairs, one entry each way. */
  associations_: Set<string>;
  pipelines_: Pipeline[];
}

const SINGULAR: Record<Kind, string> = { contacts: 'contact', companies: 'company', deals: 'deal', notes: 'note' };
const KIND: Record<string, Kind> = { contact: 'contacts', company: 'companies', deal: 'deals', note: 'notes' };

/** A deal pipeline to seed the fake with: `default`, with an open and a won stage, as a new account has. */
export function hubspotPipeline(overrides: Partial<Pipeline> = {}): Pipeline {
  return {
    id: 'default',
    label: 'Sales Pipeline',
    displayOrder: 0,
    stages: [
      { id: 'appointmentscheduled', label: 'Appointment Scheduled', displayOrder: 0, metadata: { probability: '0.2', isClosed: 'false' } },
      { id: 'closedwon', label: 'Closed Won', displayOrder: 1, metadata: { probability: '1.0', isClosed: 'true' } },
    ],
    ...overrides,
  };
}

/**
 * An in-memory HubSpot: seed records, then hand it to the code under test in place of the client. Search matches
 * `EQ` filters only (case-insensitively, as HubSpot does), and is up to date at once, which HubSpot's isn't.
 */
export function fakeHubSpot(seed: { contacts?: CrmObject[]; companies?: CrmObject[]; deals?: CrmObject[]; pipelines?: Pipeline[] } = {}): FakeHubSpot {
  const records_: Record<Kind, Map<string, CrmObject>> = {
    contacts: new Map((seed.contacts ?? []).map((r) => [r.id, r])),
    companies: new Map((seed.companies ?? []).map((r) => [r.id, r])),
    deals: new Map((seed.deals ?? []).map((r) => [r.id, r])),
    notes: new Map(),
  };
  const associations_ = new Set<string>();
  const pipelines_ = seed.pipelines ?? [hubspotPipeline()];
  let next = 1000;
  const now = () => new Date().toISOString();
  const text = (p: Properties) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v === null ? null : String(v)]));
  const recordOf = (kind: Kind, id: string) => {
    const r = records_[kind].get(id);
    if (!r) throw new NotFoundError(`hubspot ${SINGULAR[kind]}`, id);
    return r;
  };
  const link = (fromType: string, fromId: string, toType: string, toId: string) => {
    associations_.add(`${fromType}:${fromId} -> ${toType}:${toId}`);
    associations_.add(`${toType}:${toId} -> ${fromType}:${fromId}`);
  };
  const make = (kind: Kind, properties: Properties, links: Array<{ toId: string; typeId: number }> = []) => {
    const id = String(next++);
    const record: CrmObject = { id, properties: text(properties), createdAt: now(), updatedAt: now(), archived: false };
    records_[kind].set(id, record);
    for (const l of links) link(SINGULAR[kind], id, targetOf(l.typeId), l.toId);
    return record;
  };
  const resource = (kind: Exclude<Kind, 'notes'>) => ({
    async create(_ctx: unknown, input: { properties: Properties; associations?: Array<{ toId: string; typeId: number }> }) {
      if (kind === 'contacts' && input.properties.email && find('contacts', 'email', String(input.properties.email))) throw new ConflictError('hubspot contact already exists');
      return make(kind, input.properties, input.associations);
    },
    async get(_ctx: unknown, input: { id: string }) {
      return recordOf(kind, input.id);
    },
    async update(_ctx: unknown, input: { id: string; properties: Properties }) {
      const r = recordOf(kind, input.id);
      const updated = { ...r, properties: { ...r.properties, ...text(input.properties) }, updatedAt: now() };
      records_[kind].set(r.id, updated);
      return updated;
    },
    async search(_ctx: unknown, input: { filterGroups?: Array<{ filters: Array<{ propertyName: string; operator: string; value?: string }> }>; limit?: number }) {
      const groups = input.filterGroups ?? [];
      const results = [...records_[kind].values()].filter(
        (r) => groups.length === 0 || groups.some((g) => g.filters.every((f) => f.operator === 'EQ' && (r.properties[f.propertyName] ?? '').toLowerCase() === (f.value ?? '').toLowerCase())),
      );
      return { total: results.length, results: results.slice(0, input.limit ?? 10) };
    },
  });
  const find = (kind: Kind, property: string, value: string) => [...records_[kind].values()].find((r) => (r.properties[property] ?? '').toLowerCase() === value.toLowerCase());

  const fake: FakeHubSpot = {
    records_,
    associations_,
    pipelines_,
    contacts: {
      ...resource('contacts'),
      async findByEmail(_ctx, input) {
        return find('contacts', 'email', input.email) ?? null;
      },
      async upsertByEmail(ctx, input) {
        const results = [];
        for (const c of input.contacts) {
          const existing = find('contacts', 'email', c.email);
          const record = existing ? await fake.contacts.update(ctx, { id: existing.id, properties: c.properties ?? {} }) : make('contacts', { email: c.email, ...c.properties });
          results.push({ ...record, new: !existing });
        }
        return { status: 'COMPLETE', results };
      },
    },
    companies: {
      ...resource('companies'),
      async findByDomain(_ctx, input) {
        return find('companies', 'domain', input.domain) ?? null;
      },
    },
    deals: {
      ...resource('deals'),
      async moveToStage(ctx, input) {
        return fake.deals.update(ctx, { id: input.id, properties: { dealstage: input.stage, ...(input.pipeline ? { pipeline: input.pipeline } : {}) } });
      },
    },
    dealPipelines: {
      async list() {
        return pipelines_;
      },
    },
    notes: {
      async create(_ctx, input) {
        return make('notes', { hs_note_body: input.body, hs_timestamp: String(input.timestamp ?? now()) }, input.associations);
      },
    },
    associations: {
      async create(_ctx, input) {
        recordOf(KIND[input.from.type] ?? 'contacts', input.from.id);
        link(input.from.type, input.from.id, input.to.type, input.to.id);
      },
      async list(_ctx, input) {
        const prefix = `${input.from.type}:${input.from.id} -> ${input.toType}:`;
        const results: Association[] = [...associations_].filter((a) => a.startsWith(prefix)).map((a) => ({ toObjectId: a.slice(prefix.length), associationTypes: [] }));
        return { results };
      },
      async delete(_ctx, input) {
        associations_.delete(`${input.from.type}:${input.from.id} -> ${input.to.type}:${input.to.id}`);
        associations_.delete(`${input.to.type}:${input.to.id} -> ${input.from.type}:${input.from.id}`);
      },
    },
    async upsertContactByEmail(ctx, input) {
      const properties = Object.fromEntries(Object.entries({ firstname: input.firstName, lastname: input.lastName, phone: input.phone, company: input.company, ...input.properties }).filter(([, v]) => v !== undefined)) as Properties;
      const { results } = await fake.contacts.upsertByEmail(ctx, { contacts: [{ email: input.email, properties }] });
      return { id: results[0]!.id, created: results[0]!.new };
    },
    async createDeal(_ctx, input) {
      const stage = input.stage ?? pipelines_[0]?.stages[0]?.id;
      const properties = Object.fromEntries(Object.entries({ dealname: input.name, amount: input.amount, deal_currency_code: input.currency, dealstage: stage, ...input.properties }).filter(([, v]) => v !== undefined)) as Properties;
      const links = [...(input.contactId ? [{ toId: input.contactId, typeId: 3 }] : []), ...(input.companyId ? [{ toId: input.companyId, typeId: 5 }] : [])];
      return { id: make('deals', properties, links).id };
    },
    async addNote(_ctx, input) {
      const links = [...(input.contactId ? [{ toId: input.contactId, typeId: 202 }] : []), ...(input.dealId ? [{ toId: input.dealId, typeId: 214 }] : []), ...(input.companyId ? [{ toId: input.companyId, typeId: 190 }] : [])];
      return { id: make('notes', { hs_note_body: input.body, hs_timestamp: now() }, links).id };
    },
  };
  return fake;
}

/** The kind of record each of HubSpot's own association types points at, for the fake's bookkeeping. */
const TARGET: Record<number, string> = { 1: 'company', 279: 'company', 280: 'contact', 4: 'deal', 3: 'contact', 5: 'company', 341: 'company', 342: 'deal', 202: 'contact', 190: 'company', 214: 'deal', 201: 'note', 189: 'note', 213: 'note' };

function targetOf(typeId: number): string {
  return TARGET[typeId] ?? 'record';
}

/** An event to post in a test webhook. */
export function hubspotEvent(overrides: Partial<WebhookEvent> = {}): WebhookEvent {
  return {
    eventId: Math.floor(Math.random() * 1e9),
    subscriptionId: 1,
    portalId: 1,
    appId: 1,
    occurredAt: Date.now(),
    subscriptionType: 'contact.creation',
    attemptNumber: 0,
    objectId: 101,
    changeSource: 'CRM_UI',
    ...overrides,
  };
}

/**
 * The body and headers HubSpot would send for these events to `url` (the full public URL of the app's endpoint),
 * signed with the app's client secret.
 */
export function signedHubSpotWebhook(url: string, events: WebhookEvent[], secret: string, options: { method?: string; timestampMs?: number } = {}): { rawBody: string; headers: Record<string, string> } {
  const rawBody = JSON.stringify(events);
  const timestamp = String(options.timestampMs ?? Date.now());
  const signature = createHmac('sha256', secret).update(`${options.method ?? 'POST'}${url}${rawBody}${timestamp}`).digest('base64');
  return { rawBody, headers: { 'x-hubspot-signature-v3': signature, 'x-hubspot-request-timestamp': timestamp } };
}
