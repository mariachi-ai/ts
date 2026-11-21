import { type Context, fromZodError } from '@mariachi/core';
import type { z } from 'zod';
import { PipedriveError } from './errors';
import {
  AddNoteInput,
  type CreateDealInput,
  type CreateNoteInput,
  type CreateOrganizationInput,
  type CreatePersonInput,
  type Deal,
  type ListStagesInput,
  type Note,
  type Organization,
  type OrganizationHit,
  type Person,
  type PersonHit,
  SharedCreateDealInput,
  type Stage,
  type UpdatePersonInput,
  UpsertContactInput,
} from './schemas';

/** The operations the shared helpers are made of: the client's, or the fake's. */
export interface CrmOperations {
  persons: {
    create(ctx: Context, input: CreatePersonInput): Promise<Person>;
    get(ctx: Context, id: number): Promise<Person>;
    update(ctx: Context, input: UpdatePersonInput): Promise<Person>;
    findByEmail(ctx: Context, email: string): Promise<PersonHit | undefined>;
  };
  organizations: {
    create(ctx: Context, input: CreateOrganizationInput): Promise<Organization>;
    findByName(ctx: Context, name: string): Promise<OrganizationHit | undefined>;
  };
  deals: { create(ctx: Context, input: CreateDealInput): Promise<Deal> };
  stages: { all(ctx: Context, input?: Omit<ListStagesInput, 'cursor'>): AsyncGenerator<Stage> };
  notes: { create(ctx: Context, input: CreateNoteInput): Promise<Note> };
}

/**
 * The same three helpers, with the same names and shapes, in every CRM integration: a contact (a Pipedrive
 * person), a deal, and a note. Ids are Pipedrive's numbers as strings.
 */
export function crmHelpers(api: CrmOperations) {
  async function organizationIdFor(ctx: Context, name: string): Promise<number> {
    const found = await api.organizations.findByName(ctx, name);
    return found ? found.id : (await api.organizations.create(ctx, { name: name.trim() })).id;
  }

  /** A stage's id from its id or its name; by name, the pipeline it's in too. */
  async function resolveStage(ctx: Context, stage: string): Promise<{ stageId: number; pipelineId?: number }> {
    if (/^\d+$/.test(stage)) return { stageId: Number(stage) };
    const wanted = stage.trim().toLowerCase();
    const matches: Stage[] = [];
    for await (const s of api.stages.all(ctx)) if (!s.is_deleted && s.name.trim().toLowerCase() === wanted) matches.push(s);
    if (matches.length === 0) throw new PipedriveError('pipedrive/unknown-stage', 'No Pipedrive stage has that name', { category: 'invalid-request' });
    if (matches.length > 1) {
      throw new PipedriveError('pipedrive/ambiguous-stage', 'More than one Pipedrive pipeline has a stage with that name: pass the stage id', {
        category: 'invalid-request',
        details: { pipelineIds: matches.map((m) => m.pipeline_id) },
      });
    }
    return { stageId: matches[0]!.id, pipelineId: matches[0]!.pipeline_id };
  }

  return {
    /**
     * Finds the person with this email address (an exact search, not case-sensitive) and changes the fields
     * given, or adds them. `company` is an organization's name: the one with exactly that name, or a new one.
     * A new person's name is `firstName lastName`, or the email address when neither is given; an existing
     * person's name changes only when both are given. A new phone becomes the primary one and keeps the others.
     * `properties` are Pipedrive field codes: a 40-character code is a custom field (see `fieldsBody`).
     * Pipedrive has no unique email, so two upserts of the same new address at the same moment can both add a
     * person.
     */
    async upsertContactByEmail(ctx: Context, input: UpsertContactInput): Promise<{ id: string; created: boolean }> {
      const i = parse(UpsertContactInput, input);
      const name = [i.firstName, i.lastName].filter(Boolean).join(' ');
      const existing = await api.persons.findByEmail(ctx, i.email);
      const orgId = i.company ? await organizationIdFor(ctx, i.company) : undefined;
      if (!existing) {
        const person = await api.persons.create(ctx, {
          name: name || i.email,
          emails: [{ value: i.email, primary: true }],
          phones: i.phone ? [{ value: i.phone, primary: true }] : undefined,
          orgId,
          fields: i.properties,
        });
        return { id: String(person.id), created: true };
      }
      const change: Omit<UpdatePersonInput, 'id'> = {};
      // Only a whole name replaces the one Pipedrive has (it keeps one name, so half of one can't be merged in),
      // except the address an earlier upsert named the person after
      if (name && ((i.firstName && i.lastName) || existing.name.toLowerCase() === i.email.toLowerCase())) change.name = name;
      if (orgId !== undefined) change.orgId = orgId;
      if (i.properties && Object.keys(i.properties).length) change.fields = i.properties;
      if (i.phone && !existing.phones.includes(i.phone)) {
        // Phones are replaced as a list: keep the others, with their labels
        const current = await api.persons.get(ctx, existing.id);
        const others = current.phones.filter((p) => p.value !== i.phone).map((p) => ({ value: p.value, primary: false, ...(p.label ? { label: p.label } : {}) }));
        change.phones = [{ value: i.phone, primary: true }, ...others];
      }
      if (Object.keys(change).length) await api.persons.update(ctx, { id: existing.id, ...change });
      return { id: String(existing.id), created: false };
    },

    /**
     * Adds a deal: `name` is its title, `amount` its value. `stage` is a stage's id, or its name, looked up in
     * every pipeline (not case-sensitive); a name two pipelines share fails with `pipedrive/ambiguous-stage`.
     * Without a stage, the deal goes to the default pipeline's first stage. `contactId` is a person's id,
     * `companyId` an organization's.
     */
    async createDeal(ctx: Context, input: SharedCreateDealInput): Promise<{ id: string }> {
      const i = parse(SharedCreateDealInput, input);
      const stage = i.stage ? await resolveStage(ctx, i.stage) : undefined;
      const deal = await api.deals.create(ctx, {
        title: i.name,
        value: i.amount,
        currency: i.currency,
        stageId: stage?.stageId,
        pipelineId: stage?.pipelineId,
        personId: i.contactId ? Number(i.contactId) : undefined,
        orgId: i.companyId ? Number(i.companyId) : undefined,
        fields: i.properties,
      });
      return { id: String(deal.id) };
    },

    /**
     * Adds a note to a person (`contactId`), a deal (`dealId`) or an organization (`companyId`); one note can
     * belong to all three. `body` is HTML, which Pipedrive sanitizes: for plain text, pass `noteHtml(text)`.
     */
    async addNote(ctx: Context, input: AddNoteInput): Promise<{ id: string }> {
      const i = parse(AddNoteInput, input);
      const note = await api.notes.create(ctx, {
        content: i.body,
        personId: i.contactId ? Number(i.contactId) : undefined,
        dealId: i.dealId ? Number(i.dealId) : undefined,
        orgId: i.companyId ? Number(i.companyId) : undefined,
      });
      return { id: String(note.id) };
    },
  };
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Pipedrive input');
  return parsed.data;
}
