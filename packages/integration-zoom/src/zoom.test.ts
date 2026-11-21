import { createContext } from '@mariachi/core';
import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { describe, expect, it } from 'vitest';
import { createZoom } from './client';
import { ZoomError } from './errors';
import { settings } from './generated';
import { meetingPathId, transcriptFile } from './helpers';
import { fakeZoom, signedZoomWebhook, zoomEvent, zoomRecording, zoomUrlValidation } from './testing';
import { ZoomWebhookBody, zoomEventType, zoomWebhookAuth } from './webhooks';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger });
const config = { accountId: 'acct-1', clientId: 'client-1', clientSecret: 'secret-1', webhookSecretToken: 'whsec-test' };
const noWait = { sleep: async () => {} };
const token = (access_token = 'tok-1', expires_in = 3599) => ({ json: { access_token, token_type: 'bearer', expires_in, scope: 'meeting:write:meeting:admin' } });
const meetingJson = (over: Record<string, unknown> = {}) => ({
  id: 85746065432,
  uuid: 'aDYlohsHRtCd4ii1uC2+hA==',
  host_id: 'host-1',
  topic: 'Intro call',
  type: 2,
  start_time: '2026-12-01T15:00:00Z',
  duration: 30,
  join_url: 'https://zoom.us/j/85746065432?pwd=abc',
  start_url: 'https://zoom.us/s/85746065432?zak=host-secret',
  dynamic_host_key: '123456',
  password: 'abc',
  ...over,
});

