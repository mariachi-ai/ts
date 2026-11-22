import { type Context, fromZodError } from '@mariachi/core';
import {
  type FailureInfo,
  type ProviderDeps,
  type ProviderRequest,
  callProvider,
  categoryForStatus,
  mappedFailure,
  parseRetryAfter,
  providerRequest,
} from '@mariachi/integrations';
import { z } from 'zod';
import { ZoomError } from './errors';
import { type ZoomConfig, type ZoomOperation, configSchema, errorMap, provider } from './generated';
import { meetingPathId } from './helpers';
import {
  CreateMeetingInput,
  DeleteMeetingInput,
  DownloadInput,
  GetMeetingInput,
  HostStartUrl,
  ListMeetingsInput,
  ListParticipantsInput,
  Meeting,
  MeetingIdOrUuid,
  MeetingPage,
  type MeetingSummary,
  type Participant,
  ParticipantPage,
  PastMeeting,
  Recording,
  TokenResponse,
  Transcript,
  UpdateMeetingInput,
  User,
  UserId,
} from './schemas';

export interface ZoomDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

/** A downloaded file: read `body` once (stream it to storage, or `await new Response(body).text()` for a VTT). */
export interface ZoomDownload {
  body: ReadableStream<Uint8Array>;
  contentType?: string;
  /** Bytes, when Zoom says. */
  size?: number;
}

const TOKEN_URL = 'https://zoom.us/oauth/token';
/** A token lasts an hour; a new one is asked for this long before it runs out. */
const TOKEN_MARGIN_MS = 5 * 60_000;

/**
 * The Zoom client, for a Server-to-Server OAuth app: each operation takes `ctx` first, checks its input and
 * Zoom's answer, and makes one span (`zoom meetings.create`). It gets the account's access token itself, keeps it
 * until shortly before its hour is up, and asks again when a call answers 401. Build it once at startup and share
 * it.
 *
 * ```ts
 * const zoom = createZoom(settingsFromEnv(settings, readEnv), { tracer, metrics });
 * const meeting = await zoom.meetings.create(ctx, { userId: host.email, topic, startTime, duration: 30 });
 * booking.callUrl = meeting.join_url;
 * ```
 */
