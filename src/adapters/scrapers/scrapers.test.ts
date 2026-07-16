// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { chatgptScraper } from './chatgpt';
import { claudeScraper } from './claude';
import { geminiScraper } from './gemini';
import type { ConversationScraper } from './types';

function parseFixture(name: string): Document {
  const html = readFileSync(join(__dirname, '__fixtures__', name), 'utf-8');
  return new DOMParser().parseFromString(html, 'text/html');
}

const garbage = new DOMParser().parseFromString(
  '<html><body><p>Nothing chat-like here</p></body></html>',
  'text/html',
);

describe('capturing a conversation from ChatGPT', () => {
  it('extracts the title and messages in source order', () => {
    const result = chatgptScraper.scrape(
      parseFixture('chatgpt-conversation-2026-07.html'),
      'https://chatgpt.com/c/abc',
    );

    expect(result.kind).toBe('success');
    if (result.kind !== 'success') return;
    expect(result.capture.platform).toBe('chatgpt');
    expect(result.capture.title).toBe('Trip to Norway');
    expect(result.capture.sourceUrl).toBe('https://chatgpt.com/c/abc');
    expect(result.capture.messages).toEqual([
      { role: 'user', text: 'Where should I go in Norway in June?' },
      { role: 'assistant', text: 'Consider the Lofoten islands and Bergen.' },
      { role: 'user', text: 'How many days for Lofoten?' },
    ]);
  });
});

describe('capturing a conversation from Claude', () => {
  it('extracts the title and messages in source order', () => {
    const result = claudeScraper.scrape(
      parseFixture('claude-conversation-2026-07.html'),
      'https://claude.ai/chat/xyz',
    );

    expect(result.kind).toBe('success');
    if (result.kind !== 'success') return;
    expect(result.capture.platform).toBe('claude');
    expect(result.capture.title).toBe('Refactoring a Svelte store');
    expect(result.capture.messages.map((m) => m.role)).toEqual(['user', 'assistant', 'user']);
  });
});

describe('capturing a conversation from Gemini', () => {
  it('extracts the title and messages in source order', () => {
    const result = geminiScraper.scrape(
      parseFixture('gemini-conversation-2026-07.html'),
      'https://gemini.google.com/app/123',
    );

    expect(result.kind).toBe('success');
    if (result.kind !== 'success') return;
    expect(result.capture.platform).toBe('gemini');
    expect(result.capture.title).toBe('CSS grid basics');
    expect(result.capture.messages).toEqual([
      { role: 'user', text: 'Explain CSS grid in one paragraph.' },
      { role: 'assistant', text: 'CSS grid is a two-dimensional layout system for the web.' },
    ]);
  });
});

describe('detecting an ephemeral (temporary) chat', () => {
  it('recognizes a ChatGPT Temporary Chat by its URL parameter', () => {
    const doc = parseFixture('chatgpt-conversation-2026-07.html');
    expect(chatgptScraper.isEphemeral(doc, 'https://chatgpt.com/?temporary-chat=true')).toBe(true);
    expect(
      chatgptScraper.isEphemeral(doc, 'https://chatgpt.com/?model=gpt-4&temporary-chat=true'),
    ).toBe(true);
  });

  it('treats a regular ChatGPT conversation as not ephemeral', () => {
    const doc = parseFixture('chatgpt-conversation-2026-07.html');
    expect(chatgptScraper.isEphemeral(doc, 'https://chatgpt.com/c/abc')).toBe(false);
    expect(chatgptScraper.isEphemeral(doc, 'not a url')).toBe(false);
  });

  it('Claude and Gemini report not ephemeral until their markers are verified', () => {
    // Documented gap - see talkstash-knowledge research note on temporary chats.
    expect(claudeScraper.isEphemeral(garbage, 'https://claude.ai/chat/xyz')).toBe(false);
    expect(geminiScraper.isEphemeral(garbage, 'https://gemini.google.com/app/1')).toBe(false);
  });
});

describe.each<[string, ConversationScraper]>([
  ['ChatGPT', chatgptScraper],
  ['Claude', claudeScraper],
  ['Gemini', geminiScraper],
])('unknown markup (%s)', (_name, scraper) => {
  it('returns an explicit failure, not an exception or a half-conversation', () => {
    const result = scraper.scrape(garbage, 'https://example.com');
    expect(result.kind).toBe('failure');
  });
});
