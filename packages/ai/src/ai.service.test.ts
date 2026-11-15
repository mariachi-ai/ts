import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { MockLanguageModelV4, convertArrayToReadableStream } from 'ai/test';
import { AIError, createContext, type Context } from '@mariachi/core';
import { AISdkAdapter } from './adapters/ai-sdk';
import { DefaultAI } from './ai';
import { createAI, runAgent, toSse } from './index';
import type { Adapter, AdapterCallConfig, AISessionStore, SessionState } from './session/manager';
import type { AIMessage, AIResponse, AITelemetryEntry, StreamChunk, ToolDefinition } from './types';

const warnings: Array<Record<string, unknown>> = [];
const logger = { info() {}, warn: (fields: Record<string, unknown>) => void warnings.push(fields), error() {}, debug() {}, child: () => logger };
const ctx: Context = createContext({ userId: 'u1', tenantId: 't1', identityType: 'session', logger });
const reply = (content: string, extra: Partial<AIResponse> = {}): AIResponse => ({ content, usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 }, model: 'm1', latencyMs: 1, ...extra });
const costTable = { m1: { input: 1, output: 2 } };
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

/** A scripted adapter: each call takes the next step, and every call's messages and config are kept. */
function scripted(steps: Array<AIResponse | Error | ((config: AdapterCallConfig) => AsyncIterable<StreamChunk>)>) {
  const calls: Array<{ messages: AIMessage[]; config: AdapterCallConfig }> = [];
  const next = (messages: AIMessage[], config: AdapterCallConfig) => {
    calls.push({ messages: [...messages], config });
    const step = steps.shift();
    if (step === undefined) throw new AIError('ai/request-failed', 'the script has no more steps');
    return step;
  };
  const adapter: Adapter = {
    async generate(messages, config) {
      const step = next(messages, config);
      if (step instanceof Error) throw step;
      if (typeof step === 'function') throw new AIError('ai/request-failed', 'a stream step was asked to generate');
      return step;
    },
    async *stream(messages, config) {
      const step = next(messages, config);
      if (step instanceof Error) throw step;
      if (typeof step === 'function') yield* step(config);
      else {
        yield { content: step.content, done: false };
        yield { content: '', done: true, usage: step.usage, model: step.model, toolCalls: step.toolCalls };
      }
    },
  };
  return { adapter, calls };
}

function build(steps: Parameters<typeof scripted>[0], options: { sessions?: AISessionStore; persistTelemetry?: (entry: AITelemetryEntry) => void | Promise<void> } = {}) {
  const script = scripted(steps);
  const ai = new DefaultAI(createAI({ adapter: 'custom', instance: script.adapter, costTable, ...options }), { logger });
  return { ai, ...script };
}

const weather: ToolDefinition<{ city: string }> = {
  name: 'weather',
  description: 'The weather in a city',
  schema: z.object({ city: z.string() }),
  handler: async ({ city }, toolCtx) => ({ city, sky: 'clear', askedBy: toolCtx?.userId ?? null, tenant: toolCtx?.tenantId ?? null }),
};

