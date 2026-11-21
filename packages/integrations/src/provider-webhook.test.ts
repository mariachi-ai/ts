import { createContext } from '@mariachi/core';
import { TestTracer } from '@mariachi/testing';
import { describe, expect, it } from 'vitest';
import { WebhookSignatureError, hmac, parseSignatureHeader, receiveProviderWebhook, safeEqual, verifyStandardWebhook, withinTolerance } from './provider-webhook';
import { assertProviderSpans } from './testing';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger });

describe('signature checks', () => {
  it('parses the t=…,v1=… and ts=…;h1=… headers', () => {
    expect([...parseSignatureHeader('t=1,v1=a,v1=b')]).toEqual([['t', ['1']], ['v1', ['a', 'b']]]);
    expect(parseSignatureHeader('ts=9;h1=c', ';').get('h1')).toEqual(['c']);
    expect(parseSignatureHeader(undefined).size).toBe(0);
  });

  it('compares in constant time, and checks the timestamp window', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'abcd')).toBe(false);
    expect(withinTolerance(1000, 300, 1_200_000)).toBe(true);
    expect(withinTolerance(1000, 300, 1_400_000)).toBe(false);
  });

  it('checks a Standard Webhooks signature (Svix), and refuses a stale or wrong one', () => {
    const secret = `whsec_${Buffer.from('a-secret-key').toString('base64')}`;
    const now = 1_700_000_000_000;
    const timestamp = String(now / 1000);
    const body = '{"type":"user.created"}';
    const sig = hmac('sha256', Buffer.from('a-secret-key'), `msg_1.${timestamp}.${body}`, 'base64');
    expect(verifyStandardWebhook({ secret, id: 'msg_1', timestamp, signature: `v1,nope v1,${sig}`, rawBody: body, now })).toBe(true);
    expect(verifyStandardWebhook({ secret, id: 'msg_1', timestamp, signature: `v1,${sig}`, rawBody: `${body} `, now })).toBe(false);
    expect(verifyStandardWebhook({ secret, id: 'msg_1', timestamp, signature: `v1,${sig}`, rawBody: body, now: now + 3_600_000 })).toBe(false);
    expect(verifyStandardWebhook({ secret, id: undefined, timestamp, signature: `v1,${sig}`, rawBody: body, now })).toBe(false);
  });
});

describe('receiveProviderWebhook', () => {
  it('makes a SERVER span with the event, and an error span when the check fails', async () => {
    const tracer = new TestTracer();
    const got = await receiveProviderWebhook(ctx, 'acme', () => ({ event: 'invoice.paid', payload: { id: 1 } }), { tracer });
    expect(got.event).toBe('invoice.paid');
    await expect(receiveProviderWebhook(ctx, 'acme', () => { throw new WebhookSignatureError('acme'); }, { tracer })).rejects.toMatchObject({ code: 'acme/invalid-signature', statusCode: 401 });
    expect(tracer.spans.map((s) => [s.name, s.kind, s.status?.status, s.attributes['mariachi.integration.event']])).toEqual([
      ['acme webhook', 'server', 'ok', 'invoice.paid'],
      ['acme webhook', 'server', 'error', undefined],
    ]);
    assertProviderSpans(tracer.spans);
  });
});
