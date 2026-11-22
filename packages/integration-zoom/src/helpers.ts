import type { Recording, RecordingFile } from './schemas';

/**
 * A meeting number or instance UUID as a path segment. Zoom needs a UUID that contains `/` encoded twice
 * (`/ajXp112QmuoKj4854875==` becomes `%252FajXp112QmuoKj4854875%253D%253D`); anything else is encoded once.
 */
export function meetingPathId(id: number | string): string {
  const text = String(id);
  const once = encodeURIComponent(text);
  return text.includes('/') ? encodeURIComponent(once) : once;
}

/**
 * The finished file of one type in a recording: `'MP4'` (video), `'M4A'` (audio), `'TRANSCRIPT'` (the audio
 * transcript, WebVTT), `'CC'` (closed captions, WebVTT), `'CHAT'`. Undefined while Zoom is still processing it or
 * when the meeting has none. Download it with `zoom.recordings.download(ctx, { downloadUrl: file.download_url })`.
 */
export function recordingFile(recording: Pick<Recording, 'recording_files'>, fileType: string): (RecordingFile & { download_url: string }) | undefined {
  return recording.recording_files.find((f): f is RecordingFile & { download_url: string } => f.file_type === fileType && f.status !== 'processing' && typeof f.download_url === 'string');
}

/** The recording's audio transcript (WebVTT), once it's ready: `recordingFile(recording, 'TRANSCRIPT')`. */
export function transcriptFile(recording: Pick<Recording, 'recording_files'>): (RecordingFile & { download_url: string }) | undefined {
  return recordingFile(recording, 'TRANSCRIPT');
}