describe('every model call is costed and recorded, however it is made', () => {
  it('send: one entry, with the cost and the caller', async () => {
    const { ai } = build([reply('hello')]);
    const session = await ai.createSession(ctx, 's-send', { model: 'm1' });
    await ai.send(ctx, session, 'hi');
    expect(ai.telemetry.getEntries('s-send')).toMatchObject([{ model: 'm1', inputTokens: 100, outputTokens: 50, costUsd: 0.2, tenantId: 't1', userId: 'u1' }]);
  });

  it('stream: the chunks as they come, then one entry with the usage of the last chunk', async () => {
    const { ai } = build([
      async function* () {
        yield { content: 'Hel', done: false };
        yield { content: 'lo', done: false };
        yield { content: '', done: true, usage: { inputTokens: 100, outputTokens: 50 }, model: 'm1' };
      },
    ]);
    const session = await ai.createSession(ctx, 's-stream', { model: 'm1' });
    const chunks: StreamChunk[] = [];
    for await (const chunk of ai.stream(ctx, session, 'hi')) chunks.push(chunk);
    expect(chunks.map((c) => c.content).join('')).toBe('Hello');
    expect(chunks.at(-1)).toMatchObject({ done: true, usage: { inputTokens: 100, outputTokens: 50 }, model: 'm1' });
    expect(ai.telemetry.getEntries('s-stream')).toMatchObject([{ model: 'm1', inputTokens: 100, outputTokens: 50, costUsd: 0.2, tenantId: 't1' }]);
    expect(session.getHistory().map((m) => [m.role, m.content])).toEqual([['user', 'hi'], ['assistant', 'Hello']]);
    expect(session.usage?.()).toEqual({ inputTokens: 100, outputTokens: 50, totalTokens: 150 });
  });

  it('stream: tool calls arrive on the last chunk and stay in the history', async () => {
    const toolCalls = [{ id: 'c1', name: 'weather', arguments: { city: 'Oaxaca' } }];
    const { ai } = build([reply('', { toolCalls })]);
    ai.registerTool(weather);
    const session = await ai.createSession(ctx, 's-stream-tools', { model: 'm1' });
    const chunks: StreamChunk[] = [];
    for await (const chunk of ai.stream(ctx, session, 'weather?')) chunks.push(chunk);
    expect(chunks.at(-1)?.toolCalls).toEqual(toolCalls);
    expect(session.getHistory().at(-1)).toMatchObject({ role: 'assistant', toolCalls });
  });

  it('runAgent: each model call in the run is an entry, and the tool gets the context', async () => {
    const { ai, calls } = build([reply('', { toolCalls: [{ id: 'c1', name: 'weather', arguments: { city: 'Oaxaca' } }] }), reply('Clear skies in Oaxaca.')]);
    ai.registerTool(weather);
    const session = await ai.createSession(ctx, 's-agent', { model: 'm1', toolNames: ['weather'] });
    const asked: string[] = [];
    const answer = await ai.runAgent(ctx, session, 'What is the weather in Oaxaca?', { onToolCall: (call) => asked.push(call.name) });
    expect(answer.content).toBe('Clear skies in Oaxaca.');
    expect(asked).toEqual(['weather']);
    expect(ai.telemetry.getEntries('s-agent')).toHaveLength(2);
    expect(ai.telemetry.getEntries('s-agent').reduce((sum, e) => sum + e.costUsd, 0)).toBeCloseTo(0.4);
    // The registered tool the session names is what the model was offered
    expect(calls[0].config.tools?.map((t) => t.name)).toEqual(['weather']);
    // And its result, made with the caller's context, went back to the model
    const result = JSON.parse(calls[1].messages.at(-1)?.content ?? '{}');
    expect(result).toMatchObject({ callId: 'c1', toolName: 'weather', result: { city: 'Oaxaca', askedBy: 'u1', tenant: 't1' } });
  });

  it('runAgent on its own records nothing, which is why ai.runAgent exists', async () => {
    const { ai } = build([reply('done')]);
    const session = await ai.createSession(ctx, 's-bare', { model: 'm1' });
    await runAgent(session, 'go');
    expect(ai.telemetry.getEntries('s-bare')).toEqual([]);
  });
});

