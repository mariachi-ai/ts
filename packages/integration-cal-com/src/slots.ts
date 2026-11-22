import { ValidationError } from '@mariachi/core';
import type { SlotsByDate } from './schemas';

/** A free slot in UTC: ISO times ending in `Z`. */
export interface FreeSlot {
  start: string;
  end: string;
}

/**
 * `slots.list`'s answer as one list of `{ start, end }` in UTC, earliest first, each slot once. Cal.com groups slots
 * by date in the time zone asked for and writes each time with that zone's offset, so comparing or storing them as
 * they come goes wrong across zones and daylight-saving changes; these compare as strings and pass straight to
 * `bookings.create({ start })`.
 *
 * Each slot's end is Cal.com's (the client asks for ranges). For an answer without ends, give `durationMinutes`.
 */
export function slotList(byDate: SlotsByDate, options: { durationMinutes?: number } = {}): FreeSlot[] {
  const seen = new Map<number, FreeSlot>();
  for (const slots of Object.values(byDate)) {
    for (const slot of slots) {
      const start = Date.parse(slot.start);
      if (Number.isNaN(start)) throw new ValidationError(`Cal.com slot start "${slot.start}" isn't a time`);
      let end: number;
      if (slot.end !== undefined) end = Date.parse(slot.end);
      else if (options.durationMinutes !== undefined) end = start + options.durationMinutes * 60_000;
      else throw new ValidationError('A Cal.com slot has no end: pass durationMinutes, the event type\'s length');
      if (Number.isNaN(end)) throw new ValidationError(`Cal.com slot end "${slot.end}" isn't a time`);
      seen.set(start, { start: new Date(start).toISOString(), end: new Date(end).toISOString() });
    }
  }
  return [...seen.entries()].sort(([a], [b]) => a - b).map(([, slot]) => slot);
}
