import { describe, expect, it } from 'vitest';
import type { CapturedConversation } from '../../domain/capture';
import type { ScrapeResult } from '../scrapers/types';
import { makeAutoCaptureRunner, makeDebouncer, type AutoCaptureDeps } from './auto-capture';

const capture: CapturedConversation = {
  platform: 'chatgpt',
  title: 'Trip to Norway',
  sourceUrl: 'https://chatgpt.com/c/abc',
  messages: [{ role: 'user', text: 'Fjords in June?' }],
};

function setup(overrides: Partial<AutoCaptureDeps> = {}) {
  const submitted: CapturedConversation[] = [];
  const logged: string[] = [];
  const deps: AutoCaptureDeps = {
    scrape: (): ScrapeResult => ({ kind: 'success', capture }),
    isEphemeral: () => false,
    isEnabled: () => Promise.resolve(true),
    submit: (c) => {
      submitted.push(c);
      return Promise.resolve();
    },
    log: (m) => logged.push(m),
    ...overrides,
  };
  return { run: makeAutoCaptureRunner(deps), submitted, logged };
}

describe('auto-capturing a conversation', () => {
  it('submits the scraped conversation', async () => {
    const { run, submitted } = setup();
    await run();
    expect(submitted).toEqual([capture]);
  });

  it('does not resubmit an unchanged conversation', async () => {
    const { run, submitted } = setup();
    await run();
    await run();
    expect(submitted).toHaveLength(1);
  });

  it('submits again once the conversation grows', async () => {
    const grown: CapturedConversation = {
      ...capture,
      messages: [...capture.messages, { role: 'assistant', text: 'Lofoten.' }],
    };
    const results: ScrapeResult[] = [
      { kind: 'success', capture },
      { kind: 'success', capture: grown },
    ];
    const { run, submitted } = setup({ scrape: () => results.shift()! });
    await run();
    await run();
    expect(submitted).toEqual([capture, grown]);
  });

  it('skips an ephemeral (temporary) chat - saving one is always explicit', async () => {
    const { run, submitted } = setup({ isEphemeral: () => true });
    await run();
    expect(submitted).toHaveLength(0);
  });

  it('does nothing when auto-capture is disabled in settings', async () => {
    const { run, submitted } = setup({ isEnabled: () => Promise.resolve(false) });
    await run();
    expect(submitted).toHaveLength(0);
  });

  it('a failed scrape is skipped silently: not logged, not submitted, never thrown', async () => {
    const { run, submitted, logged } = setup({
      scrape: () => ({ kind: 'failure', reason: 'chatgpt: no conversation turns found' }),
    });
    await expect(run()).resolves.toBeUndefined();
    expect(submitted).toHaveLength(0);
    expect(logged).toHaveLength(0);
  });

  it('a failed submit is logged and retried on the next run', async () => {
    let calls = 0;
    const { run, logged } = setup({
      submit: () => {
        calls += 1;
        return calls === 1
          ? Promise.reject(new Error('background unreachable'))
          : Promise.resolve();
      },
    });
    await run();
    await run();
    expect(logged).toHaveLength(1);
    expect(calls).toBe(2);
  });
});

describe('debouncing capture triggers', () => {
  function fakeTimers() {
    const pending = new Map<number, () => void>();
    let nextId = 1;
    return {
      set: (fn: () => void, _ms: number) => {
        const id = nextId++;
        pending.set(id, fn);
        return id;
      },
      clear: (id: number) => {
        pending.delete(id);
      },
      fireAll: () => {
        const fns = [...pending.values()];
        pending.clear();
        fns.forEach((fn) => fn());
      },
      count: () => pending.size,
    };
  }

  it('many bumps within the window collapse into one run', () => {
    let runs = 0;
    const timers = fakeTimers();
    const d = makeDebouncer(() => (runs += 1), 500, timers);
    d.bump();
    d.bump();
    d.bump();
    expect(timers.count()).toBe(1);
    timers.fireAll();
    expect(runs).toBe(1);
  });

  it('flush runs immediately and cancels the pending timer', () => {
    let runs = 0;
    const timers = fakeTimers();
    const d = makeDebouncer(() => (runs += 1), 500, timers);
    d.bump();
    d.flush();
    expect(runs).toBe(1);
    expect(timers.count()).toBe(0);
    timers.fireAll();
    expect(runs).toBe(1);
  });
});