describe('cancelling', () => {
  it('a reader who stops early cancels the provider call; what was written is kept and recorded', async () => {
    let signal: AbortSignal | undefined;
    const { ai } = build([
      async function* (config) {
        signal = config.signal;
        yield { content: 'one ', done: false };
        yield { content: 'two ', done: false };
        yield { content: 'three', done: false };
        yield { content: '', done: true, usage: { inputTokens: 100, outputTokens: 50 }, model: 'm1' };
      },
    ]);
    const session = await ai.createSession(ctx, 's-stop', { model: 'm1' });
    for await (const chunk of ai.stream(ctx, session, 'count')) {
      if (chunk.content === 'two ') break;
    }
    expect(signal?.aborted).toBe(true);
    // What was written stays, marked as cut short
    expect(session.getHistory()).toEqual([{ role: 'user', content: 'count' }, { role: 'assistant', content: 'one two ', toolCalls: undefined, interrupted: true }]);
    // The provider had reported no usage yet, so it is estimated (four characters a token) and says so
    expect(ai.telemetry.getEntries('s-stop')).toMatchObject([{ inputTokens: 2, outputTokens: 2, estimated: true, costUsd: 0.006 }]);
    expect(session.usage?.()).toEqual({ inputTokens: 2, outputTokens: 2, totalTokens: 4 });
    expect(session.lastCall?.()).toEqual({ model: 'm1', inputTokens: 2, outputTokens: 2, estimated: true, interrupted: true });
  });

  it("the caller's signal cancels a stream in flight, and the error says so", async () => {
    const controller = new AbortController();
    let failures = 0;
    class Watching extends DefaultAI {
      protected override async onRequestFailed(): Promise<void> {
        failures += 1;
      }
    }
    const script = scripted([
      async function* (config) {
        yield { content: 'partial', done: false };
        controller.abort();
        await tick();
        if (config.signal?.aborted) throw new AIError('ai/aborted', 'The request was cancelled');
        yield { content: ' never', done: false };
      },
    ]);
    const ai = new Watching(createAI({ adapter: 'custom', instance: script.adapter, costTable }), { logger });
    const session = await ai.createSession(ctx, 's-signal', { model: 'm1' });
    const read = async () => {
      const seen: string[] = [];
      for await (const chunk of ai.stream(ctx, session, 'go', { signal: controller.signal })) seen.push(chunk.content);
      return seen;
    };
    await expect(read()).rejects.toMatchObject({ code: 'ai/aborted' });
    expect(script.calls[0].config.signal?.aborted).toBe(true);
    expect(session.getHistory().at(-1)).toMatchObject({ role: 'assistant', content: 'partial', interrupted: true });
    expect(ai.telemetry.getEntries('s-signal')).toMatchObject([{ estimated: true, outputTokens: 2 }]);
    // A cancelled call is not a failed one
    expect(failures).toBe(0);
  });

  it('counts toward the budget, so starting and cancelling streams is not a way past it', async () => {
    const endless = async function* (): AsyncIterable<StreamChunk> {
      for (let i = 0; i < 1000; i++) yield { content: 'a paragraph of forty characters, give or take', done: false };
    };
    const { ai, calls } = build(Array.from({ length: 50 }, () => endless));
    const session = await ai.createSession(ctx, 's-evade', { model: 'm1', budget: { maxTotalTokens: 400 } });
    const startAndCancel = async () => {
      let read = 0;
      for await (const _ of ai.stream(ctx, session, 'Write me a very long essay about the history of everything.')) {
        if (++read === 10) break;
      }
    };
    let refused: unknown;
    for (let attempt = 0; attempt < 50 && !refused; attempt++) {
      try {
        await startAndCancel();
      } catch (error) {
        refused = error;
      }
    }
    expect(refused).toMatchObject({ code: 'ai/token-budget-exceeded' });
    // A handful of cancelled streams spent the budget; it did not take fifty
    expect(calls.length).toBeLessThan(6);
    expect(ai.telemetry.getEntries('s-evade').every((entry) => entry.estimated && entry.costUsd > 0)).toBe(true);
  });

  it('a call whose signal is already cancelled never reaches the provider', async () => {
    const { ai, calls } = build([reply('never'), reply('never')]);
    const session = await ai.createSession(ctx, 's-pre-cancelled', { model: 'm1' });
    const gone = AbortSignal.abort();
    await expect(ai.send(ctx, session, 'hi', { signal: gone })).rejects.toMatchObject({ code: 'ai/aborted' });
    const read = async () => {
      for await (const _ of ai.stream(ctx, session, 'hi', { signal: gone })) void _;
    };
    await expect(read()).rejects.toMatchObject({ code: 'ai/aborted' });
    expect(calls).toHaveLength(0);
    expect(session.getHistory()).toEqual([]);
    expect(ai.telemetry.getEntries('s-pre-cancelled')).toEqual([]);
  });

  it('send and runAgent pass the signal on, and a cancelled run runs no further tool', async () => {
    const controller = new AbortController();
    let ran = 0;
    const { ai, calls } = build([reply('', { toolCalls: [{ id: 'c1', name: 'slow', arguments: {} }, { id: 'c2', name: 'slow', arguments: {} }] })]);
    ai.registerTool({
      name: 'slow',
      description: 'cancels the run while it works',
      schema: z.object({}),
      handler: async () => {
        ran += 1;
        controller.abort();
        return 'done';
      },
    });
    const session = await ai.createSession(ctx, 's-agent-cancel', { model: 'm1', toolNames: ['slow'] });
    await expect(ai.runAgent(ctx, session, 'go', { signal: controller.signal })).rejects.toMatchObject({ code: 'ai/aborted' });
    expect(calls[0].config.signal).toBe(controller.signal);
    expect(ran).toBe(1);
    expect(calls).toHaveLength(1);
  });
});