describe('the client', () => {
  it('gets a token by the account credentials grant, then schedules the meeting, one span each and nothing sensitive', async () => {
    const fetch = scriptedFetch(token(), { status: 201, json: meetingJson() });
    const tracer = new TestTracer();
    const meeting = await createZoom(config, { fetch, tracer }).meetings.create(ctx, {
      userId: 'host@example.com',
      topic: 'Intro call',
      startTime: new Date('2026-12-01T15:00:00.000Z'),
      duration: 30,
      settings: { waitingRoom: true, autoRecording: 'cloud' },
    });

    const [tokenReq, createReq] = fetch.requests;
    expect([tokenReq!.method, tokenReq!.url.origin + tokenReq!.url.pathname]).toEqual(['POST', 'https://zoom.us/oauth/token']);
    expect(Object.fromEntries(tokenReq!.url.searchParams)).toEqual({ grant_type: 'account_credentials', account_id: 'acct-1' });
    expect(tokenReq!.headers.authorization).toBe(`Basic ${Buffer.from('client-1:secret-1').toString('base64')}`);
    expect(createReq!.url.href).toBe('https://api.zoom.us/v2/users/host%40example.com/meetings');
    expect(createReq!.headers.authorization).toBe('Bearer tok-1');
    expect(createReq!.json).toEqual({ type: 2, topic: 'Intro call', start_time: '2026-12-01T15:00:00Z', duration: 30, settings: { waiting_room: true, auto_recording: 'cloud' } });

    expect(meeting.join_url).toBe('https://zoom.us/j/85746065432?pwd=abc');
    expect(meeting).not.toHaveProperty('start_url');
    expect(meeting).not.toHaveProperty('dynamic_host_key');
    expect(JSON.stringify(meeting)).not.toContain('host-secret');

    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([
      ['zoom oauth.token', 'client', 'zoom.us'],
      ['zoom meetings.create', 'client', 'api.zoom.us'],
    ]);
    assertProviderSpans(tracer.spans);
  });

  it('keeps the token until shortly before its hour is up, and asks again after', async () => {
    let clock = 0;
    const fetch = scriptedFetch(token('tok-1'), { json: meetingJson() }, { json: meetingJson() }, token('tok-2'), { json: meetingJson() });
    const zoom = createZoom(config, { fetch, now: () => clock });
    await zoom.meetings.get(ctx, { meetingId: 85746065432 });
    clock = 50 * 60_000;
    await zoom.meetings.get(ctx, { meetingId: '85746065432' });
    clock = 56 * 60_000;
    await zoom.meetings.get(ctx, { meetingId: 85746065432 });
    expect(fetch.requests.map((r) => r.headers.authorization ?? r.url.pathname)).toEqual([
      expect.stringMatching(/^Basic /),
      'Bearer tok-1',
      'Bearer tok-1',
      expect.stringMatching(/^Basic /),
      'Bearer tok-2',
    ]);
  });

  it('drops a token Zoom no longer takes and tries once more with a new one', async () => {
    const fetch = scriptedFetch(token('old'), { status: 401, json: { code: 124, message: 'Access token is expired.' } }, token('new'), { json: meetingJson() });
    await createZoom(config, { fetch }).meetings.get(ctx, { meetingId: 85746065432 });
    expect(fetch.requests.map((r) => r.headers.authorization).slice(-1)).toEqual(['Bearer new']);
  });

  it('says plainly when the credentials are refused, without trying again', async () => {
    const fetch = scriptedFetch({ status: 400, json: { reason: 'Invalid client_id or client_secret', error: 'invalid_client' } });
    const err = await createZoom(config, { fetch }).users.get(ctx, 'host@example.com').catch((e) => e);
    expect([err.code, err.category, err.providerCode, fetch.requests.length]).toEqual(['zoom/token-refused', 'unauthorized', 'invalid_client', 1]);
    expect(err.message).not.toContain('Invalid client_id');
  });

  it("hands the host's start link out only when asked, read fresh", async () => {
    const fetch = scriptedFetch(token(), { json: meetingJson() });
    const url = await createZoom(config, { fetch }).meetings.startUrl(ctx, { meetingId: 85746065432 });
    expect(url).toBe('https://zoom.us/s/85746065432?zak=host-secret');
    expect(fetch.requests[1]!.url.pathname).toBe('/v2/meetings/85746065432');
  });

  it("doesn't send a create again after an outage (Zoom takes no idempotency key), but does after a rate limit", async () => {
    const outage = scriptedFetch(token(), { status: 503 });
    const err = await createZoom(config, { fetch: outage, ...noWait }).meetings.create(ctx, { userId: 'host-1', topic: 'x', startTime: '2026-12-01T15:00:00Z' }).catch((e) => e);
    expect([err.code, outage.requests.length]).toEqual(['zoom/unavailable', 2]);

    const limited = scriptedFetch(token(), { status: 429, headers: { 'retry-after': '0' }, json: { code: 429, message: 'You have reached the maximum per-second rate limit for this API. Try again later.' } }, { status: 201, json: meetingJson() });
    await createZoom(config, { fetch: limited, ...noWait }).meetings.create(ctx, { userId: 'host-1', topic: 'x', startTime: '2026-12-01T15:00:00Z' });
    expect(limited.requests.length).toBe(3);
  });

  it('fails at once on the daily limit, which lasts until midnight UTC', async () => {
    const fetch = scriptedFetch(token(), { status: 429, json: { code: 429, message: 'You have reached the maximum daily rate limit for this API.' } });
    const err = await createZoom(config, { fetch, ...noWait }).meetings.update(ctx, { meetingId: 1, topic: 'y' }).catch((e) => e);
    expect([err.code, err.category, fetch.requests.length]).toEqual(['zoom/daily-limit', 'forbidden', 2]);
  });

  it("fails as a ZoomError with Zoom's code, keeping none of its message", async () => {
    const fetch = scriptedFetch(token(), { status: 404, json: { code: 3001, message: 'Meeting does not exist: 123.' } });
    const tracer = new TestTracer();
    const err = await createZoom(config, { fetch, tracer }).meetings.delete(ctx, { meetingId: 123, notifyRegistrants: true }).catch((e) => e);
    expect(err).toBeInstanceOf(ZoomError);
    expect([err.code, err.category, err.providerCode]).toEqual(['zoom/meeting-not-found', 'not-found', '3001']);
    expect(err.message).not.toContain('does not exist');
    expect(fetch.requests[1]!.url.search).toBe('?cancel_meeting_reminder=true');
    expect(tracer.spans[1]!.attributes['error.type']).toBe('3001');
    assertProviderSpans(tracer.spans);
  });

  it('checks its input before calling', async () => {
    const zoom = createZoom(config, { fetch: scriptedFetch() });
    await expect(zoom.meetings.create(ctx, { userId: 'me', topic: 'x', startTime: '2026-12-01T15:00:00Z' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(zoom.meetings.create(ctx, { userId: 'host-1', topic: 'x' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(zoom.meetings.get(ctx, { meetingId: 'not-a-number' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });

  it('pages through a user’s meetings by next_page_token', async () => {
    const page = (ids: number[], next: string) => ({ json: { page_size: 2, next_page_token: next, meetings: ids.map((id) => ({ id, topic: 't', join_url: `https://zoom.us/j/${id}`, start_url: 'https://zoom.us/s/x' })) } });
    const fetch = scriptedFetch(token(), page([1, 2], 'p2'), page([3], ''));
    const seen: number[] = [];
    for await (const m of createZoom(config, { fetch }).meetings.all(ctx, { userId: 'host-1', type: 'upcoming', pageSize: 2 })) {
      seen.push(m.id);
      expect(m).not.toHaveProperty('start_url');
    }
    expect(seen).toEqual([1, 2, 3]);
    expect(fetch.requests[2]!.url.searchParams.get('next_page_token')).toBe('p2');
  });

  it("reads a past instance's recording by its UUID, encoded twice when it holds a slash, and downloads the transcript with the token", async () => {
    const recording = zoomRecording({ uuid: '/ajXp112QmuoKj4854875==' });
    const fetch = scriptedFetch(token(), { json: recording }, { text: 'WEBVTT\n\n1\n00:00:01.000 --> 00:00:03.000\nAda: Hello', headers: { 'content-type': 'text/vtt' } });
    const tracer = new TestTracer();
    const zoom = createZoom(config, { fetch, tracer });
    const got = await zoom.recordings.get(ctx, recording.uuid);
    expect(fetch.requests[1]!.url.pathname).toBe('/v2/meetings/%252FajXp112QmuoKj4854875%253D%253D/recordings');
    const file = transcriptFile(got)!;
    const { body, contentType } = await zoom.recordings.download(ctx, { downloadUrl: file.download_url });
    expect([await new Response(body).text(), contentType]).toEqual(['WEBVTT\n\n1\n00:00:01.000 --> 00:00:03.000\nAda: Hello', 'text/vtt']);
    expect(fetch.requests[2]!.headers.authorization).toBe('Bearer tok-1');
    expect(tracer.spans.map((s) => s.name)).toEqual(['zoom oauth.token', 'zoom recordings.get', 'zoom recordings.download']);
    assertProviderSpans(tracer.spans);
  });

  it('never sends the token to a download URL off zoom.us', async () => {
    const fetch = scriptedFetch();
    await expect(createZoom(config, { fetch }).recordings.download(ctx, { downloadUrl: 'https://zoom.us.evil.example/rec/x' })).rejects.toMatchObject({ code: 'zoom/invalid-download-url' });
    await expect(createZoom(config, { fetch }).recordings.download(ctx, { downloadUrl: 'http://zoom.us/rec/x' })).rejects.toMatchObject({ code: 'zoom/invalid-download-url' });
    expect(fetch.requests).toHaveLength(0);
  });

  it("reads the transcript's state, and who took part", async () => {
    const fetch = scriptedFetch(
      token(),
      { json: { meeting_id: 'uuid-1==', can_download: false, download_restriction_reason: 'NOT_READY' } },
      { json: { page_size: 30, next_page_token: '', participants: [{ id: 'u1', user_id: '16778240', name: 'Ada', join_time: '2026-12-01T15:01:00Z', duration: 1700 }] } },
    );
    const zoom = createZoom(config, { fetch });
    expect(await zoom.transcripts.get(ctx, 'uuid-1==')).toMatchObject({ can_download: false, download_restriction_reason: 'NOT_READY' });
    expect((await zoom.pastMeetings.participants(ctx, { meetingId: 'uuid-1==' })).participants.map((p) => p.name)).toEqual(['Ada']);
    expect(fetch.requests.map((r) => r.url.pathname)).toEqual(['/oauth/token', '/v2/meetings/uuid-1%3D%3D/transcript', '/v2/past_meetings/uuid-1%3D%3D/participants']);
  });
});

describe('settings', () => {
  it('reads from the environment by name, and says where to find each', () => {
    const env: Record<string, string> = { ZOOM_ACCOUNT_ID: 'a', ZOOM_CLIENT_ID: 'c', ZOOM_CLIENT_SECRET: 's' };
    expect(settingsFromEnv(settings, (n) => env[n])).toEqual({ accountId: 'a', clientId: 'c', clientSecret: 's' });
    expect(settings.every((s) => s.whereToFind)).toBe(true);
    expect(settings.filter((s) => s.secret).map((s) => s.env)).toEqual(['ZOOM_CLIENT_SECRET', 'ZOOM_WEBHOOK_SECRET_TOKEN']);
    expect(checkSetting(settings[0]!, 'test', 'a')).toBeNull();
  });
});

describe('webhooks', () => {
  const handled: unknown[] = [];
  class ZoomWebhooks extends WebhookController {
    readonly prefix = 'zoom';
    readonly auth = zoomWebhookAuth('whsec-test');
    init() {
      this.post('events', { mode: 'direct', procedure: 'meetings.fromZoom', eventType: zoomEventType }, async (_ctx, body) => ZoomWebhookBody.parse(body));
    }
  }
  const tracer = new TestTracer();
  const communication = { call: async (_ctx: unknown, _name: string, input: unknown) => { handled.push(input); return { ok: true }; } } as never;
  const server = new WebhookServer({ name: 'webhooks', logger }, { communication, tracer }).registerController(new ZoomWebhooks());
  const post = (signed: { rawBody: string; headers: Record<string, string> }) =>
    server.inject({ method: 'POST', url: '/zoom/events', headers: { 'content-type': 'application/json', ...signed.headers }, payload: signed.rawBody });

  it('receives a signed delivery through WebhookServer, with its span, and refuses a forged, altered or stale one', async () => {
    const ended = zoomEvent('meeting.ended', { id: '85746065432', uuid: 'uuid-1==', host_id: 'host-1', end_time: '2026-12-01T15:31:00Z' });
    const ok = await post(signedZoomWebhook(ended, 'whsec-test'));
    expect(ok.statusCode).toBe(200);
    const body = handled.at(-1) as ReturnType<typeof ZoomWebhookBody.parse>;
    expect([body.event, body.payload.object.id, body.payload.object.uuid]).toEqual(['meeting.ended', 85746065432, 'uuid-1==']);
    expect(tracer.spans.at(-1)!.attributes['mariachi.integration.event']).toBe('meeting.ended');

    const count = handled.length;
    expect((await post(signedZoomWebhook(ended, 'someone-else'))).statusCode).toBe(401);
    const signed = signedZoomWebhook(ended, 'whsec-test');
    expect((await post({ ...signed, rawBody: signed.rawBody.replace('uuid-1', 'uuid-2') })).statusCode).toBe(401);
    expect((await post(signedZoomWebhook(ended, 'whsec-test', Math.floor(Date.now() / 1000) - 600))).statusCode).toBe(401);
    expect(handled).toHaveLength(count);
  });

  it("answers Zoom's endpoint check before the route, and only when it's signed", async () => {
    const count = handled.length;
    const check = zoomUrlValidation('qgg8vlvZRS6UYooatFL8Aw', 'whsec-test');
    const res = await post(check);
    expect([res.statusCode, JSON.parse(res.body)]).toEqual([200, check.expected]);
    expect(tracer.spans.at(-1)!.attributes['mariachi.integration.event']).toBe('handshake');

    expect((await post(zoomUrlValidation('qgg8vlvZRS6UYooatFL8Aw', 'someone-else'))).statusCode).toBe(401);
    expect(handled).toHaveLength(count);
  });

  it('dedupes on what Zoom signs: the event, when it happened, the instance and the participant', async () => {
    const auth = zoomWebhookAuth('whsec-test');
    const identity = async (body: unknown) => {
      const signed = signedZoomWebhook(body, 'whsec-test');
      return auth.auth({ method: 'POST', headers: signed.headers, rawBody: Buffer.from(signed.rawBody), body, params: {}, query: {}, url: '/', routePath: '/', ip: '' }, { logger } as never);
    };
    const joined = (userId: string) => zoomEvent('meeting.participant_joined', { id: 1, uuid: 'uuid-1==', participant: { user_id: userId, user_name: 'Ada' } }, 1764601260000);
    expect((await identity(joined('16778240')))?.eventId).toBe('meeting.participant_joined:1764601260000:uuid-1==:16778240');
    expect((await identity(joined('16778241')))?.eventId).not.toBe((await identity(joined('16778240')))?.eventId);
  });

  it("drops a recording event's download token from what reaches the job", () => {
    const parsed = ZoomWebhookBody.parse({ ...zoomEvent('recording.completed', { id: 1, uuid: 'u', recording_files: zoomRecording().recording_files }), download_token: 'secret-download-token' });
    expect(JSON.stringify(parsed)).not.toContain('secret-download-token');
    expect(transcriptFile({ recording_files: parsed.payload.object.recording_files ?? [] })?.file_type).toBe('TRANSCRIPT');
  });
});

describe('helpers', () => {
  it('encodes a UUID twice only when it holds a slash', () => {
    expect(meetingPathId(85746065432)).toBe('85746065432');
    expect(meetingPathId('aDYlohsHRtCd4ii1uC2+hA==')).toBe('aDYlohsHRtCd4ii1uC2%2BhA%3D%3D');
    expect(meetingPathId('/ajXp112QmuoKj4854875==')).toBe('%252FajXp112QmuoKj4854875%253D%253D');
  });

  it('finds no transcript while Zoom is still processing it', () => {
    expect(transcriptFile({ recording_files: [{ file_type: 'TRANSCRIPT', status: 'processing', download_url: 'https://zoom.us/rec/x' }] })).toBeUndefined();
  });
});

describe('the fake', () => {
  it('stands in for the client in an app’s tests', async () => {
    const zoom = fakeZoom({ users: [{ id: 'host-1', email: 'host@example.com' }], recordings: [zoomRecording({ id: 7 })], files: { 'https://zoom.us/rec/download/7-transcript': 'WEBVTT' } });
    const meeting = await zoom.meetings.create(ctx, { userId: 'host@example.com', topic: 'Intro', startTime: new Date('2026-12-01T15:00:00Z'), duration: 30 });
    expect(meeting.join_url).toMatch(/^https:\/\/zoom\.us\/j\//);
    expect(meeting).not.toHaveProperty('start_url');
    await expect(zoom.meetings.create(ctx, { userId: 'nobody@example.com', topic: 'x', startTime: '2026-12-01T15:00:00Z' })).rejects.toMatchObject({ code: 'zoom/user-not-found' });
    await zoom.meetings.delete(ctx, { meetingId: meeting.id });
    await expect(zoom.meetings.get(ctx, { meetingId: meeting.id })).rejects.toMatchObject({ code: 'zoom/meeting-not-found', category: 'not-found' });
    const file = transcriptFile(await zoom.recordings.get(ctx, 7))!;
    expect(await new Response((await zoom.recordings.download(ctx, { downloadUrl: file.download_url })).body).text()).toBe('WEBVTT');
  });
});
