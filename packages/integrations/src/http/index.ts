import { z } from 'zod';
import { BaseController } from '@mariachi/api-facade';

const provider = z.object({ provider: z.string().regex(/^[a-z][a-z0-9-]{0,63}$/) });

/**
 * Ready-made endpoints for an end user's connections, under `/connections`. It calls the procedures from
 * `registerConnectionProcedures`, which must be registered on the same communication layer. Every route acts for
 * the signed-in user.
 *
 * | Route | Does |
 * | --- | --- |
 * | `GET /connections` | the caller's connections (never a token) |
 * | `POST /connections/:provider/authorize` | `{ url }`: send the browser there |
 * | `POST /connections/:provider/callback` | `{ code, state }` from the provider's redirect: stores the connection |
 * | `DELETE /connections/:id` | disconnects: revokes at the provider, deletes the tokens |
 *
 * The provider redirects the browser to the app's own page (the `redirectUri`), and that page posts `code` and
 * `state` here as the signed-in user, so the callback is checked against who is signed in whether the app
 * authenticates with a bearer token or a cookie. Responses that carry a `state` or describe a connection are
 * `Cache-Control: no-store`.
 */
export class ConnectionsController extends BaseController {
  readonly prefix: string = 'connections';
  override readonly tags = ['connections'];

  init(): void {
    this.get('', (ctx) => {
      ctx.responseHeaders['cache-control'] = 'no-store';
      return this.call(ctx, 'integrations.connections.list', {});
    });
    this.post(':provider/authorize', { schema: { params: provider } }, (ctx, _body, params) => {
      ctx.responseHeaders['cache-control'] = 'no-store';
      return this.call(ctx, 'integrations.connections.authorize', { provider: params.provider });
    });
    this.post(
      ':provider/callback',
      { schema: { params: provider, body: z.object({ code: z.string().min(1).max(4096), state: z.string().min(1).max(200) }).strict() } },
      (ctx, body, params) => {
        ctx.responseHeaders['cache-control'] = 'no-store';
        return this.call(ctx, 'integrations.connections.complete', { provider: params.provider, code: body.code, state: body.state });
      },
    );
    this.delete(':id', { schema: { params: z.object({ id: z.string().uuid() }) } }, (ctx, _body, params) =>
      this.call(ctx, 'integrations.connections.revoke', { connectionId: params.id }),
    );
  }
}
