import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createAI } from '../index';
import { AnthropicAdapter, anthropicBaseUrl } from './anthropic';
import { GoogleAdapter } from './google';
import { OpenAIAdapter } from './openai';
import { lazyPeer } from './peer';

interface Seen {
  url: string;
  headers: Headers;
  body: Record<string, unknown>;
}

/** A `fetch` that records each request and answers with `reply`. */
function recorder(reply: unknown) {
  const seen: Seen[] = [];
  const fetch: typeof globalThis.fetch = async (input, init) => {
    seen.push({
      url: typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
      headers: new Headers(init?.headers),
      body: JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>,
    });
    return new Response(JSON.stringify(reply), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  return { seen, fetch };
}

const anthropicReply = {
  id: 'msg_1',
  type: 'message',
  role: 'assistant',
  model: 'claude-sonnet-5-5',
  content: [{ type: 'text', text: 'hello' }],
  stop_reason: 'end_turn',
  stop_sequence: null,
  usage: { input_tokens: 3, output_tokens: 2 },
};

const lookup = { name: 'lookup', description: 'Look something up', schema: z.object({ q: z.string() }), handler: async () => 'x' };
const hi = [{ role: 'user' as const, content: 'hi' }];

describe('anthropicBaseUrl', () => {
  it('adds /v1 to a bare host and keeps a URL that already has it', () => {
    expect(anthropicBaseUrl('https://ai.example.com')).toBe('https://ai.example.com/v1');
    expect(anthropicBaseUrl('https://ai.example.com/')).toBe('https://ai.example.com/v1');
    expect(anthropicBaseUrl('https://ai.example.com/v1')).toBe('https://ai.example.com/v1');
    expect(anthropicBaseUrl('https://ai.example.com/v1/')).toBe('https://ai.example.com/v1');
    expect(anthropicBaseUrl('https://example.com/proxy/anthropic')).toBe('https://example.com/proxy/anthropic/v1');
    expect(anthropicBaseUrl(undefined)).toBeUndefined();
  });
});

describe('AnthropicAdapter', () => {
  it.each(['https://ai.example.com', 'https://ai.example.com/v1'])('calls the Messages API at %s with the key in x-api-key', async (baseURL) => {
    const { seen, fetch } = recorder(anthropicReply);
    const adapter = new AnthropicAdapter({ apiKey: 'key-1', baseURL, fetch });
    const response = await adapter.generate(hi);
    expect(response).toMatchObject({ content: 'hello', model: 'claude-sonnet-5-5', usage: { inputTokens: 3, outputTokens: 2, totalTokens: 5 } });
    expect(seen).toHaveLength(1);
    expect(seen[0].url).toBe('https://ai.example.com/v1/messages');
    expect(seen[0].headers.get('x-api-key')).toBe('key-1');
    expect(seen[0].headers.get('authorization')).toBeNull();
    expect(seen[0].body.model).toBe('claude-sonnet-5-5');
  });

  it('sends no anthropic-beta header, with or without tools', async () => {
    const { seen, fetch } = recorder(anthropicReply);
    const adapter = new AnthropicAdapter({ apiKey: 'k', baseURL: 'https://ai.example.com', fetch });
    await adapter.generate(hi);
    await adapter.generate(hi, { tools: [lookup] });
    expect(seen).toHaveLength(2);
    expect((seen[1].body.tools as Array<{ name: string }>)[0].name).toBe('lookup');
    for (const request of seen) expect(request.headers.get('anthropic-beta')).toBeNull();
  });

  it('lets beta headers through when asked', async () => {
    const { seen, fetch } = recorder(anthropicReply);
    const adapter = new AnthropicAdapter({ apiKey: 'k', baseURL: 'https://ai.example.com', fetch, allowBetaHeaders: true });
    await adapter.generate(hi, { tools: [lookup] });
    // What @ai-sdk/anthropic adds for tools on this model; if this starts failing, the default strip may no longer be needed.
    expect(seen[0].headers.get('anthropic-beta')).toContain('structured-outputs');
  });

  it('sends the user id as metadata.user_id only when forwardUserId is set', async () => {
    const off = recorder(anthropicReply);
    await new AnthropicAdapter({ apiKey: 'k', fetch: off.fetch }).generate(hi, { userId: 'user-1' });
    expect(off.seen[0].body.metadata).toBeUndefined();
    expect(off.seen[0].url).toBe('https://api.anthropic.com/v1/messages');

    const on = recorder(anthropicReply);
    const adapter = new AnthropicAdapter({ apiKey: 'k', fetch: on.fetch, forwardUserId: true });
    await adapter.generate(hi, { userId: 'user-1' });
    await adapter.generate(hi);
    expect(on.seen[0].body.metadata).toEqual({ user_id: 'user-1' });
    expect(on.seen[1].body.metadata).toBeUndefined();
  });

  it('turns a provider failure into ai/request-failed', async () => {
    const fetch: typeof globalThis.fetch = async () =>
      new Response(JSON.stringify({ type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } }), { status: 401, headers: { 'content-type': 'application/json' } });
    await expect(new AnthropicAdapter({ apiKey: 'bad', fetch }).generate(hi)).rejects.toMatchObject({ code: 'ai/request-failed', metadata: { provider: 'anthropic' } });
  });
});

describe('OpenAIAdapter', () => {
  const chatReply = {
    id: 'chatcmpl-1',
    object: 'chat.completion',
    created: 1,
    model: 'local-model',
    choices: [{ index: 0, message: { role: 'assistant', content: 'hello' }, finish_reason: 'stop' }],
    usage: { prompt_tokens: 3, completion_tokens: 2, total_tokens: 5 },
  };

  it('uses Chat Completions at a custom baseURL', async () => {
    const { seen, fetch } = recorder(chatReply);
    const adapter = new OpenAIAdapter({ apiKey: 'k', baseURL: 'http://localhost:11434/v1', defaultModel: 'local-model', fetch });
    const response = await adapter.generate(hi);
    expect(response.content).toBe('hello');
    expect(seen[0].url).toBe('http://localhost:11434/v1/chat/completions');
    expect(seen[0].headers.get('authorization')).toBe('Bearer k');
  });
});

describe('GoogleAdapter', () => {
  it('calls the model named in config at the given baseURL', async () => {
    const { seen, fetch } = recorder({
      candidates: [{ content: { role: 'model', parts: [{ text: 'hello' }] }, finishReason: 'STOP', index: 0 }],
      usageMetadata: { promptTokenCount: 3, candidatesTokenCount: 2, totalTokenCount: 5 },
    });
    const adapter = new GoogleAdapter({ apiKey: 'k', baseURL: 'https://gemini.example.com/v1beta', defaultModel: 'some-gemini-model', fetch });
    const response = await adapter.generate(hi);
    expect(response.content).toBe('hello');
    expect(seen[0].url).toBe('https://gemini.example.com/v1beta/models/some-gemini-model:generateContent');
  });

  it('refuses a call with no model', async () => {
    await expect(new GoogleAdapter({ apiKey: 'k' }).generate(hi)).rejects.toMatchObject({ code: 'ai/config' });
  });
});

describe('lazyPeer', () => {
  it('names the package to install when it is missing, and tries again next time', async () => {
    let attempts = 0;
    const load = lazyPeer('@example/missing', 'ExampleAdapter', async () => {
      attempts++;
      throw Object.assign(new Error("Cannot find package '@example/missing'"), { code: 'ERR_MODULE_NOT_FOUND' });
    });
    await expect(load()).rejects.toMatchObject({ code: 'dependency/missing-peer', metadata: { pkg: '@example/missing' } });
    await expect(load()).rejects.toMatchObject({ code: 'dependency/missing-peer' });
    expect(attempts).toBe(2);
  });

  it('imports once', async () => {
    let attempts = 0;
    const load = lazyPeer('x', 'X', async () => ++attempts);
    expect(await load()).toBe(1);
    expect(await load()).toBe(1);
  });
});

describe('createAI', () => {
  it("builds the Anthropic and Google adapters from 'adapter'", () => {
    expect(() => createAI({ adapter: 'anthropic', apiKey: 'k', baseURL: 'https://ai.example.com' })).not.toThrow();
    expect(() => createAI({ adapter: 'google', apiKey: 'k', defaultModel: 'some-gemini-model' })).not.toThrow();
    expect(() => createAI({ adapter: 'google', apiKey: 'k' })).toThrow(/defaultModel/);
    expect(() => createAI({ adapter: 'nope' })).toThrow(/Unknown adapter/);
  });
});
