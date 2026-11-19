import type { SQL } from 'drizzle-orm';
import { RateLimitError, loadOptionalPeer } from '@mariachi/core';
import { rateLimitBucketsTable } from '../schema/index';
import type { RateLimitConfig, RateLimiter, RateLimitResult, RateLimitRule, SqlExecutor } from '../types';

/*
 * Concurrency. Each check is one `INSERT … ON CONFLICT (key) DO UPDATE … RETURNING` statement, with
 * the whole algorithm in its SET. Postgres locks the key's row before it evaluates the SET, and on a
 * conflict evaluates it against the newest committed version of the row (not the statement's
 * snapshot), so concurrent checks on one key, from any number of connections or processes, are
 * applied one after another, each seeing the last one's result. Two first checks on a new key are
 * the same: the second waits for the first's insert and then takes the update path. The row lock is
 * held only for the statement, there is one round trip, and nothing needs a transaction or a
 * session, so it also works through a transaction-pooling proxy (where advisory locks don't).
 *
 * Time. The statement reads the database server's clock once (`clock_timestamp()` in a
 * materialized CTE), the way the Redis adapter uses Redis TIME. A statement that read its clock
 * and then waited for the row lock can be a moment behind the one it waited for, so the time used is
 * never earlier than the row's `updated_ms`: a key's clock only moves forward.
 *
 * Expiry. A check rewrites its own key's row, so a key in use never accumulates anything. Rows of
 * keys no longer in use (`expires_at` passed) are deleted by `sweep()`, which `check` starts in the
 * background at most once per `sweepIntervalMs` in each process. No cron is needed.
 */

type DrizzleSql = typeof import('drizzle-orm').sql;

/** drizzle-orm, loaded on first use: an app that uses Postgres has it installed with `@mariachi/database-postgres`. */
function drizzleSql(): DrizzleSql {
  return loadOptionalPeer<typeof import('drizzle-orm')>('drizzle-orm', 'PostgresRateLimiter', import.meta.url).sql;
}

const TABLE = rateLimitBucketsTable.tableName;
/** The columns a check writes after `key` and `algorithm`, in the order every step selects them. */
const STATE = 'window_start, used, hits, tokens, allowed, updated_ms, expires_at';
const SWEEP_BATCH = 1_000;

export type RateLimitAlgorithm = NonNullable<RateLimitRule['algorithm']>;

/** What the statement returns, all numbers as float8 so the driver hands back numbers. */
export interface BucketRow {
  allowed: boolean;
  now: number;
  window_start: number | null;
  used: number | null;
  tokens: number | null;
  /** Sliding window: the cost recorded in the window, and when its oldest entry was made. */
  hit_cost: number | null;
  oldest_hit: number | null;
}

/**
 * The SELECT that computes a key's next state from `p` (its previous state, all null for a new key
 * or one last written by another algorithm) and `clock.ms`. Its columns are `STATE`, in order.
 */
function step(sql: DrizzleSql, algorithm: RateLimitAlgorithm, rule: RateLimitRule): SQL {
  const windowMs = sql`${rule.windowMs}::bigint`;
  const max = sql`${rule.maxRequests}::float8`;
  const cost = sql`${rule.cost ?? 1}::float8`;
  const now = sql`(SELECT greatest(clock.ms, p.updated_ms) AS now) n`;
  if (algorithm === 'fixed-window') {
    return sql`
      SELECT w.ws, CASE WHEN d.ok THEN c.cur + ${cost} ELSE c.cur END, NULL::jsonb, NULL::float8, d.ok, n.now,
             to_timestamp((w.ws + ${windowMs}) / 1000.0)
      FROM ${now}
      CROSS JOIN LATERAL (SELECT n.now - n.now % ${windowMs} AS ws) w
      CROSS JOIN LATERAL (SELECT CASE WHEN p.window_start = w.ws THEN p.used ELSE 0 END AS cur) c
      CROSS JOIN LATERAL (SELECT c.cur + ${cost} <= ${max} AS ok) d`;
  }
  if (algorithm === 'token-bucket') {
    // maxRequests tokens, refilled evenly over windowMs. A bucket untouched for windowMs is full, so
    // the row can go then.
    return sql`
      SELECT NULL::bigint, NULL::float8, NULL::jsonb, CASE WHEN d.ok THEN h.have - ${cost} ELSE h.have END, d.ok, n.now,
             to_timestamp((n.now + ${windowMs}) / 1000.0)
      FROM ${now}
      CROSS JOIN LATERAL (
        SELECT least(${max}, coalesce(p.tokens, ${max}) + greatest(0, n.now - coalesce(p.updated_ms, n.now)) * ${max} / ${windowMs}) AS have
      ) h
      CROSS JOIN LATERAL (SELECT h.have >= ${cost} AS ok) d`;
  }
  // Sliding window: the admitted requests of the last windowMs, as [time, cost] pairs. Entries at or
  // before now - windowMs are dropped (as ZREMRANGEBYSCORE does in the Redis adapter), and the row
  // can go windowMs after its newest entry.
  return sql`
    SELECT NULL::bigint, NULL::float8,
           CASE WHEN d.ok THEN l.live || jsonb_build_array(jsonb_build_array(n.now, ${cost})) ELSE l.live END,
           NULL::float8, d.ok, n.now,
           to_timestamp((CASE WHEN d.ok THEN n.now ELSE coalesce(l.newest, n.now) END + ${windowMs}) / 1000.0)
    FROM ${now}
    CROSS JOIN LATERAL (
      SELECT coalesce(jsonb_agg(e ORDER BY (e->>0)::bigint), '[]'::jsonb) AS live,
             coalesce(sum((e->>1)::float8), 0) AS spent,
             max((e->>0)::bigint) AS newest
      FROM jsonb_array_elements(coalesce(p.hits, '[]'::jsonb)) e
      WHERE (e->>0)::bigint > n.now - ${windowMs}
    ) l
    CROSS JOIN LATERAL (SELECT l.spent + ${cost} <= ${max} AS ok) d`;
}

