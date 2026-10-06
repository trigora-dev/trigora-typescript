import { afterEach, describe, expect, it, vi } from 'vitest';

import { createClient, TrigoraRuntimeError } from './client';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('createClient', () => {
  it('starts a program and returns a typed execution handle', async () => {
    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = String(input);

      if (url.endsWith('/v1/executions') && url.includes('http://127.0.0.1:3477')) {
        return jsonResponse(200, {
          execution: {
            id: 'exec_1',
            programId: 'researchAgent',
            status: 'waiting',
            input: { query: 'durable agents' },
            wait: { type: 'event', event: 'approved' },
            attempt: 1,
            createdAt: '2026-08-31T00:00:00.000Z',
            updatedAt: '2026-08-31T00:00:00.000Z',
          },
        });
      }

      throw new Error(`unexpected fetch ${url}`);
    });
    globalThis.fetch = fetchMock as typeof fetch;

    async function researchAgent(input: { query: string }) {
      void input;
      return { ok: true };
    }

    const client = createClient({ url: 'http://127.0.0.1:3477' });
    const run = await client.start(researchAgent, { query: 'durable agents' });

    expect(run.id).toBe('exec_1');
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:3477/v1/executions',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          programId: 'researchAgent',
          input: { query: 'durable agents' },
        }),
      }),
    );
  });

  it('polls until a result is available and sends typed events', async () => {
    const approved = { name: 'approved' };
    let polls = 0;
    globalThis.fetch = vi.fn(async (input: string | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.endsWith('/events')) {
        expect(init?.method).toBe('POST');
        expect(init?.body).toBe(
          JSON.stringify({ name: 'approved', payload: { reviewer: 'Omar' } }),
        );
        return jsonResponse(200, {
          execution: {
            id: 'exec_2',
            programId: 'researchAgent',
            status: 'running',
            input: {},
            attempt: 1,
            createdAt: '2026-08-31T00:00:00.000Z',
            updatedAt: '2026-08-31T00:00:00.000Z',
          },
        });
      }

      if (url.endsWith('/result')) {
        polls += 1;
        if (polls < 3) {
          return jsonResponse(200, {
            result: {
              status: 'waiting',
            },
          });
        }

        return jsonResponse(200, {
          result: {
            status: 'completed',
            result: { reviewer: 'Omar' },
          },
        });
      }

      throw new Error(`unexpected fetch ${url}`);
    }) as typeof fetch;

    const client = createClient({ url: 'http://127.0.0.1:9' });
    const run = client.get<{ reviewer: string }>('exec_2');
    await run.send(approved, { reviewer: 'Omar' });
    await expect(run.result()).resolves.toEqual({ reviewer: 'Omar' });
  });

  it('sends an empty argument list when input is omitted', async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(200, {
        execution: {
          id: 'exec_empty',
          programId: 'program',
          status: 'completed',
          input: [],
          attempt: 1,
          createdAt: '2026-08-31T00:00:00.000Z',
          updatedAt: '2026-08-31T00:00:00.000Z',
        },
      }),
    );
    globalThis.fetch = fetchMock as typeof fetch;

    const client = createClient({ url: 'http://127.0.0.1:9' });
    await client.start('program');
    await client.start('program', {});

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://127.0.0.1:9/v1/executions',
      expect.objectContaining({
        body: JSON.stringify({ programId: 'program', input: [] }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://127.0.0.1:9/v1/executions',
      expect.objectContaining({
        body: JSON.stringify({ programId: 'program', input: {} }),
      }),
    );
  });

  it('surfaces runtime errors', async () => {
    globalThis.fetch = vi.fn(async () =>
      jsonResponse(404, {
        error: { code: 'program_not_found', message: 'Program "missing" was not found.' },
      }),
    ) as typeof fetch;

    const client = createClient({ url: 'http://127.0.0.1:9' });
    await expect(client.start('missing', {})).rejects.toBeInstanceOf(TrigoraRuntimeError);
  });

  it('lists executions from the runtime', async () => {
    globalThis.fetch = vi.fn(async (input: string | URL) => {
      const url = String(input);
      if (url.endsWith('/v1/executions')) {
        return jsonResponse(200, {
          executions: [
            {
              id: 'exec_3',
              programId: 'approval',
              status: 'waiting',
              input: {},
              wait: { type: 'event', event: 'approved' },
              attempt: 1,
              createdAt: '2026-08-31T00:00:00.000Z',
              updatedAt: '2026-08-31T00:00:00.000Z',
            },
          ],
        });
      }

      throw new Error(`unexpected fetch ${url}`);
    }) as typeof fetch;

    const client = createClient({ url: 'http://127.0.0.1:9' });
    await expect(client.executions()).resolves.toMatchObject({
      executions: [{ id: 'exec_3', programId: 'approval' }],
    });
  });
});

describe('host selection', () => {
  const env = {
    TRIGORA_TOKEN: process.env.TRIGORA_TOKEN,
    TRIGORA_RUNTIME_URL: process.env.TRIGORA_RUNTIME_URL,
    TRIGORA_API_BASE_URL: process.env.TRIGORA_API_BASE_URL,
  };

  afterEach(() => {
    for (const [key, value] of Object.entries(env)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  function captureRequest(): { url?: string; authorization?: string } {
    const seen: { url?: string; authorization?: string } = {};
    globalThis.fetch = vi.fn(async (input: string | URL, init?: RequestInit) => {
      seen.url = String(input);
      const headers = new Headers(init?.headers);
      seen.authorization = headers.get('authorization') ?? undefined;
      return jsonResponse(200, { executions: [] });
    }) as typeof fetch;
    return seen;
  }

  it('stays local and omits Authorization when TRIGORA_TOKEN is set', async () => {
    process.env.TRIGORA_TOKEN = 'cloud-token';
    delete process.env.TRIGORA_RUNTIME_URL;
    const seen = captureRequest();

    await createClient().executions();

    expect(seen.url).toBe('http://127.0.0.1:3477/v1/executions');
    expect(seen.authorization).toBeUndefined();
  });

  it('selects Cloud and sends the token when remote is set', async () => {
    process.env.TRIGORA_TOKEN = 'cloud-token';
    delete process.env.TRIGORA_API_BASE_URL;
    const seen = captureRequest();

    await createClient({ remote: true }).executions();

    expect(seen.url).toBe('https://api.trigora.dev/v1/executions');
    expect(seen.authorization).toBe('Bearer cloud-token');
  });

  it('fails at construction when Cloud has no token', () => {
    delete process.env.TRIGORA_TOKEN;

    expect(() => createClient({ remote: true })).toThrow(/TRIGORA_TOKEN is not set/);
  });

  it('uses an explicit URL when remote is set and no token is present', async () => {
    delete process.env.TRIGORA_TOKEN;
    const seen = captureRequest();

    await createClient({ url: 'http://127.0.0.1:9', remote: true }).executions();

    expect(seen.url).toBe('http://127.0.0.1:9/v1/executions');
    expect(seen.authorization).toBeUndefined();
  });

  it('sends an explicit token to a custom local URL', async () => {
    process.env.TRIGORA_TOKEN = 'env-token';
    const seen = captureRequest();

    await createClient({
      url: 'http://127.0.0.1:9',
      token: 'explicit-token',
      remote: false,
    }).executions();

    expect(seen.url).toBe('http://127.0.0.1:9/v1/executions');
    expect(seen.authorization).toBe('Bearer explicit-token');
  });
});
