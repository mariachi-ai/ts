import { describe, expect, it } from 'vitest';
import * as ai from '@mariachi/ai/schema';
import * as audit from '@mariachi/audit/schema';
import * as auth from '@mariachi/auth/schema';
import * as billing from '@mariachi/billing/schema';
import * as config from '@mariachi/config/schema';
import * as database from '@mariachi/database/schema';
import * as events from '@mariachi/events/schema';
import * as notifications from '@mariachi/notifications/schema';
import * as webhooks from '@mariachi/webhooks/schema';
import * as all from './index';

const owners = { ai, audit, auth, billing, config, database, events, notifications, webhooks };

describe('@mariachi/schema', () => {
  it.each(Object.entries(owners))('re-exports every table of @mariachi/%s', (_name, owner) => {
    const tables = Object.keys(owner).filter((key) => key.endsWith('Table'));
    expect(tables.length).toBeGreaterThan(0);
    for (const table of tables) {
      expect(all, `${table} is missing from @mariachi/schema`).toHaveProperty(table);
      expect((all as Record<string, unknown>)[table]).toBe((owner as Record<string, unknown>)[table]);
    }
  });

  it('gives every table its own name in the database', () => {
    const names = Object.values(all).map((table) => table.tableName);
    expect(new Set(names).size).toBe(names.length);
  });
});
