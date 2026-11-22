import { z } from 'zod';

/**
 * Zoom's shapes, as far as an app reads them. Unknown fields pass through (`passthrough`), so a field Zoom adds
 * doesn't fail the boundary; a field the app relies on that goes missing does. Zoom's own names (snake_case) are
 * kept on what it returns; what the app sends is camelCase.
 */

/** A meeting's number (`85746065432`): what `/meetings/{meetingId}` takes. Zoom's ids pass 10 digits, so keep them whole. */
export const MeetingId = z.union([z.number().int().positive(), z.string().regex(/^\d+$/, 'a meeting id is its number')]);
export type MeetingId = z.infer<typeof MeetingId>;

/**
 * A meeting's number (its latest instance) or one instance's UUID (`4444AAAiAAAAAiAiAiiAii==`), for what happened
 * in a meeting: past details, participants, recordings, transcript. A UUID changes with every instance; store the
 * one from `meeting.ended` or `recording.completed` to read that instance.
 */
export const MeetingIdOrUuid = z.union([z.number().int().positive(), z.string().min(1)]);
export type MeetingIdOrUuid = z.infer<typeof MeetingIdOrUuid>;

/**
 * A user of the account by id or email. A Server-to-Server app acts for the whole account, so it names the user:
 * Zoom's `me` is for apps a user installs, and isn't accepted here.
 */
export const UserId = z
  .string()
  .min(1)
  .refine((v) => v.trim().toLowerCase() !== 'me', { message: "a Server-to-Server app names the user (their id or email), not 'me'" });

/** Instant (1), scheduled (2), recurring with no fixed time (3), recurring with a fixed time (8). */
export const MeetingType = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(8)]);

/** The settings most apps choose. Anything else Zoom takes goes in `zoomSettings`, by Zoom's own names. */
export const MeetingSettingsInput = z
  .object({
    /** Let attendees in before the host. Ignored when the waiting room is on. */
    joinBeforeHost: z.boolean().optional(),
    waitingRoom: z.boolean().optional(),
    /** `cloud` makes the recording (and, where the account has it, the transcript) `recordings.get` reads. */
    autoRecording: z.enum(['local', 'cloud', 'none']).optional(),
    hostVideo: z.boolean().optional(),
    participantVideo: z.boolean().optional(),
    muteUponEntry: z.boolean().optional(),
  })
  .strict();

/** A date, or Zoom's own text: `2026-12-01T15:00:00Z` (UTC), or `2026-12-01T15:00:00` with `timezone`. */
const StartTime = z.union([z.date(), z.string().min(1)]);

const MeetingFields = {
  topic: z.string().min(1).max(200).optional(),
  startTime: StartTime.optional(),
  /** A time zone id (`Europe/Paris`): how Zoom shows the time, and how it reads a `startTime` with no `Z`. */
  timezone: z.string().min(1).optional(),
  /** Minutes, 1 to 1440. */
  duration: z.number().int().min(1).max(1440).optional(),
  agenda: z.string().max(2000).optional(),
  /** The passcode. Left out, Zoom makes one when the account requires it, and puts it in the join link. */
  password: z.string().min(1).max(10).optional(),
  settings: MeetingSettingsInput.optional(),
  /** Other meeting settings, by Zoom's names (`{ meeting_authentication: true }`); `settings` wins where both set one. */
  zoomSettings: z.record(z.unknown()).optional(),
  /** Zoom's `recurrence` object, as Zoom documents it, for a type 8 meeting. */
  recurrence: z.record(z.unknown()).optional(),
};

export const CreateMeetingInput = z
  .object({
    /** The host: a user of the account, by id or email. */
    userId: UserId,
    /** Default 2, a scheduled meeting. */
    type: MeetingType.default(2),
    ...MeetingFields,
  })
  .refine((i) => !(i.type === 2 || i.type === 8) || i.startTime !== undefined, {
    message: 'a scheduled meeting needs a startTime (without one, Zoom starts it now)',
    path: ['startTime'],
  });
export type CreateMeetingInput = z.input<typeof CreateMeetingInput>;

export const UpdateMeetingInput = z.object({
  meetingId: MeetingId,
  /** One occurrence of a recurring meeting. */
  occurrenceId: z.string().min(1).optional(),
  ...MeetingFields,
});
export type UpdateMeetingInput = z.input<typeof UpdateMeetingInput>;

export const GetMeetingInput = z.object({ meetingId: MeetingId, occurrenceId: z.string().min(1).optional() });
export type GetMeetingInput = z.input<typeof GetMeetingInput>;

export const DeleteMeetingInput = z.object({
  meetingId: MeetingId,
  occurrenceId: z.string().min(1).optional(),
  /** Email the meeting's registrants that it's cancelled. Default false. */
  notifyRegistrants: z.boolean().optional(),
  /** Email the host and alternative hosts that it's cancelled. */
  notifyHosts: z.boolean().optional(),
});
export type DeleteMeetingInput = z.input<typeof DeleteMeetingInput>;

