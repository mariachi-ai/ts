import { z } from 'zod';

/**
 * Typeform's shapes, as far as an app reads them. Unknown fields pass through (`passthrough`), so a field
 * Typeform adds doesn't fail the boundary; a field the app relies on that goes missing does.
 */

export const FormSummary = z
  .object({
    id: z.string(),
    title: z.string(),
    last_updated_at: z.string().optional(),
    _links: z.object({ display: z.string().url() }).passthrough().optional(),
  })
  .passthrough();
export type FormSummary = z.infer<typeof FormSummary>;

export const FormPage = z.object({ total_items: z.number(), page_count: z.number(), items: z.array(FormSummary) }).passthrough();
export type FormPage = z.infer<typeof FormPage>;

export const Field = z
  .object({
    id: z.string(),
    /** The field's stable name: set it in the form builder, and read answers by it (`answersByRef`). */
    ref: z.string(),
    title: z.string(),
    type: z.string(),
  })
  .passthrough();
export type Field = z.infer<typeof Field>;

export const Form = z
  .object({
    id: z.string(),
    title: z.string(),
    fields: z.array(Field).default([]),
    /** The names of the form's hidden fields: values the app passes in its link, such as the user's id. */
    hidden: z.array(z.string()).default([]),
    _links: z.object({ display: z.string().url() }).passthrough().optional(),
  })
  .passthrough();
export type Form = z.infer<typeof Form>;

export const Answer = z
  .object({
    field: z.object({ id: z.string(), type: z.string(), ref: z.string() }).passthrough(),
    type: z.string(),
    text: z.string().optional(),
    email: z.string().optional(),
    phone_number: z.string().optional(),
    url: z.string().optional(),
    file_url: z.string().optional(),
    date: z.string().optional(),
    number: z.number().optional(),
    boolean: z.boolean().optional(),
    choice: z.object({ label: z.string().optional(), other: z.string().optional() }).passthrough().optional(),
    choices: z.object({ labels: z.array(z.string()).optional(), other: z.string().optional() }).passthrough().optional(),
  })
  .passthrough();
export type Answer = z.infer<typeof Answer>;

export const FormResponse = z
  .object({
    /** The response's id, the same in the API and in the webhook. Dedupe by it. */
    token: z.string(),
    landed_at: z.string(),
    submitted_at: z.string(),
    hidden: z.record(z.string()).optional(),
    answers: z.array(Answer).default([]),
  })
  .passthrough();
export type FormResponse = z.infer<typeof FormResponse>;

export const ResponsePage = z.object({ total_items: z.number(), page_count: z.number(), items: z.array(FormResponse) }).passthrough();
export type ResponsePage = z.infer<typeof ResponsePage>;

export const Webhook = z
  .object({
    id: z.string(),
    form_id: z.string(),
    tag: z.string(),
    url: z.string().url(),
    enabled: z.boolean(),
    verify_ssl: z.boolean().optional(),
  })
  .passthrough()
  // Typeform sends the webhook's signing secret back: it never reaches app code, where it would be easy to log
  .transform(({ secret: _secret, ...webhook }: { secret?: unknown } & Record<string, unknown>) => webhook as Omit<typeof webhook, 'secret'>);

/** A form, named by its id. */
export const FormIdInput = z.object({ formId: z.string().min(1) });
export type FormIdInput = z.input<typeof FormIdInput>;

/** One of a form's webhooks, named by its tag. */
export const WebhookTagInput = FormIdInput.extend({ tag: z.string().min(1) });
export type WebhookTagInput = z.input<typeof WebhookTagInput>;
export type Webhook = z.infer<typeof Webhook>;

export const WebhookList = z.object({ items: z.array(Webhook) }).passthrough();

/** What Typeform posts when a form is submitted. */
export const FormResponseEvent = z
  .object({
    event_id: z.string(),
    event_type: z.literal('form_response'),
    form_response: FormResponse.extend({ form_id: z.string() }),
  })
  .passthrough();
export type FormResponseEvent = z.infer<typeof FormResponseEvent>;

export const ListFormsInput = z.object({
  search: z.string().optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(200).optional(),
});
export type ListFormsInput = z.infer<typeof ListFormsInput>;

export const ListResponsesInput = z.object({
  formId: z.string().min(1),
  /** At most 1000. */
  pageSize: z.number().int().min(1).max(1000).optional(),
  /** ISO time: responses submitted at or after it. */
  since: z.string().optional(),
  until: z.string().optional(),
  /** A response's token: the page after it. */
  after: z.string().optional(),
  before: z.string().optional(),
  /** Only finished responses (the default), or only abandoned ones. */
  completed: z.boolean().optional(),
});
export type ListResponsesInput = z.infer<typeof ListResponsesInput>;

export const PutWebhookInput = z.object({
  formId: z.string().min(1),
  /** The webhook's name in Typeform: one per tag per form. */
  tag: z.string().regex(/^[a-z0-9-]+$/),
  url: z.string().url(),
  enabled: z.boolean().default(true),
});
export type PutWebhookInput = z.input<typeof PutWebhookInput>;
