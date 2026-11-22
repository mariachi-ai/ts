import { createHmac } from 'node:crypto';
import { type Html, html, safeHref } from '@mariachi/api-facade';
import { type Context, fromZodError } from '@mariachi/core';
import type { z } from 'zod';
import { TawkToError, notSupported } from './errors';
import { type TawkToConfig, configSchema } from './generated';
import { type ChatIdentity, ChatUser, TAWK_ID, TrackEventInput, UpsertContactInput } from './schemas';
import { TAWK_TO_SCRIPT_PATH } from './widget';

export interface WidgetSnippetOptions {
  /** The signed-in user, from `chatIdentity`. Left out, the visitor chats anonymously. */
  identity?: ChatIdentity;
  /** Where the loader is served; `/assets/lib/tawk-to.js` by default. */
  src?: string;
}

/**
 * Tawk.to for an app: the widget for its pages, and who is signed in to it. Build it once at startup.
 *
 * ```ts
 * const tawk = createTawkTo(settingsFromEnv(settings, readEnv));
 * const identity = await tawk.chatIdentity({ id: user.id, email: user.email, name: user.name });
 * html`<body>…${tawk.widgetSnippet({ identity })}</body>`
 * ```
 *
 * Tawk.to publishes no server API: the widget, sign-in and events all run in the browser. `upsertContact` and
 * `trackEvent` are here so code written for any chat provider fits, and fail with `tawk-to/not-supported`.
 */
export function createTawkTo(config: TawkToConfig) {
  const cfg = configSchema.parse(config);
  const propertyId = checkedId(cfg.propertyId, 'property ID (TAWKTO_PROPERTY_ID)', 'Administration › Overview');
  const widgetId = checkedId(cfg.widgetId, 'widget ID (TAWKTO_WIDGET_ID)', 'Administration › Chat Widget');

  return {
    /**
     * The user, signed for Tawk.to's Secure Mode: `hash` is the hex HMAC-SHA256 of the user's id, keyed with the
     * property's JavaScript API key (`TAWKTO_API_KEY`). The widget then signs them in with `Tawk_API.login`, restoring
     * their earlier conversations. Make it on the server, per request; never send the key to a page.
     *
     * `company` and `createdAt` become the custom attributes `company-id`, `company-name` and `created-at`.
     */
    async chatIdentity(user: ChatUser): Promise<ChatIdentity> {
      const u = parse(ChatUser, user);
      if (!cfg.apiKey) {
        throw new TawkToError('tawk-to/no-api-key', 'Set the JavaScript API key (TAWKTO_API_KEY) to sign a user in to the widget: Administration › Overview › JavaScript API › Secure Mode', { category: 'invalid-request' });
      }
      const attributes: Record<string, string> = {};
      if (u.company) {
        attributes['company-id'] = u.company.id;
        if (u.company.name) attributes['company-name'] = u.company.name;
      }
      if (u.createdAt) attributes['created-at'] = u.createdAt.toISOString();
      return {
        provider: 'tawk-to',
        userId: u.id,
        hash: createHmac('sha256', cfg.apiKey).update(u.id).digest('hex'),
        ...(u.name ? { name: u.name } : {}),
        ...(u.email ? { email: u.email } : {}),
        attributes,
      };
    },

    /**
     * The widget for a page: one `<script>` that loads the loader this package ships (a Mariachi page runs no inline
     * script), which loads Tawk.to's widget and, given `identity`, signs the user in. Put it at the end of the layout's
     * `<body>`, serve the loader, and send the page with `tawkToCsp()`:
     *
     * ```ts
     * api.withStaticFile('/assets/lib/tawk-to.js', packageFile('@mariachi/integration-tawk-to/tawk-to.js'));
     * htmlResponse(page, { csp: tawkToCsp() });
     * ```
     *
     * The widget sets cookies (`tawk_uuid_*`, `TawkConnectionTime`): where the visitor must consent first, render the
     * snippet only once they have.
     */
    widgetSnippet(options: WidgetSnippetOptions = {}): Html {
      const id = options.identity;
      // Values reach the loader as data- attributes, escaped by `html`, never as script
      const signedIn = id
        ? [
            html` data-user-id="${id.userId}" data-hash="${id.hash}"`,
            id.name ? html` data-name="${id.name}"` : null,
            id.email ? html` data-email="${id.email}"` : null,
            Object.keys(id.attributes).length ? html` data-attributes="${JSON.stringify(id.attributes)}"` : null,
          ]
        : null;
      return html`<script src="${safeHref(options.src ?? TAWK_TO_SCRIPT_PATH)}" data-property-id="${propertyId}" data-widget-id="${widgetId}"${signedIn}></script>`;
    },

    /**
     * Not supported: Tawk.to has no server API for contacts. A contact is made when the widget signs the user in, with
     * the name, email and attributes from `chatIdentity`. Fails with `tawk-to/not-supported`.
     */
    async upsertContact(_ctx: Context, input: UpsertContactInput): Promise<{ id: string; created: boolean }> {
      parse(UpsertContactInput, input);
      throw notSupported('contacts', 'the widget makes the contact when it signs the user in (chatIdentity and widgetSnippet)');
    },

    /**
     * Not supported: Tawk.to records events only from the page, through the widget. Call
     * `window.tawkTo.addEvent(name, metadata)` from one of the page's scripts. Fails with `tawk-to/not-supported`.
     */
    async trackEvent(_ctx: Context, input: TrackEventInput): Promise<void> {
      parse(TrackEventInput, input);
      throw notSupported('events', 'call window.tawkTo.addEvent(name, metadata) from a script on the page');
    },
  };
}

export type TawkTo = ReturnType<typeof createTawkTo>;

function checkedId(value: string, what: string, where: string): string {
  if (!TAWK_ID.test(value)) {
    throw new TawkToError('tawk-to/invalid-setting', `The ${what} is letters and digits: ${where}`, { category: 'invalid-request' });
  }
  return value;
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Tawk.to input');
  return parsed.data;
}