export const ListMeetingsInput = z.object({
  userId: UserId,
  /** Default `scheduled`: unexpired previous, live and upcoming. */
  type: z.enum(['scheduled', 'live', 'upcoming', 'upcoming_meetings', 'previous_meetings']).optional(),
  pageSize: z.number().int().min(1).optional(),
  /** From the previous page. It expires after 15 minutes. */
  nextPageToken: z.string().min(1).optional(),
  /** A date, `2026-12-01`. */
  from: z.string().min(1).optional(),
  to: z.string().min(1).optional(),
  timezone: z.string().min(1).optional(),
});
export type ListMeetingsInput = z.input<typeof ListMeetingsInput>;

export const ListParticipantsInput = z.object({
  meetingId: MeetingIdOrUuid,
  pageSize: z.number().int().min(1).optional(),
  nextPageToken: z.string().min(1).optional(),
});
export type ListParticipantsInput = z.input<typeof ListParticipantsInput>;

export const DownloadInput = z.object({
  /** A file's `download_url`, from `recordings.get`, `transcripts.get` or `recording.completed`. */
  downloadUrl: z.string().url(),
});
export type DownloadInput = z.input<typeof DownloadInput>;

/** What Zoom answers with a meeting, before the host's links are taken out. */
const MeetingFieldsWire = z.object({
  id: z.number(),
  uuid: z.string().optional(),
  host_id: z.string().optional(),
  host_email: z.string().optional(),
  topic: z.string().optional(),
  type: z.number().optional(),
  /** `waiting` or `started`. */
  status: z.string().optional(),
  start_time: z.string().optional(),
  duration: z.number().optional(),
  timezone: z.string().optional(),
  agenda: z.string().optional(),
  created_at: z.string().optional(),
  /** The link for attendees: put this on the booking, the invite and the reminder. */
  join_url: z.string().url(),
  /** The passcode; the join link already carries it. */
  password: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
  occurrences: z.array(z.object({ occurrence_id: z.string(), start_time: z.string().optional(), duration: z.number().optional(), status: z.string().optional() }).passthrough()).optional(),
});
const MeetingWire = MeetingFieldsWire.passthrough();

/**
 * A meeting, as attendees may see it. Zoom's `start_url` (which signs whoever opens it in as the host, and expires
 * after two hours) and `dynamic_host_key` are taken out, so a meeting can be stored, logged or sent without leaking
 * them. The host's link is `meetings.startUrl(ctx, meetingId)`, read fresh when the host needs it.
 */
export type Meeting = z.output<typeof MeetingFieldsWire> & { start_url?: never; dynamic_host_key?: never; [field: string]: unknown };
export const Meeting = MeetingWire.transform((wire): Meeting => withoutHostSecrets(wire) as Meeting);

export const HostStartUrl = z.object({ start_url: z.string().url() }).passthrough().transform((m) => m.start_url);

const MeetingSummaryFields = z.object({
  id: z.number(),
  uuid: z.string().optional(),
  host_id: z.string().optional(),
  topic: z.string().optional(),
  type: z.number().optional(),
  start_time: z.string().optional(),
  duration: z.number().optional(),
  timezone: z.string().optional(),
  join_url: z.string().optional(),
  created_at: z.string().optional(),
});
export type MeetingSummary = z.output<typeof MeetingSummaryFields> & { start_url?: never; [field: string]: unknown };
export const MeetingSummary = MeetingSummaryFields.passthrough().transform((wire): MeetingSummary => withoutHostSecrets(wire) as MeetingSummary);

/** Zoom's host-only fields: the start link signs whoever opens it in as the host, and the host key claims host. */
function withoutHostSecrets(wire: Record<string, unknown>): Record<string, unknown> {
  const { start_url: _startUrl, dynamic_host_key: _hostKey, ...rest } = wire;
  return rest;
}

export const MeetingPage = z
  .object({
    meetings: z.array(MeetingSummary).default([]),
    /** Empty or missing on the last page. */
    next_page_token: z.string().optional(),
    page_size: z.number().optional(),
    total_records: z.number().optional(),
  })
  .passthrough();
export type MeetingPage = z.output<typeof MeetingPage>;

export const PastMeeting = z
  .object({
    id: z.number(),
    uuid: z.string(),
    host_id: z.string().optional(),
    topic: z.string().optional(),
    type: z.number().optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    /** Minutes. */
    duration: z.number().optional(),
    total_minutes: z.number().optional(),
    participants_count: z.number().optional(),
  })
  .passthrough();
export type PastMeeting = z.infer<typeof PastMeeting>;

export const Participant = z
  .object({
    /** The participant's Zoom user id when they signed in; empty when they didn't. */
    id: z.string().optional(),
    /** An id for this meeting only. Someone who leaves and rejoins gets another. */
    user_id: z.string().optional(),
    name: z.string().optional(),
    /** Empty for someone outside the host's account, with some exceptions. */
    user_email: z.string().optional(),
    join_time: z.string().optional(),
    leave_time: z.string().optional(),
    /** Seconds. */
    duration: z.number().optional(),
    status: z.string().optional(),
  })
  .passthrough();