describe('a call that fails', () => {
  it('leaves the message out of the history, so sending it again says it once', async () => {
    const { ai } = build([new Error('provider down'), reply('hello')]);
    const session = await ai.createSession(ctx, 's-retry', { model: 'm1', systemPrompt: 'be brief' });
    await expect(ai.send(ctx, session, 'hi')).rejects.toMatchObject({ code: 'ai/request-failed' });
    expect(session.getHistory().map((m) => m.role)).toEqual(['system']);
    await ai.send(ctx, session, 'hi');
    expect(session.getHistory().map((m) => [m.role, m.content])).toEqual([['system', 'be brief'], ['user', 'hi'], ['assistant', 'hello']]);
    expect(ai.telemetry.getEntries('s-retry')).toHaveLength(1);
  });

  it('as a stream before its first chunk: the same, and nothing is recorded', async () => {
    const { ai } = build([new Error('provider down')]);
    const session = await ai.createSession(ctx, 's-stream-fail', { model: 'm1' });
    const read = async () => {
      for await (const _ of ai.stream(ctx, session, 'hi')) void _;
    };
    await expect(read()).rejects.toMatchObject({ code: 'ai/request-failed' });
    expect(session.getHistory()).toEqual([]);
    expect(ai.telemetry.getEntries('s-stream-fail')).toEqual([]);
  });
});