export function createZoom(config: ZoomConfig, deps: ZoomDeps = {}) {
  const cfg = configSchema.parse(config);
  const base = provider.baseUrl;
  const doFetch = deps.fetch ?? fetch;
  const now = deps.now ?? Date.now;
  const basic = Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString('base64');

  // One token for the client, shared by concurrent calls, kept until shortly before it runs out.
  let token: Promise<{ value: string; expiresAt: number }> | undefined;
  async function accessToken(ctx: Context): Promise<string> {
    const current = token;
    if (current) {
      const t = await current;
      if (now() < t.expiresAt) return t.value;
      if (token === current) token = undefined;
    }
    token ??= providerRequest(
      ctx,
      { integration: provider.id, operation: 'oauth.token', category: provider.category, server: new URL(TOKEN_URL).host },
      { method: 'POST', url: TOKEN_URL, query: { grant_type: 'account_credentials', account_id: cfg.accountId }, headers: { authorization: `Basic ${basic}` } },
      { schema: TokenResponse, error: ZoomError, failure: tokenFailure, deps },
    ).then(
      (t) => ({ value: t.access_token, expiresAt: now() + Math.max(0, t.expires_in * 1000 - TOKEN_MARGIN_MS) }),
      (error) => {
        token = undefined;
        throw error;
      },
    );
    return (await token).value;
  }

  /** Runs `send` with the token; a 401 (a token Zoom no longer takes) drops it and tries once more with a new one. */
  async function withToken<T>(ctx: Context, send: (bearer: string) => Promise<T>): Promise<T> {
    try {
      return await send(await accessToken(ctx));
    } catch (error) {
      if (!(error instanceof ZoomError) || error.status !== 401 || error.code === 'zoom/token-refused') throw error;
      // Zoom refused it before acting, so even a create is safe to send again. A new token doesn't end the old one.
      token = undefined;
      return send(await accessToken(ctx));
    }
  }

  function call<T>(ctx: Context, operation: ZoomOperation, request: Omit<ProviderRequest, 'url' | 'headers'> & { path: string }, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
    const { path, ...rest } = request;
    return withToken(ctx, (bearer) =>
      providerRequest(
        ctx,
        { integration: provider.id, operation, category: provider.category, server: provider.server },
        { ...rest, url: `${base}${path}`, headers: { authorization: `Bearer ${bearer}` } },
        { schema, error: ZoomError, failure, deps },
      ),
    );
  }

  const meetings = {
    /**
     * Schedules a meeting hosted by `userId` (a user of the account, by id or email) and returns it, with the
     * attendees' `join_url`. Zoom takes no idempotency key, so this isn't retried after an outage (only after a
     * rate limit): a retry could make a second meeting. Store the meeting's `id` before doing anything else with it.
     */
    async create(ctx: Context, input: CreateMeetingInput): Promise<Meeting> {
      const { userId, type, ...fields } = parse(CreateMeetingInput, input);
      return call(ctx, 'meetings.create', { method: 'POST', path: `/users/${encodeURIComponent(userId)}/meetings`, json: { type, ...meetingBody(fields) } }, Meeting);
    },
    /** One meeting by its number, without the host's links (see `startUrl`). */
    async get(ctx: Context, input: GetMeetingInput): Promise<Meeting> {
      const i = parse(GetMeetingInput, input);
      return call(ctx, 'meetings.get', { method: 'GET', path: `/meetings/${meetingPathId(i.meetingId)}`, query: { occurrence_id: i.occurrenceId } }, Meeting);
    },
    /**
     * The host's link to start the meeting, read fresh: it signs whoever opens it in as the host, and expires after
     * two hours. Hand it only to the host, when they ask to start (a redirect from the app's own page); never store
     * it, email it or show it to attendees.
     */
    async startUrl(ctx: Context, input: GetMeetingInput): Promise<string> {
      const i = parse(GetMeetingInput, input);
      return call(ctx, 'meetings.get', { method: 'GET', path: `/meetings/${meetingPathId(i.meetingId)}`, query: { occurrence_id: i.occurrenceId } }, HostStartUrl);
    },
    /** Changes the fields given; the others are kept. A new `startTime` moves the meeting; its `join_url` stays the same. */
    async update(ctx: Context, input: UpdateMeetingInput): Promise<void> {
      const { meetingId, occurrenceId, ...fields } = parse(UpdateMeetingInput, input);
      await call(ctx, 'meetings.update', { method: 'PATCH', path: `/meetings/${meetingPathId(meetingId)}`, query: { occurrence_id: occurrenceId }, json: meetingBody(fields) }, z.unknown());
    },
    /** Deletes the meeting (or one occurrence). Deleting one that's already gone fails with `zoom/meeting-not-found`. */
    async delete(ctx: Context, input: DeleteMeetingInput): Promise<void> {
      const i = parse(DeleteMeetingInput, input);
      await call(
        ctx,
        'meetings.delete',
        { method: 'DELETE', path: `/meetings/${meetingPathId(i.meetingId)}`, query: { occurrence_id: i.occurrenceId, cancel_meeting_reminder: i.notifyRegistrants, schedule_for_reminder: i.notifyHosts } },
        z.unknown(),
      );
    },
    /** One page of a user's meetings. Pass the answer's `next_page_token` for the next; it's empty on the last. */
    async list(ctx: Context, input: ListMeetingsInput): Promise<MeetingPage> {
      const i = parse(ListMeetingsInput, input);
      return call(
        ctx,
        'meetings.list',
        {
          method: 'GET',
          path: `/users/${encodeURIComponent(i.userId)}/meetings`,
          query: { type: i.type, page_size: i.pageSize, next_page_token: i.nextPageToken, from: i.from, to: i.to, timezone: i.timezone },
        },
        MeetingPage,
      );
    },
    /** Every meeting matching `input`, fetching pages as they're read. Stop early with `break`. */
    async *all(ctx: Context, input: ListMeetingsInput): AsyncGenerator<MeetingSummary> {
      let nextPageToken = input.nextPageToken;
      do {
        const page = await meetings.list(ctx, { ...input, nextPageToken });
        yield* page.meetings;
        nextPageToken = page.next_page_token || undefined;
      } while (nextPageToken);
    },
  };

  const pastMeetings = {
    /** A meeting that has happened, by number (its latest instance) or an instance's `uuid`. */
    async get(ctx: Context, meetingId: z.input<typeof MeetingIdOrUuid>): Promise<PastMeeting> {
      const id = parse(MeetingIdOrUuid, meetingId);
      return call(ctx, 'pastMeetings.get', { method: 'GET', path: `/past_meetings/${meetingPathId(id)}` }, PastMeeting);
    },
    /** One page of who took part. Someone who left and rejoined is listed for each time. Paid accounts only. */
    async participants(ctx: Context, input: ListParticipantsInput): Promise<ParticipantPage> {
      const i = parse(ListParticipantsInput, input);
      return call(
        ctx,
        'pastMeetings.participants',
        { method: 'GET', path: `/past_meetings/${meetingPathId(i.meetingId)}/participants`, query: { page_size: i.pageSize, next_page_token: i.nextPageToken } },
        ParticipantPage,
      );
    },
    /** Every participant, fetching pages as they're read. */
    async *allParticipants(ctx: Context, input: ListParticipantsInput): AsyncGenerator<Participant> {
      let nextPageToken = input.nextPageToken;
      do {
        const page = await pastMeetings.participants(ctx, { ...input, nextPageToken });
        yield* page.participants;
        nextPageToken = page.next_page_token || undefined;
      } while (nextPageToken);
    },
  };

  const recordings = {
    /**
     * A meeting's cloud recording, by number (its latest instance) or an instance's `uuid`: each file with its
     * `file_type` and `download_url`. A meeting with none fails with `zoom/no-recording`.
     */
    async get(ctx: Context, meetingId: z.input<typeof MeetingIdOrUuid>): Promise<Recording> {
      const id = parse(MeetingIdOrUuid, meetingId);
      return call(ctx, 'recordings.get', { method: 'GET', path: `/meetings/${meetingPathId(id)}/recordings` }, Recording);
    },
    /**
     * Downloads a recording or transcript file from its `download_url`, with the app's token (Zoom refuses it
     * without one). Only a `zoom.us` URL is accepted, so the token never goes anywhere else. Read the body once.
     */
    async download(ctx: Context, input: DownloadInput): Promise<ZoomDownload> {
      const { downloadUrl } = parse(DownloadInput, input);
      const url = new URL(downloadUrl);
      if (url.protocol !== 'https:' || !(url.hostname === 'zoom.us' || url.hostname.endsWith('.zoom.us'))) {
        throw new ZoomError('zoom/invalid-download-url', 'A Zoom download URL is https on zoom.us; the token is never sent anywhere else', { category: 'invalid-request' });
      }
      return withToken(ctx, (bearer) =>
        callProvider(
          ctx,
          { integration: provider.id, operation: 'recordings.download', category: provider.category, server: url.host, method: 'GET' },
          async (attempt) => {
            const response = await doFetch(url.toString(), { method: 'GET', headers: { authorization: `Bearer ${bearer}` }, redirect: 'follow' });
            attempt.setStatusCode(response.status);
            if (!response.ok || !response.body) {
              await response.body?.cancel();
              const category = categoryForStatus(response.status);
              throw new ZoomError(`zoom/${category}`, `zoom recordings.download failed (${response.status})`, {
                category,
                status: response.status,
                retryAfterMs: parseRetryAfter(response.headers.get('retry-after')),
              });
            }
            const size = Number(response.headers.get('content-length'));
            return { body: response.body, contentType: response.headers.get('content-type') ?? undefined, size: Number.isFinite(size) && size > 0 ? size : undefined };
          },
          deps,
        ),
      );
    },
  };

  const transcripts = {
    /**
     * A meeting's transcript, by number (its latest instance) or an instance's `uuid`. Until `can_download` is
     * true there's no `download_url`; `download_restriction_reason` says why (`NOT_READY` while Zoom is making it).
     */
    async get(ctx: Context, meetingId: z.input<typeof MeetingIdOrUuid>): Promise<Transcript> {
      const id = parse(MeetingIdOrUuid, meetingId);
      return call(ctx, 'transcripts.get', { method: 'GET', path: `/meetings/${meetingPathId(id)}/transcript` }, Transcript);
    },
  };

  const users = {
    /** A user of the account, by id or email. */
    async get(ctx: Context, userId: string): Promise<User> {
      const id = parse(UserId, userId);
      return call(ctx, 'users.get', { method: 'GET', path: `/users/${encodeURIComponent(id)}` }, User);
    },
  };

  return { meetings, pastMeetings, recordings, transcripts, users };
}

