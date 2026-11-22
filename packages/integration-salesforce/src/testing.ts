/**
 * `@mariachi/integration-salesforce/testing`: a Salesforce org for an app's tests, held in memory, with the same
 * shape as `createSalesforce`'s client; and a flow's webhook call to post to the app's endpoint.
 */
import type { Context } from '@mariachi/core';
import { ValidationError } from '@mariachi/core';
import type { Salesforce } from './client';
import { DEFAULT_CLOSE_DAYS, localPart, noteTitle } from './client';
import { SalesforceError } from './errors';
import type { CompositeRequest, CompositeSubresponse, Fields, QueryPage, SObjectRecord } from './schemas';
import { isSoqlQuery } from './soql';
import { SALESFORCE_WEBHOOK_SECRET_HEADER, type SalesforceFlowEvent } from './webhooks';

type Row = Record<string, unknown> & { Id: string };

export interface FakeSalesforce extends Salesforce {
  /** Every record, by object (`Contact`) and id. Seed it, or read it after the code under test ran. */
  records_: Map<string, Map<string, Row>>;
  /** The notes `addNote` made, with the records each is linked to. */
  notes_: Array<{ id: string; title: string; body: string; linkedTo: string[] }>;
}

const PREFIX: Record<string, string> = { Account: '001', Contact: '003', Opportunity: '006', Lead: '00Q', OpportunityContactRole: '00K', ContentNote: '069', ContentDocumentLink: '06A' };

/**
 * An in-memory Salesforce: seed records, then hand it to the code under test in place of the client. Its queries
 * understand `SELECT … FROM <Object> [WHERE <Field> = <value>] [ORDER BY …] [LIMIT n]` and nothing more; anything
 * else fails, so a test never passes on a query the fake only pretended to run. Stages for `createDeal` default to
 * `['Prospecting']`.
 */
