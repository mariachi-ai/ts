/**
 * `@mariachi/integration-zoom/testing`: a Zoom for an app's tests, held in memory, with the same shape as
 * `createZoom`'s client; and signed webhooks (and Zoom's endpoint check) to post to the app's endpoint.
 */
import { createHmac } from 'node:crypto';
import { fromZodError } from '@mariachi/core';
import type { z } from 'zod';
import type { Zoom } from './client';
import { ZoomError } from './errors';
import {
  CreateMeetingInput,
  DeleteMeetingInput,
  GetMeetingInput,
  ListMeetingsInput,
  ListParticipantsInput,
  type Meeting,
  MeetingIdOrUuid,
  type Participant,
  type PastMeeting,
  type Recording,
  type Transcript,
  UpdateMeetingInput,
  type User,
  UserId,
} from './schemas';

export interface FakeZoom extends Zoom {
  /** Meetings by number, as the fake made them. */
  meetings_: Map<number, Meeting>;
  users_: Map<string, User>;
  /** Past meetings, recordings, transcripts and participants by meeting number or instance uuid. */
  pastMeetings_: Map<string, PastMeeting>;
  participants_: Map<string, Participant[]>;
  recordings_: Map<string, Recording>;
  transcripts_: Map<string, Transcript>;
  /** What `recordings.download` answers, by download URL. */
  files_: Map<string, string | Uint8Array>;
}

export interface FakeZoomSeed {
  /** The account's users. When given, a meeting for anyone else fails as Zoom's would (`zoom/user-not-found`). */
  users?: User[];
  pastMeetings?: PastMeeting[];
  participants?: Record<string, Participant[]>;
  recordings?: Recording[];
  transcripts?: Transcript[];
  files?: Record<string, string | Uint8Array>;
}

/** An in-memory Zoom: hand it to the code under test in place of the client. */
export function fakeZoom(seed: FakeZoomSeed = {}): FakeZoom {
  const meetings_ = new Map<number, Meeting>();
  const users_ = new Map((seed.users ?? []).map((u) => [u.id, u]));
  const pastMeetings_ = new Map<string, PastMeeting>();
  for (const p of seed.pastMeetings ?? []) {
    pastMeetings_.set(String(p.id), p);
    pastMeetings_.set(p.uuid, p);
  }
  const participants_ = new Map(Object.entries(seed.participants ?? {}));
  const recordings_ = new Map<string, Recording>();
  for (const r of seed.recordings ?? []) {
    recordings_.set(String(r.id), r);
    recordings_.set(r.uuid, r);
  }
  const transcripts_ = new Map((seed.transcripts ?? []).map((t) => [t.meeting_id, t]));
  const files_ = new Map(Object.entries(seed.files ?? {}));
  let next = 85_000_000_001;

  const userOf = (id: string) => {
    if (users_.size === 0) return { id, email: id.includes('@') ? id : undefined };
    const user = users_.get(id) ?? [...users_.values()].find((u) => u.email === id);
    if (!user) throw notFound('user-not-found', '1001');
    return user;
  };
  const meetingOf = (id: number | string) => {
    const meeting = meetings_.get(Number(id));
    if (!meeting) throw notFound('meeting-not-found', '3001');
    return meeting;
  };

  const fake: FakeZoom = {
    meetings_,
    users_,
    pastMeetings_,
    participants_,
    recordings_,
    transcripts_,
    files_,
    meetings: {
      async create(_ctx, input) {
        const i = check(CreateMeetingInput, input);
        const host = userOf(i.userId);
        const id = next++;
        const meeting: Meeting = {
          id,
          uuid: `uuid-${id}==`,
          host_id: host.id,
          host_email: host.email,
          topic: i.topic,
          type: i.type,
          status: 'waiting',
          start_time: i.startTime instanceof Date ? i.startTime.toISOString().replace(/\.\d{3}Z$/, 'Z') : i.startTime,
          duration: i.duration ?? 60,
          timezone: i.timezone,
          agenda: i.agenda,
          join_url: `https://zoom.us/j/${id}`,
          password: i.password,
          created_at: new Date().toISOString(),
        };
        meetings_.set(id, meeting);
        return meeting;
      },
      async get(_ctx, input) {
        return meetingOf(check(GetMeetingInput, input).meetingId);
      },
      async startUrl(_ctx, input) {
        return `https://zoom.us/s/${meetingOf(check(GetMeetingInput, input).meetingId).id}?zak=fake-host-token`;
      },
      async update(_ctx, input) {
        const i = check(UpdateMeetingInput, input);
        const meeting = meetingOf(i.meetingId);
        meetings_.set(meeting.id, {
          ...meeting,
          ...(i.topic !== undefined ? { topic: i.topic } : {}),
          ...(i.startTime !== undefined ? { start_time: i.startTime instanceof Date ? i.startTime.toISOString().replace(/\.\d{3}Z$/, 'Z') : i.startTime } : {}),
          ...(i.duration !== undefined ? { duration: i.duration } : {}),
          ...(i.timezone !== undefined ? { timezone: i.timezone } : {}),
          ...(i.agenda !== undefined ? { agenda: i.agenda } : {}),
        });
      },
      async delete(_ctx, input) {
        const i = check(DeleteMeetingInput, input);
        meetingOf(i.meetingId);
        meetings_.delete(Number(i.meetingId));
      },
      async list(_ctx, input) {
        const i = check(ListMeetingsInput, input);
        const host = userOf(i.userId);
        const items = [...meetings_.values()].filter((m) => m.host_id === host.id);
        return { meetings: items, next_page_token: '', page_size: items.length, total_records: items.length };
      },
      async *all(ctx, input) {
        yield* (await fake.meetings.list(ctx, input)).meetings;
      },
    },
    pastMeetings: {
      async get(_ctx, meetingId) {
        const meeting = pastMeetings_.get(String(check(MeetingIdOrUuid, meetingId)));
        if (!meeting) throw notFound('meeting-not-found', '3001');
        return meeting;
      },
      async participants(_ctx, input) {
        const i = check(ListParticipantsInput, input);
        const participants = participants_.get(String(i.meetingId)) ?? [];
        return { participants, next_page_token: '', page_size: participants.length, total_records: participants.length };
      },
      async *allParticipants(ctx, input) {
        yield* (await fake.pastMeetings.participants(ctx, input)).participants;
      },
    },
    recordings: {
      async get(_ctx, meetingId) {
        const recording = recordings_.get(String(check(MeetingIdOrUuid, meetingId)));
        if (!recording) throw notFound('no-recording', '3301');
        return recording;
      },
      async download(_ctx, input) {
        const file = files_.get(input.downloadUrl);
        if (file === undefined) throw new ZoomError('zoom/not-found', 'zoom recordings.download failed (404)', { category: 'not-found', status: 404 });
        const bytes = typeof file === 'string' ? new TextEncoder().encode(file) : file;
        return { body: new Response(bytes).body!, contentType: typeof file === 'string' ? 'text/vtt' : 'application/octet-stream', size: bytes.byteLength };
      },
    },
    transcripts: {
      async get(_ctx, meetingId) {
        const id = String(check(MeetingIdOrUuid, meetingId));
        const transcript = transcripts_.get(id) ?? [...transcripts_.values()].find((t) => String(recordings_.get(id)?.uuid) === t.meeting_id);
        if (!transcript) throw notFound('no-transcript', '3322');
        return transcript;
      },
    },
    users: {
      async get(_ctx, userId) {
        const id = check(UserId, userId);
        const user = users_.get(id) ?? [...users_.values()].find((u) => u.email === id);
        if (!user) throw notFound('user-not-found', '1001');
        return user;
      },
    },
  };
  return fake;
}