export type Zoom = ReturnType<typeof createZoom>;

type MeetingFields = Omit<z.output<typeof UpdateMeetingInput>, 'meetingId' | 'occurrenceId'>;

/** The app's camelCase fields as Zoom's body. */
function meetingBody(i: MeetingFields): Record<string, unknown> {
  const settings = compact({
    ...i.zoomSettings,
    join_before_host: i.settings?.joinBeforeHost,
    waiting_room: i.settings?.waitingRoom,
    auto_recording: i.settings?.autoRecording,
    host_video: i.settings?.hostVideo,
    participant_video: i.settings?.participantVideo,
    mute_upon_entry: i.settings?.muteUponEntry,
  });
  return compact({
    topic: i.topic,
    start_time: i.startTime instanceof Date ? zoomTime(i.startTime) : i.startTime,
    timezone: i.timezone,
    duration: i.duration,
    agenda: i.agenda,
    password: i.password,
    recurrence: i.recurrence,
    settings: Object.keys(settings).length ? settings : undefined,
  });
}

/** Zoom's UTC format, `2026-12-01T15:00:00Z`: no milliseconds. */
function zoomTime(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function compact(o: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
}

/**
 * Zoom's error body is `{ code, message }`, the code a number: the code is kept, the message isn't (it can echo
 * input), except to tell a daily limit from a per-second one. The daily limit (100 meeting creates and updates per
 * host per day) lasts until 00:00 UTC, so it fails at once as `zoom/daily-limit` instead of being retried.
 */
function failure(status: number, body: unknown): FailureInfo | undefined {
  const b = typeof body === 'object' && body !== null ? (body as { code?: unknown; message?: unknown }) : {};
  const code = typeof b.code === 'number' || typeof b.code === 'string' ? String(b.code) : undefined;
  if (status === 429 && typeof b.message === 'string' && /daily rate limit/i.test(b.message)) {
    return { providerCode: code, category: 'forbidden', reason: 'daily-limit', message: "zoom: the daily limit for this call is reached; it resets at 00:00 UTC" };
  }
  const mapped = mappedFailure(errorMap, code);
  return { providerCode: code, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}

/** The token endpoint answers `{ reason, error }`. Refused credentials (or an app that isn't activated) are `zoom/token-refused`. */
function tokenFailure(status: number, body: unknown): FailureInfo | undefined {
  const error = typeof body === 'object' && body !== null ? (body as { error?: unknown }).error : undefined;
  const providerCode = typeof error === 'string' ? error : undefined;
  if (status === 400 || status === 401 || status === 403) return { providerCode, category: 'unauthorized', reason: 'token-refused', message: 'zoom: the account credentials were refused (check the account id, client id and secret, and that the app is activated)' };
  return { providerCode };
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Zoom input');
  return parsed.data;
}