describe('budgets and iterations', () => {
  it('refuses a call once the input or the output budget is spent, as with the total', async () => {
    for (const budget of [{ maxInputTokens: 100 }, { maxOutputTokens: 50 }, { maxTotalTokens: 150 }]) {
      const { ai, calls } = build([reply('first'), reply('second')]);
      const session = await ai.createSession(ctx, `s-budget-${Object.keys(budget)[0]}`, { model: 'm1', budget });
      await ai.send(ctx, session, 'one');
      await expect(ai.send(ctx, session, 'two'), JSON.stringify(budget)).rejects.toMatchObject({ code: 'ai/token-budget-exceeded' });
      const stream = async () => {
        for await (const _ of ai.stream(ctx, session, 'three')) void _;
      };
      await expect(stream()).rejects.toMatchObject({ code: 'ai/token-budget-exceeded' });
      expect(calls).toHaveLength(1);
    }
  });

  it('tells the provider how much the model may still write', async () => {
    const { ai, calls } = build([reply('first'), reply('second'), reply('third')]);
    const capped = await ai.createSession(ctx, 's-cap', { model: 'm1', budget: { maxOutputTokens: 120, maxTotalTokens: 1000 } });
    await ai.send(ctx, capped, 'one');
    await ai.send(ctx, capped, 'two');
    expect(calls.map((c) => c.config.maxOutputTokens)).toEqual([120, 70]);
    const open = await ai.createSession(ctx, 's-open', { model: 'm1' });
    await ai.send(ctx, open, 'one');
    expect(calls[2].config.maxOutputTokens).toBeUndefined();
  });

  it('stops an agent run at the budget, mid-run', async () => {
    const again = { toolCalls: [{ id: 'c', name: 'weather', arguments: { city: 'x' } }] };
    const { ai, calls } = build([reply('', again), reply('', again), reply('never')]);
    ai.registerTool(weather);
    const session = await ai.createSession(ctx, 's-agent-budget', { model: 'm1', toolNames: '*', budget: { maxTotalTokens: 300 } });
    await expect(ai.runAgent(ctx, session, 'go')).rejects.toMatchObject({ code: 'ai/token-budget-exceeded' });
    expect(calls).toHaveLength(2);
  });

  it("runs an agent for the session's maxIterations, or ten, unless the run says", async () => {
    const again = { toolCalls: [{ id: 'c', name: 'weather', arguments: { city: 'x' } }] };
    const forever = () => Array.from({ length: 20 }, () => reply('', again));
    const limited = build(forever());
    limited.ai.registerTool(weather);
    const two = await limited.ai.createSession(ctx, 's-two', { model: 'm1', toolNames: '*', maxIterations: 2 });
    await expect(limited.ai.runAgent(ctx, two, 'go')).rejects.toMatchObject({ code: 'ai/max-iterations-exceeded' });
    expect(limited.calls).toHaveLength(2);
    const overridden = await limited.ai.createSession(ctx, 's-four', { model: 'm1', toolNames: '*', maxIterations: 2 });
    await expect(limited.ai.runAgent(ctx, overridden, 'go', { maxIterations: 4 })).rejects.toMatchObject({ code: 'ai/max-iterations-exceeded' });
    expect(limited.calls).toHaveLength(6);

    const byDefault = build(forever());
    byDefault.ai.registerTool(weather);
    const plain = await byDefault.ai.createSession(ctx, 's-ten', { model: 'm1', toolNames: '*' });
    await expect(byDefault.ai.runAgent(ctx, plain, 'go')).rejects.toMatchObject({ code: 'ai/max-iterations-exceeded' });
    expect(byDefault.calls).toHaveLength(10);
    await expect(byDefault.ai.runAgent(ctx, plain, 'go', { maxIterations: 0 })).rejects.toMatchObject({ code: 'ai/config' });
  });
});