/** The one statement a check runs. */
export function checkStatement(sql: DrizzleSql, key: string, algorithm: RateLimitAlgorithm, rule: RateLimitRule): SQL {
  const table = sql.raw(`"${TABLE}"`);
  const state = sql.raw(STATE);
  return sql`
    WITH clock AS MATERIALIZED (SELECT (extract(epoch FROM clock_timestamp()) * 1000)::bigint AS ms)
    INSERT INTO ${table} AS b (key, algorithm, ${state})
    SELECT ${key}::text, ${algorithm}::text, s.*
    FROM clock
    LEFT JOIN (
      SELECT NULL::bigint AS window_start, NULL::float8 AS used, NULL::jsonb AS hits, NULL::float8 AS tokens, NULL::bigint AS updated_ms
      WHERE false
    ) p ON true
    CROSS JOIN LATERAL (${step(sql, algorithm, rule)}) s
    ON CONFLICT (key) DO UPDATE SET (algorithm, ${state}) = (
      SELECT ${algorithm}::text, s.*
      FROM clock
      LEFT JOIN LATERAL (
        SELECT b.window_start, b.used, b.hits, b.tokens, b.updated_ms WHERE b.algorithm = ${algorithm}::text
      ) p ON true
      CROSS JOIN LATERAL (${step(sql, algorithm, rule)}) s
    )
    RETURNING allowed, updated_ms::float8 AS now, window_start::float8 AS window_start, used, tokens,
      (SELECT sum((e->>1)::float8) FROM jsonb_array_elements(coalesce(hits, '[]'::jsonb)) e) AS hit_cost,
      (hits->0->>0)::float8 AS oldest_hit`;
}

/** Turns the statement's row into a result, with the same numbers the Redis adapter gives. */
export function toResult(algorithm: RateLimitAlgorithm, rule: RateLimitRule, row: BucketRow): RateLimitResult {
  const limit = rule.maxRequests;
  const cost = rule.cost ?? 1;
  const now = Number(row.now);
  let remaining: number;
  let resetAt: number;
  if (algorithm === 'fixed-window') {
    remaining = limit - Number(row.used ?? 0);
    resetAt = Number(row.window_start) + rule.windowMs;
  } else if (algorithm === 'token-bucket') {
    const tokens = Number(row.tokens ?? 0);
    const missing = row.allowed ? limit - tokens : cost - tokens;
    remaining = Math.floor(tokens);
    // Admitted: when the bucket is full again. Refused: when there are enough tokens for this cost.
    resetAt = now + Math.ceil((missing * rule.windowMs) / limit);
  } else {
    remaining = limit - Number(row.hit_cost ?? 0);
    resetAt = (row.oldest_hit === null ? now : Number(row.oldest_hit)) + rule.windowMs;
  }
  return {
    allowed: row.allowed,
    limit,
    remaining: Math.max(0, remaining),
    resetAt: new Date(resetAt),
    retryAfterMs: row.allowed ? 0 : Math.max(0, resetAt - now),
  };
}

