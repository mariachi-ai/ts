/**
 * `@mariachi/integration-typeform/testing`: a Typeform for an app's tests, held in memory, with the same shape as
 * `createTypeform`'s client; and a signed webhook to post to the app's endpoint.
 */
import { createHmac } from 'node:crypto';
import type { Typeform } from './client';
import { TypeformError } from './errors';
import type { Form, FormResponse, Webhook } from './schemas';

export interface FakeTypeform extends Typeform {
  forms_: Map<string, Form>;
  responses_: Map<string, FormResponse[]>;
  webhooks_: Map<string, Webhook>;
}

/**
 * An in-memory Typeform: add forms and responses, then hand it to the code under test in place of the client. It
 * fails the way the client does (`TypeformError`, the same codes and categories), so code that handles one handles
 * the other. Give `webhookSecret` as the app's config does: without it, `webhooks.put` refuses, as the client does.
 */
export function fakeTypeform(seed: { forms?: Form[]; responses?: Record<string, FormResponse[]>; webhookSecret?: string } = {}): FakeTypeform {
  const forms_ = new Map((seed.forms ?? []).map((f) => [f.id, f]));
  const responses_ = new Map(Object.entries(seed.responses ?? {}));
  const webhooks_ = new Map<string, Webhook>();
  const formOf = (id: string) => {
    const form = forms_.get(id);
    if (!form) throw new TypeformError('typeform/not-found', 'typeform forms.get failed (404)', { category: 'not-found', status: 404 });
    return form;
  };
  const newestFirst = (id: string) => [...(responses_.get(id) ?? [])].sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
  const fake: FakeTypeform = {
    forms_,
    responses_,
    webhooks_,
    forms: {
      async list(_ctx, input = {}) {
        const items = [...forms_.values()].filter((f) => !input.search || f.title.toLowerCase().includes(input.search.toLowerCase()));
        return { total_items: items.length, page_count: 1, items };
      },
      async get(_ctx, input) {
        return formOf(input.formId);
      },
    },
    responses: {
      async list(_ctx, input) {
        formOf(input.formId);
        let items = newestFirst(input.formId).filter((r) => (!input.since || r.submitted_at >= input.since) && (!input.until || r.submitted_at <= input.until));
        if (input.before) items = items.slice(items.findIndex((r) => r.token === input.before) + 1);
        items = items.slice(0, input.pageSize ?? 25);
        return { total_items: items.length, page_count: 1, items };
      },
      async *all(ctx, input) {
        yield* (await fake.responses.list(ctx, { ...input, pageSize: 1000 })).items;
      },
    },
    webhooks: {
      async put(_ctx, input) {
        if (!seed.webhookSecret) throw new TypeformError('typeform/no-webhook-secret', 'Set the webhook secret (TYPEFORM_WEBHOOK_SECRET) before making a webhook', { category: 'invalid-request' });
        formOf(input.formId);
        const hook: Webhook = { id: `wh_${input.tag}`, form_id: input.formId, tag: input.tag, url: input.url, enabled: input.enabled ?? true };
        webhooks_.set(`${input.formId}/${input.tag}`, hook);
        return hook;
      },
      async list(_ctx, input) {
        return [...webhooks_.values()].filter((w) => w.form_id === input.formId);
      },
      async delete(_ctx, input) {
        webhooks_.delete(`${input.formId}/${input.tag}`);
      },
    },
  };
  return fake;
}

/** A response to seed the fake with, or to post in a test webhook. */
export function typeformResponse(overrides: Partial<FormResponse> = {}): FormResponse {
  return { token: `tok_${Math.random().toString(36).slice(2, 10)}`, landed_at: '2026-11-21T10:00:00Z', submitted_at: '2026-11-21T10:01:00Z', answers: [], ...overrides };
}

/** The body and `Typeform-Signature` header Typeform would send for this response. */
export function signedTypeformWebhook(formId: string, response: FormResponse, secret: string): { rawBody: string; headers: Record<string, string> } {
  const rawBody = JSON.stringify({ event_id: `ev_${response.token}`, event_type: 'form_response', form_response: { form_id: formId, ...response } });
  return { rawBody, headers: { 'typeform-signature': `sha256=${createHmac('sha256', secret).update(rawBody).digest('base64')}` } };
}