export type Participant = z.infer<typeof Participant>;

export const ParticipantPage = z
  .object({
    participants: z.array(Participant).default([]),
    next_page_token: z.string().optional(),
    page_size: z.number().optional(),
    total_records: z.number().optional(),
  })
  .passthrough();
export type ParticipantPage = z.infer<typeof ParticipantPage>;

export const RecordingFile = z
  .object({
    id: z.string().optional(),
    meeting_id: z.string().optional(),
    recording_start: z.string().optional(),
    recording_end: z.string().optional(),
    /** `MP4` (video), `M4A` (audio), `TRANSCRIPT` (VTT), `CC` (captions, VTT), `CHAT`, `TIMELINE`, `SUMMARY`… */
    file_type: z.string().optional(),
    file_extension: z.string().optional(),
    /** Bytes. */
    file_size: z.number().optional(),
    play_url: z.string().optional(),
    /** Download it with `recordings.download`: it needs the app's token. */
    download_url: z.string().optional(),
    /** `completed`, or `processing` while Zoom is still making it. */
    status: z.string().optional(),
    recording_type: z.string().optional(),
  })
  .passthrough();
export type RecordingFile = z.infer<typeof RecordingFile>;

export const Recording = z
  .object({
    id: z.number(),
    uuid: z.string(),
    host_id: z.string().optional(),
    topic: z.string().optional(),
    start_time: z.string().optional(),
    duration: z.number().optional(),
    total_size: z.number().optional(),
    recording_count: z.number().optional(),
    share_url: z.string().optional(),
    recording_files: z.array(RecordingFile).default([]),
  })
  .passthrough();
export type Recording = z.infer<typeof Recording>;

export const Transcript = z
  .object({
    meeting_id: z.string(),
    meeting_topic: z.string().optional(),
    host_id: z.string().optional(),
    transcript_created_time: z.string().optional(),
    /** Only when true is there a `download_url`. */
    can_download: z.boolean(),
    download_url: z.string().nullish(),
    /** Why not yet, when `can_download` is false: `NOT_READY`, `NO_TRANSCRIPT_DATA`, `DELETED_OR_TRASHED`, `UNSUPPORTED`. */
    download_restriction_reason: z.string().nullish(),
  })
  .passthrough();
export type Transcript = z.infer<typeof Transcript>;

export const User = z
  .object({
    id: z.string(),
    email: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    display_name: z.string().optional(),
    timezone: z.string().optional(),
    /** `active`, `inactive` or `pending`. */
    status: z.string().optional(),
    type: z.number().optional(),
  })
  .passthrough();
export type User = z.infer<typeof User>;

export const TokenResponse = z.object({ access_token: z.string().min(1), token_type: z.string().optional(), expires_in: z.number().positive(), scope: z.string().optional() }).passthrough();

/** A meeting id as Zoom sends it in a webhook: a number in some events, text in others. Always a number here. */
const WebhookMeetingId = z
  .union([z.number(), z.string()])
  .optional()
  .transform((v) => (typeof v === 'number' ? v : v && /^\d+$/.test(v) ? Number(v) : undefined));

export const WebhookParticipant = z
  .object({
    /** An id for this meeting only. */
    user_id: z.string().optional(),
    user_name: z.string().optional(),
    email: z.string().optional(),
    /** The participant's Zoom user id when they signed in. */
    id: z.string().optional(),
    participant_uuid: z.string().optional(),
    join_time: z.string().optional(),
    leave_time: z.string().optional(),
    registrant_id: z.string().optional(),
  })
  .passthrough();

export const WebhookObject = z
  .object({
    id: WebhookMeetingId,
    /** This instance of the meeting: what to store, and what to read its recording and transcript by. */
    uuid: z.string().optional(),
    host_id: z.string().optional(),
    topic: z.string().optional(),
    type: z.number().optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    duration: z.number().optional(),
    timezone: z.string().optional(),
    /** On `meeting.participant_joined` and `meeting.participant_left`. */
    participant: WebhookParticipant.optional(),
    /** On `recording.completed` and `recording.transcript_completed`. */
    recording_files: z.array(RecordingFile).optional(),
  })
  .passthrough();

/**
 * What Zoom posts for an event: `{ event, event_ts, payload: { account_id, object } }`. A recording event's
 * `download_token` (a credential for its files, good for 24 hours) is dropped, so it never reaches a job's
 * payload: `recordings.download` uses the app's own token.
 */
export const ZoomEvent = z
  .object({
    event: z.string(),
    /** When it happened, in milliseconds. */
    event_ts: z.number(),
    payload: z.object({ account_id: z.string().optional(), object: WebhookObject }).passthrough(),
  })
  .passthrough()
  .transform(({ download_token: _downloadToken, ...event }) => event);
export type ZoomEvent = z.output<typeof ZoomEvent>;