/** A finished cloud recording, with a video and an audio transcript, to seed the fake with or post in a webhook. */
export function zoomRecording(overrides: Partial<Recording> = {}): Recording {
  const id = overrides.id ?? 85_000_000_001;
  const uuid = overrides.uuid ?? `uuid-${id}==`;
  return {
    id,
    uuid,
    host_id: 'host-1',
    topic: 'Intro call',
    start_time: '2026-12-01T15:00:00Z',
    duration: 30,
    recording_files: [
      { id: 'file-video', meeting_id: uuid, file_type: 'MP4', file_extension: 'MP4', status: 'completed', recording_type: 'shared_screen_with_speaker_view', download_url: `https://zoom.us/rec/download/${id}-video` },
      { id: 'file-transcript', meeting_id: uuid, file_type: 'TRANSCRIPT', file_extension: 'VTT', status: 'completed', recording_type: 'audio_transcript', download_url: `https://zoom.us/rec/download/${id}-transcript` },
    ],
    ...overrides,
  };
}

/** A webhook body as Zoom sends it: `zoomEvent('meeting.ended', { id, uuid, host_id })`. */
export function zoomEvent(event: string, object: Record<string, unknown>, eventTs: number = Date.now()): { event: string; event_ts: number; payload: { account_id: string; object: Record<string, unknown> } } {
  return { event, event_ts: eventTs, payload: { account_id: 'account-1', object } };
}

/** The body and headers Zoom would send for `body`, signed with the secret token at `timestampSeconds` (default now). */
export function signedZoomWebhook(body: unknown, secretToken: string, timestampSeconds: number = Math.floor(Date.now() / 1000)): { rawBody: string; headers: Record<string, string> } {
  const rawBody = JSON.stringify(body);
  const timestamp = String(timestampSeconds);
  const signature = createHmac('sha256', secretToken).update(`v0:${timestamp}:${rawBody}`).digest('hex');
  return { rawBody, headers: { 'x-zm-request-timestamp': timestamp, 'x-zm-signature': `v0=${signature}` } };
}

/** Zoom's endpoint check, signed, and the answer it expects back. */
export function zoomUrlValidation(plainToken: string, secretToken: string, timestampSeconds?: number): { rawBody: string; headers: Record<string, string>; expected: { plainToken: string; encryptedToken: string } } {
  const signed = signedZoomWebhook({ event: 'endpoint.url_validation', event_ts: Date.now(), payload: { plainToken } }, secretToken, timestampSeconds);
  return { ...signed, expected: { plainToken, encryptedToken: createHmac('sha256', secretToken).update(plainToken).digest('hex') } };
}

function notFound(reason: string, providerCode: string): ZoomError {
  return new ZoomError(`zoom/${reason}`, `zoom: ${reason.replace(/-/g, ' ')}`, { category: 'not-found', providerCode, status: 404 });
}

function check<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Zoom input');
  return parsed.data;
}
