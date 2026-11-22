import { type Context, fromZodError } from '@mariachi/core';
import { type FailureInfo, type ProviderDeps, type ProviderRequest, mappedFailure, providerRequest } from '@mariachi/integrations';
import { z } from 'zod';
import { TypeformError } from './errors';
import { type TypeformConfig, type TypeformOperation, configSchema, errorMap, provider } from './generated';
import {
  Form,
  FormIdInput,
  FormPage,
  type FormResponse,
  ListFormsInput,
  ListResponsesInput,
  PutWebhookInput,
  ResponsePage,
  Webhook,
  WebhookList,
  WebhookTagInput,
} from './schemas';

export interface TypeformDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

/**
 * The Typeform client: each operation takes `ctx` first, checks its input and Typeform's answer, and makes one
 * span (`typeform forms.list`). Build it once at startup and share it.
 *
 * ```ts
 * const typeform = createTypeform(settingsFromEnv(settings, readEnv), { tracer, metrics });
 * const page = await typeform.responses.list(ctx, { formId, since });
 * ```
 */
export function createTypeform(config: TypeformConfig, deps: TypeformDeps = {}) {
  const cfg = configSchema.parse(config);
  const base = (cfg.apiBaseUrl ?? provider.baseUrl).replace(/\/+$/, '');
  const server = new URL(base).host;

  function call<T>(ctx: Context, operation: TypeformOperation, request: Omit<ProviderRequest, 'url' | 'headers'> & { path: string }, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
    const { path, ...rest } = request;
    return providerRequest(
      ctx,
      { integration: provider.id, operation, category: provider.category, server },
      { ...rest, url: `${base}${path}`, headers: { authorization: `Bearer ${cfg.token}` } },
      { schema, error: TypeformError, failure, deps },
    );
  }

  const forms = {
    /** The account's forms, a page at a time (`page` from 1, `pageSize` up to 200). */
    async list(ctx: Context, input: z.input<typeof ListFormsInput> = {}) {
      const i = parse(ListFormsInput, input);
      return call(ctx, 'forms.list', { method: 'GET', path: '/forms', query: { search: i.search, page: i.page, page_size: i.pageSize } }, FormPage);
    },
    /** One form, with its fields (each with its `ref`) and hidden fields. */
    async get(ctx: Context, input: FormIdInput) {
      const { formId } = parse(FormIdInput, input);
      return call(ctx, 'forms.get', { method: 'GET', path: `/forms/${segment(formId)}` }, Form);
    },
  };

  const responses = {
    /** One page of a form's responses, newest first. */
    async list(ctx: Context, input: z.input<typeof ListResponsesInput>) {
      const i = parse(ListResponsesInput, input);
      return call(
        ctx,
        'responses.list',
        {
          method: 'GET',
          path: `/forms/${segment(i.formId)}/responses`,
          query: { page_size: i.pageSize, since: i.since, until: i.until, after: i.after, before: i.before, completed: i.completed },
        },
        ResponsePage,
      );
    },
    /**
     * Every response matching `input`, newest first, fetching pages as they're read. Stop early with `break`. To
     * catch up after a gap in webhooks, pass `since` as the last time one arrived.
     */
    async *all(ctx: Context, input: z.input<typeof ListResponsesInput>): AsyncGenerator<FormResponse> {
      let before = input.before;
      for (;;) {
        const page = await responses.list(ctx, { ...input, pageSize: input.pageSize ?? 1000, before });
        yield* page.items;
        const last = page.items.at(-1);
        if (!last || page.items.length < (input.pageSize ?? 1000)) return;
        before = last.token;
      }
    },
  };

  const webhooks = {
    /**
     * Creates or updates the form's webhook with this tag, signed with the `webhookSecret` setting, so
     * `receiveTypeformWebhook` can check what arrives. Safe to run at every deploy.
     */
    async put(ctx: Context, input: PutWebhookInput) {
      const i = parse(PutWebhookInput, input);
      if (!cfg.webhookSecret) throw new TypeformError('typeform/no-webhook-secret', 'Set the webhook secret (TYPEFORM_WEBHOOK_SECRET) before making a webhook', { category: 'invalid-request' });
      return call(ctx, 'webhooks.put', { method: 'PUT', path: `/forms/${segment(i.formId)}/webhooks/${segment(i.tag)}`, json: { url: i.url, enabled: i.enabled, secret: cfg.webhookSecret, verify_ssl: true } }, Webhook);
    },
    /** The form's webhooks, without their signing secrets. */
    async list(ctx: Context, input: FormIdInput) {
      const { formId } = parse(FormIdInput, input);
      return call(ctx, 'webhooks.list', { method: 'GET', path: `/forms/${segment(formId)}/webhooks` }, WebhookList).then((r) => r.items);
    },
    async delete(ctx: Context, input: WebhookTagInput) {
      const { formId, tag } = parse(WebhookTagInput, input);
      return call(ctx, 'webhooks.delete', { method: 'DELETE', path: `/forms/${segment(formId)}/webhooks/${segment(tag)}` }, z.unknown()).then(() => undefined);
    },
  };

  return { forms, responses, webhooks };
}

export type Typeform = ReturnType<typeof createTypeform>;

/** Typeform's error body is `{ code, description }`: the code is kept, the description isn't (it can echo input). */
function failure(_status: number, body: unknown): FailureInfo | undefined {
  const code = typeof body === 'object' && body !== null && typeof (body as { code?: unknown }).code === 'string' ? (body as { code: string }).code : undefined;
  const mapped = mappedFailure(errorMap, code);
  return { providerCode: code, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Typeform input');
  return parsed.data;
}

function segment(value: string): string {
  return encodeURIComponent(value);
}