describe('tools', () => {
  const other: ToolDefinition = { name: 'other', description: 'another tool', schema: z.object({}), handler: async () => 'other' };

  it('a session offers the model no tool it does not name: registering one makes it available, no more', async () => {
    const { ai, calls } = build([reply('a'), reply('b'), reply('c'), reply('d'), reply('e')]);
    ai.registerTool(weather);
    ai.registerTool(other);
    const offered = async (id: string, config: Parameters<typeof ai.createSession>[2]) => {
      const session = await ai.createSession(ctx, id, { model: 'm1', ...config });
      await ai.send(ctx, session, 'hi');
      expect(session.tools?.().map((t) => t.name)).toEqual(calls.at(-1)?.config.tools?.map((t) => t.name) ?? []);
      return calls.at(-1)?.config.tools?.map((t) => t.name);
    };
    // A plain chat session, in an app that registered an admin tool for some other flow, is offered nothing
    expect(await offered('t-default', {})).toBeUndefined();
    expect(await offered('t-named', { toolNames: ['other'] })).toEqual(['other']);
    // Every registered tool, when the session says so
    expect(await offered('t-all', { toolNames: '*' })).toEqual(['weather', 'other']);
    const inline: ToolDefinition = { name: 'inline', description: 'only here', schema: z.object({}), handler: async () => 'inline' };
    expect(await offered('t-own', { tools: [inline] })).toEqual(['inline']);
    // An empty list is a choice: this session has no tools
    expect(await offered('t-none', { tools: [] })).toBeUndefined();
  });

  it('refuses a session that names a tool nobody registered, before a call is paid for', async () => {
    const { ai, calls } = build([reply('never')]);
    const session = await ai.createSession(ctx, 't-missing', { model: 'm1', toolNames: ['weather'] });
    await expect(ai.send(ctx, session, 'hi')).rejects.toMatchObject({ code: 'ai/tool-not-found', metadata: { tool: 'weather' } });
    expect(calls).toHaveLength(0);
    expect(session.getHistory()).toEqual([]);
  });

  it('come back working when a saved session is opened in another process', async () => {
    // A store that keeps what JSON keeps, as a database does
    const rows = new Map<string, string>();
    const store: AISessionStore = {
      async save(id, state) {
        const { tools, ...config } = state.config;
        rows.set(id, JSON.stringify({ ...state, config: { ...config, toolNames: config.toolNames ?? tools?.map((t) => t.name) } }));
      },
      async load(id) {
        const row = rows.get(id);
        return row ? (JSON.parse(row) as SessionState) : null;
      },
    };
    const first = build([reply('', { toolCalls: [{ id: 'c1', name: 'weather', arguments: { city: 'Puebla' } }] })], { sessions: store });
    first.ai.registerTool(weather);
    const session = await first.ai.createSession(ctx, 't-saved', { model: 'm1', tools: [weather] });
    await first.ai.send(ctx, session, 'weather in Puebla?');
    expect(JSON.parse(rows.get('t-saved') ?? '{}').config).toMatchObject({ toolNames: ['weather'] });
    expect(rows.get('t-saved')).not.toContain('handler');

    // Another process: the same registration at startup, the session opened by id
    const second = build([reply('Clear in Puebla.')], { sessions: store });
    second.ai.registerTool(weather);
    const reopened = await second.ai.sessions.open('t-saved');
    expect(reopened?.tools?.()[0]?.handler).toBe(weather.handler);
    const calls = reopened?.getHistory().at(-1)?.toolCalls ?? [];
    const results = await Promise.all(calls.map(async (call) => ({ callId: call.id, toolName: call.name, result: await second.ai.tools.execute(call.name, call.arguments, ctx) })));
    expect(results[0]?.result).toMatchObject({ city: 'Puebla', askedBy: 'u1' });
    expect((await reopened?.send('', results))?.content).toBe('Clear in Puebla.');

    // A process that forgot to register it is told which tool, not handed a dead one
    const third = build([reply('never')], { sessions: store });
    const dead = await third.ai.sessions.open('t-saved');
    await expect(dead?.send('again')).rejects.toMatchObject({ code: 'ai/tool-not-found' });
  });
});

describe('telemetry', () => {
  it('is written through the session store when the store keeps telemetry', async () => {
    const saved: AITelemetryEntry[] = [];
    const store: AISessionStore = { save: async () => {}, load: async () => null, recordTelemetry: async (entry) => void saved.push(entry) };
    const { ai } = build([reply('hello')], { sessions: store });
    const session = await ai.createSession(ctx, 'tel-store', { model: 'm1' });
    await ai.send(ctx, session, 'hi');
    await tick();
    expect(saved).toMatchObject([{ sessionId: 'tel-store', tenantId: 't1', model: 'm1', costUsd: 0.2 }]);
  });

  it('that cannot be written is said in the log, and the call still succeeds', async () => {
    warnings.length = 0;
    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => void unhandled.push(reason);
    process.on('unhandledRejection', onUnhandled);
    try {
      const { ai } = build([reply('hello')], {
        persistTelemetry: async () => {
          throw new AIError('ai/request-failed', 'telemetry table is missing');
        },
      });
      const session = await ai.createSession(ctx, 'tel-fail', { model: 'm1' });
      expect((await ai.send(ctx, session, 'hi')).content).toBe('hello');
      await tick();
      await tick();
      expect(warnings.some((w) => w.error === 'telemetry table is missing' && w.sessionId === 'tel-fail')).toBe(true);
      expect(unhandled).toEqual([]);
    } finally {
      process.off('unhandledRejection', onUnhandled);
    }
  });
});