/** postgres.js returns rows as an array; node-postgres as `{ rows }`. */
function rowsOf<T>(result: unknown): T[] {
  return Array.isArray(result) ? (result as T[]) : ((result as { rows?: T[] } | undefined)?.rows ?? []);
}

export interface PostgresRateLimiterOptions extends Pick<RateLimitConfig, 'prefix' | 'sweepIntervalMs'> {
  /** The app's database (`createPostgresDatabase(...).db`). Not a transaction: a check commits on its own. */
  db: SqlExecutor;
  /** For tests: the clock that spaces out sweeps. Limits always use the database server's clock. */
  now?: () => number;
}

/**
 * Rate limits kept in Postgres (the `rate_limit_buckets` table from `@mariachi/rate-limit/schema`),
 * shared by every process that uses the same database, with the same algorithms and results as
 * `RedisRateLimiter`. Each check is one statement. Add the table to your schema and migrate.
 */
export class PostgresRateLimiter implements RateLimiter {
  private readonly db: SqlExecutor;
  private readonly prefix: string;
  private readonly sweepIntervalMs: number;
  private readonly now: () => number;
  private lastSweep = Number.NEGATIVE_INFINITY;
  private sweeping: Promise<unknown> | undefined;

  constructor(options: PostgresRateLimiterOptions) {
    if (!options?.db) {
      throw new RateLimitError('rate-limit/database-required', 'The postgres rate limiter needs `db`: the app database (createPostgresDatabase(...).db)');
    }
    this.db = options.db;
    this.prefix = options.prefix ?? 'ratelimit';
    this.sweepIntervalMs = options.sweepIntervalMs ?? 60_000;
    this.now = options.now ?? Date.now;
  }

  async connect(): Promise<void> {}

  /** Waits for a sweep in progress. The database itself belongs to the app, which closes it. */
  async disconnect(): Promise<void> {
    await this.sweeping;
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.db.execute(drizzleSql()`select 1`);
      return true;
    } catch {
      return false;
    }
  }

  async reset(key: string): Promise<void> {
    const sql = drizzleSql();
    try {
      await this.db.execute(sql`DELETE FROM ${sql.raw(`"${TABLE}"`)} WHERE key = ${`${this.prefix}:${key}`}::text`);
    } catch (cause) {
      throw new RateLimitError('rate-limit/backend-failed', 'Rate limit backend unavailable', { cause });
    }
  }

  async check(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
    const algorithm: RateLimitAlgorithm = rule.algorithm ?? 'sliding-window';
    let row: BucketRow | undefined;
    try {
      [row] = rowsOf<BucketRow>(await this.db.execute(checkStatement(drizzleSql(), `${this.prefix}:${key}`, algorithm, rule)));
    } catch (cause) {
      throw new RateLimitError('rate-limit/backend-failed', 'Rate limit backend unavailable', { cause });
    }
    if (!row) throw new RateLimitError('rate-limit/backend-failed', 'Rate limit backend returned no row');
    this.sweepIfDue();
    return toResult(algorithm, rule, row);
  }

  /**
   * Deletes the rows of keys whose windows have passed, in batches, and returns how many went.
   * `check` runs it in the background; call it yourself only to clean up at a time of your choosing.
   * Rows a check holds at that moment are skipped, never waited for.
   */
  async sweep(): Promise<number> {
    const sql = drizzleSql();
    const table = sql.raw(`"${TABLE}"`);
    let deleted = 0;
    for (;;) {
      const [result] = rowsOf<{ deleted: number }>(
        await this.db.execute(sql`
          WITH gone AS (
            DELETE FROM ${table} WHERE key IN (
              SELECT key FROM ${table} WHERE expires_at < clock_timestamp() LIMIT ${SWEEP_BATCH} FOR UPDATE SKIP LOCKED
            ) RETURNING 1
          )
          SELECT count(*)::int AS deleted FROM gone`),
      );
      const batch = Number(result?.deleted ?? 0);
      deleted += batch;
      if (batch < SWEEP_BATCH) return deleted;
    }
  }

  /** One sweep at a time per process, at most once per interval. A failed sweep is tried again next interval. */
  private sweepIfDue(): void {
    if (this.sweepIntervalMs <= 0 || this.sweeping) return;
    const now = this.now();
    if (now - this.lastSweep < this.sweepIntervalMs) return;
    this.lastSweep = now;
    this.sweeping = this.sweep()
      .catch(() => undefined)
      .finally(() => {
        this.sweeping = undefined;
      });
  }
}
