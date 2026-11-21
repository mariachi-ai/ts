/**
 * The page tag's identifiers, read from the request's cookies, for the events the server sends about the same visitor.
 *
 * - `clientId`, from `_ga` (`GA1.1.1234567890.1712345678`): the browser, `1234567890.1712345678`. Required by
 *   `events.send`.
 * - `sessionId`, from `_ga_<measurement ID without G->`: the visit, sent as the cookie's whole value, which the
 *   Measurement Protocol accepts. Google needs it for the events to count in sessions and Realtime.
 *
 * Both are missing until the visitor grants `analytics_storage`: the tag sets no cookies before that. Then send no
 * events for them, rather than inventing an id.
 *
 * Pass the request's cookies (`ctx.request.cookies` in a route) or a raw `Cookie` header. The cookies' format is
 * Google's, not a documented interface: `gtag('get', '<measurement ID>', 'client_id', callback)` in the browser is
 * the documented way to read the client ID, if a page posts it to the app instead.
 */
export function gaCookies(cookies: string | Readonly<Record<string, string | undefined>> | null | undefined, measurementId?: string): { clientId?: string; sessionId?: string } {
  const jar = typeof cookies === 'string' ? parseCookieHeader(cookies) : (cookies ?? {});
  const ga = jar._ga?.trim();
  // GA1.<domain depth>.<random>.<first visit>: the client ID is the last two, the format Google recommends sending
  const clientId = ga ? (/^GA\d+\.\d+\.(\d+\.\d+)$/.exec(ga)?.[1] ?? ga) : undefined;
  const session = measurementId?.startsWith('G-') ? jar[`_ga_${measurementId.slice(2)}`]?.trim() : undefined;
  return { ...(clientId ? { clientId } : {}), ...(session ? { sessionId: session } : {}) };
}

function parseCookieHeader(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const name = part.slice(0, eq).trim();
    let value = part.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (!name || name in out) continue;
    try {
      out[name] = decodeURIComponent(value);
    } catch {
      out[name] = value;
    }
  }
  return out;
}