export function fakeSalesforce(seed: { records?: Record<string, Array<Record<string, unknown>>>; stages?: string[] } = {}): FakeSalesforce {
  const records_ = new Map<string, Map<string, Row>>();
  const notes_: FakeSalesforce['notes_'] = [];
  let counter = 0;
  const table = (name: string) => {
    const existing = records_.get(name);
    if (existing) return existing;
    const created = new Map<string, Row>();
    records_.set(name, created);
    return created;
  };
  const newId = (name: string) => `${PREFIX[name] ?? 'a00'}${String(++counter).padStart(12, '0')}AAA`;
  const insert = (name: string, fields: Record<string, unknown>): string => {
    const Id = typeof fields.Id === 'string' ? fields.Id : newId(name);
    table(name).set(Id, { CreatedDate: new Date(Date.UTC(2026, 0, 1, 0, 0, counter)).toISOString(), ...fields, Id });
    return Id;
  };
  for (const [name, rows] of Object.entries(seed.records ?? {})) for (const row of rows) insert(name, row);
  const rowOf = (name: string, id: string): Row => {
    const row = table(name).get(id);
    if (!row) throw new SalesforceError('salesforce/not-found', `salesforce ${name} not found`, { category: 'not-found', providerCode: 'NOT_FOUND', status: 404 });
    return row;
  };
  const asRecord = (name: string, row: Row): SObjectRecord => ({ attributes: { type: name }, ...row });

  const sobject = (name: string) => ({
    async create(_ctx: Context, fields: Record<string, unknown>) {
      return { id: insert(name, fields), success: true };
    },
    async get(_ctx: Context, input: { id: string; fields?: string[] }) {
      const row = rowOf(name, input.id);
      return asRecord(name, input.fields ? ({ Id: row.Id, ...Object.fromEntries(input.fields.map((f) => [f, row[f] ?? null])) } as Row) : row);
    },
    async update(_ctx: Context, input: { id: string; fields: Fields }) {
      Object.assign(rowOf(name, input.id), input.fields);
    },
    async delete(_ctx: Context, input: { id: string }) {
      rowOf(name, input.id);
      table(name).delete(input.id);
    },
    async upsert(_ctx: Context, input: { externalIdField: string; externalId: string; fields: Fields }) {
      const matches = [...table(name).values()].filter((r) => r[input.externalIdField] === input.externalId);
      if (matches.length > 1) throw new SalesforceError('salesforce/multiple-matches', 'salesforce upsert matched several records', { category: 'conflict', status: 300 });
      if (matches[0]) {
        Object.assign(matches[0], input.fields);
        return { id: matches[0].Id, success: true, created: false };
      }
      return { id: insert(name, { ...input.fields, [input.externalIdField]: input.externalId }), success: true, created: true };
    },
  });

  function run(q: unknown): Row[] & { object: string } {
    if (!isSoqlQuery(q)) throw new ValidationError('Build the query with soql`…`, which escapes its values');
    const m = /^SELECT\s+.+?\s+FROM\s+(\w+)(?:\s+WHERE\s+(\w+)\s*=\s*('(?:[^'\\]|\\.)*'|true|false|null|-?\d+(?:\.\d+)?))?(?:\s+ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?)?(?:\s+LIMIT\s+(\d+))?$/is.exec(q.soql.trim());
    if (!m) throw new SalesforceError('salesforce/fake-unsupported-query', 'fakeSalesforce runs only SELECT … FROM … [WHERE Field = value] [ORDER BY Field] [LIMIT n]', { category: 'invalid-request' });
    const [, object, field, literal, orderBy, direction, limit] = m;
    const wanted = literal === undefined ? undefined : literalValue(literal);
    let rows = [...table(object!).values()].filter((r) => field === undefined || same(r[field], wanted));
    if (orderBy) rows = rows.sort((a, b) => String(a[orderBy] ?? '').localeCompare(String(b[orderBy] ?? '')) * (direction?.toUpperCase() === 'DESC' ? -1 : 1));
    if (limit) rows = rows.slice(0, Number(limit));
    return Object.assign(rows, { object: object! });
  }

  const stages = seed.stages ?? ['Prospecting'];
  const contacts = sobject('Contact');
  const accounts = sobject('Account');
  const opportunities = sobject('Opportunity');
  const leads = sobject('Lead');

  const accountByName = (name: string) => [...table('Account').values()].find((a) => same(a.Name, name))?.Id ?? insert('Account', { Name: name });

  const fake = {
    records_,
    notes_,
    contacts,
    accounts,
    opportunities,
    leads,
    soql: {
      async query(_ctx: Context, q: unknown): Promise<QueryPage> {
        const rows = run(q);
        return { totalSize: rows.length, done: true, records: rows.map((r) => asRecord(rows.object, r)) };
      },
      async queryMore(): Promise<QueryPage> {
        throw new ValidationError('fakeSalesforce answers every query in one page');
      },
      async *all(_ctx: Context, q: unknown) {
        const rows = run(q);
        yield* rows.map((r) => asRecord(rows.object, r));
      },
    },
    async composite(_ctx: Context, requests: CompositeRequest[]): Promise<CompositeSubresponse[]> {
      const snapshot = new Map([...records_].map(([k, t]) => [k, new Map([...t].map(([id, r]) => [id, { ...r }]))]));
      const ids: Record<string, string> = {};
      const fill = (v: unknown): unknown => (typeof v === 'string' ? v.replace(/@\{(\w+)\.id\}/g, (_, ref: string) => ids[ref] ?? '') : v);
      const out: CompositeSubresponse[] = [];
      try {
        for (const r of requests) {
          const [, object, id] = /^sobjects\/(\w+)(?:\/(.+))?$/.exec(fill(r.path) as string) ?? [];
          if (!object) throw new SalesforceError('salesforce/fake-unsupported-request', 'fakeSalesforce composite runs only sobjects/<Object>[/<id>]', { category: 'invalid-request' });
          const body = Object.fromEntries(Object.entries(r.body ?? {}).map(([k, v]) => [k, fill(v)]));
          if (r.method === 'POST') ids[r.referenceId] = insert(object, body);
          else if (r.method === 'PATCH') Object.assign(rowOf(object, id!), body);
          else if (r.method === 'DELETE') table(object).delete(rowOf(object, id!).Id);
          out.push({ referenceId: r.referenceId, httpStatusCode: r.method === 'POST' ? 201 : 204, body: r.method === 'POST' ? { id: ids[r.referenceId], success: true } : null });
        }
      } catch (error) {
        records_.clear();
        for (const [k, t] of snapshot) records_.set(k, t);
        throw error;
      }
      return out;
    },
    async upsertContactByEmail(_ctx: Context, input: Parameters<Salesforce['upsertContactByEmail']>[1]) {
      const named = Object.fromEntries(Object.entries({ FirstName: input.firstName, LastName: input.lastName, Phone: input.phone }).filter(([, v]) => v !== undefined));
      const existing = [...table('Contact').values()].find((c) => same(c.Email, input.email));
      if (existing) {
        Object.assign(existing, input.properties, named);
        if (input.company && !existing.AccountId) existing.AccountId = accountByName(input.company);
        return { id: existing.Id, created: false };
      }
      const AccountId = input.company ? accountByName(input.company) : undefined;
      const id = insert('Contact', { LastName: localPart(input.email), ...input.properties, ...named, Email: input.email, ...(AccountId ? { AccountId } : {}) });
      return { id, created: true };
    },
    async createDeal(_ctx: Context, input: Parameters<Salesforce['createDeal']>[1]) {
      const StageName = input.stage ?? input.properties?.StageName ?? stages[0];
      if (!StageName) throw new SalesforceError('salesforce/no-open-stage', 'The org has no active open opportunity stage: pass stage', { category: 'invalid-request' });
      const CloseDate = new Date(Date.now() + DEFAULT_CLOSE_DAYS * 86_400_000).toISOString().slice(0, 10);
      const extra = Object.fromEntries(Object.entries({ Amount: input.amount, CurrencyIsoCode: input.currency, AccountId: input.companyId }).filter(([, v]) => v !== undefined));
      if (input.companyId) rowOf('Account', input.companyId);
      if (input.contactId) rowOf('Contact', input.contactId);
      const id = insert('Opportunity', { CloseDate, ...input.properties, Name: input.name, StageName, ...extra });
      if (input.contactId) insert('OpportunityContactRole', { OpportunityId: id, ContactId: input.contactId, IsPrimary: true });
      return { id };
    },
    async addNote(_ctx: Context, input: Parameters<Salesforce['addNote']>[1]) {
      const linkedTo = [input.contactId, input.dealId, input.companyId].filter((v): v is string => Boolean(v));
      const id = insert('ContentNote', { Title: noteTitle(input.body) });
      notes_.push({ id, title: noteTitle(input.body), body: input.body, linkedTo });
      return { id };
    },
  };
  return fake as unknown as FakeSalesforce;
}

function literalValue(literal: string): unknown {
  if (literal.startsWith("'")) return literal.slice(1, -1).replace(/\\(.)/g, (_, c: string) => ({ n: '\n', r: '\r', t: '\t', b: '\b', f: '\f' })[c] ?? c);
  if (literal === 'true' || literal === 'false') return literal === 'true';
  if (literal === 'null') return null;
  return Number(literal);
}

// The fake compares text without regard to case
function same(a: unknown, b: unknown): boolean {
  if (typeof a === 'string' && typeof b === 'string') return a.toLowerCase() === b.toLowerCase();
  return (a ?? null) === (b ?? null);
}

/** The body and `X-Webhook-Secret` header a flow's HTTP callout would send for this event. */
export function salesforceFlowWebhook(event: SalesforceFlowEvent, secret: string): { rawBody: string; headers: Record<string, string> } {
  return { rawBody: JSON.stringify(event), headers: { [SALESFORCE_WEBHOOK_SECRET_HEADER]: secret } };
}