describe('toSse', () => {
  it('makes delta events, a tool-calls event, and the data of the closing event', async () => {
    const toolCalls = [{ id: 'c1', name: 'weather', arguments: { city: 'Oaxaca' } }];
    async function* chunks(): AsyncIterable<StreamChunk> {
      yield { content: 'Hel', done: false };
      yield { content: 'lo', done: false };
      yield { content: '', done: true, usage: { inputTokens: 3, outputTokens: 2 }, model: 'm1', toolCalls };
    }
    const sse = toSse(chunks());
    expect(sse.done()).toEqual({});
    const events: unknown[] = [];
    for await (const event of sse.events) events.push(event);
    expect(events).toEqual([
      { event: 'delta', data: { content: 'Hel' } },
      { event: 'delta', data: { content: 'lo' } },
      { event: 'tool-calls', data: toolCalls },
    ]);
    expect(sse.done()).toEqual({ usage: { inputTokens: 3, outputTokens: 2 }, model: 'm1' });
  });
});

describe('AISdkAdapter with a provider model', () => {
  const usage = { inputTokens: { total: 7, noCache: 7, cacheRead: 0, cacheWrite: 0 }, outputTokens: { total: 4, text: 4, reasoning: 0 } };
  const model = () =>
    new MockLanguageModelV4({
      doStream: async () => ({
        stream: convertArrayToReadableStream([
          { type: 'stream-start', warnings: [] },
          { type: 'text-start', id: 't1' },
          { type: 'text-delta', id: 't1', delta: 'Checking' },
          { type: 'text-end', id: 't1' },
          { type: 'tool-call', toolCallId: 'call_1', toolName: 'weather', input: '{"city":"Oaxaca"}' },
          { type: 'finish', usage, finishReason: { unified: 'tool-calls', raw: 'tool_use' } },
        ]),
      }),
    });

  it('streams the text, then a last chunk with the usage, the model and the tool calls', async () => {
    const mock = model();
    const adapter = new AISdkAdapter('mock', () => mock, 'mock-model');
    const chunks: StreamChunk[] = [];
    // The reader cancels as the last chunk arrives: the reply had finished, so it is a finished reply, with its usage
    const late = new AbortController();
    for await (const chunk of adapter.stream([{ role: 'user', content: 'weather?' }], { tools: [weather as ToolDefinition], maxOutputTokens: 256, signal: late.signal })) {
      chunks.push(chunk);
      if (chunk.done) late.abort();
    }
    expect(chunks.map((c) => c.content).join('')).toBe('Checking');
    expect(chunks.at(-1)).toEqual({
      content: '',
      done: true,
      usage: { inputTokens: 7, outputTokens: 4 },
      model: 'mock-model',
      toolCalls: [{ id: 'call_1', name: 'weather', arguments: { city: 'Oaxaca' } }],
    });
    // The output cap reaches the provider
    expect(mock.doStreamCalls[0]?.maxOutputTokens).toBe(256);
  });

  it('hands the provider the signal, and reports a cancelled call as cancelled', async () => {
    const mock = model();
    const adapter = new AISdkAdapter('mock', () => mock, 'mock-model');
    const controller = new AbortController();
    const read = async () => {
      for await (const chunk of adapter.stream([{ role: 'user', content: 'hi' }], { signal: controller.signal })) {
        if (chunk.content) controller.abort();
      }
    };
    await expect(read()).rejects.toMatchObject({ code: 'ai/aborted' });
    expect(mock.doStreamCalls[0]?.abortSignal).toBeDefined();

    const before = new AbortController();
    before.abort();
    const failing = new MockLanguageModelV4({
      doGenerate: async ({ abortSignal }) => {
        abortSignal?.throwIfAborted();
        throw new AIError('ai/request-failed', 'the mock was not cancelled');
      },
    });
    await expect(new AISdkAdapter('mock', () => failing, 'mock-model').generate([{ role: 'user', content: 'hi' }], { signal: before.signal })).rejects.toMatchObject({ code: 'ai/aborted' });
  });
});
