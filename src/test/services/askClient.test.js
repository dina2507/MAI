/**
 * Unit tests for the askClient SSE streaming parser.
 * Tests the SSE protocol parsing, callback invocation, and error handling.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// We need to mock fetch since askCivic uses it
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Dynamic import after mock is set
const { askCivic } = await import('../../services/askClient');

function createSSEStream(events) {
  const text = events.map((e) => `data: ${JSON.stringify(e)}`).join('\n\n') + '\n\n';
  const encoder = new TextEncoder();
  const encoded = encoder.encode(text);

  let position = 0;
  const stream = new ReadableStream({
    pull(controller) {
      if (position < encoded.length) {
        // Send in small chunks to test buffering
        const chunk = encoded.slice(position, position + 50);
        controller.enqueue(chunk);
        position += 50;
      } else {
        controller.close();
      }
    },
  });

  return stream;
}

describe('askCivic — SSE Client', () => {
  let callbacks;

  beforeEach(() => {
    mockFetch.mockReset();
    callbacks = {
      onSources: vi.fn(),
      onToken: vi.fn(),
      onSuggestions: vi.fn(),
      onDone: vi.fn(),
      onError: vi.fn(),
    };
  });

  it('calls onSources when sources event received', async () => {
    const sources = [{ title: 'ECI Handbook', url: 'https://eci.gov.in' }];
    mockFetch.mockResolvedValue({
      ok: true,
      body: createSSEStream([{ type: 'sources', sources }]),
    });

    await askCivic('test', null, callbacks);
    expect(callbacks.onSources).toHaveBeenCalledWith(sources);
  });

  it('calls onToken for each token event', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      body: createSSEStream([
        { type: 'token', text: 'Hello' },
        { type: 'token', text: ' world' },
      ]),
    });

    await askCivic('test', null, callbacks);
    expect(callbacks.onToken).toHaveBeenCalledTimes(2);
    expect(callbacks.onToken).toHaveBeenCalledWith('Hello');
    expect(callbacks.onToken).toHaveBeenCalledWith(' world');
  });

  it('calls onSuggestions when suggestions event received', async () => {
    const suggestions = ['What is EVM?', 'How to find my booth?'];
    mockFetch.mockResolvedValue({
      ok: true,
      body: createSSEStream([{ type: 'suggestions', suggestions }]),
    });

    await askCivic('test', null, callbacks);
    expect(callbacks.onSuggestions).toHaveBeenCalledWith(suggestions);
  });

  it('calls onDone when done event received', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      body: createSSEStream([
        { type: 'token', text: 'Answer' },
        { type: 'done' },
      ]),
    });

    await askCivic('test', null, callbacks);
    expect(callbacks.onDone).toHaveBeenCalled();
  });

  it('calls onError for HTTP errors', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    await askCivic('test', null, callbacks);
    expect(callbacks.onError).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('500'),
    }));
  });

  it('calls onError for server-sent error events', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      body: createSSEStream([{ type: 'error', message: 'Rate limited' }]),
    });

    await askCivic('test', null, callbacks);
    expect(callbacks.onError).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Rate limited',
    }));
  });

  it('calls onError for network failures', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

    await askCivic('test', null, callbacks);
    expect(callbacks.onError).toHaveBeenCalledWith(expect.any(TypeError));
  });

  it('silently ignores AbortError', async () => {
    const abortError = new DOMException('Aborted', 'AbortError');
    mockFetch.mockRejectedValue(abortError);

    await askCivic('test', null, callbacks);
    expect(callbacks.onError).not.toHaveBeenCalled();
  });

  it('sends question and history in POST body', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      body: createSSEStream([{ type: 'done' }]),
    });

    const history = [{ role: 'user', text: 'Hi' }];
    await askCivic('What is NOTA?', null, callbacks, history);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: 'What is NOTA?', history }),
      })
    );
  });

  it('skips malformed SSE lines gracefully', async () => {
    // Manually create a stream with bad data
    const text = 'data: {bad-json}\n\ndata: {"type":"token","text":"ok"}\n\n';
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(text));
        controller.close();
      },
    });

    mockFetch.mockResolvedValue({ ok: true, body: stream });
    await askCivic('test', null, callbacks);
    // Should skip bad JSON and still process the valid one
    expect(callbacks.onToken).toHaveBeenCalledWith('ok');
  });
});
