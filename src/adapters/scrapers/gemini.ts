import { cleanTitle, collectMessages, type TurnSelector } from './dom';
import type { ConversationScraper, ScrapeResult } from './types';

// Selector fallback chains for gemini.google.com (verified against fixture
// 2026-07). Gemini renders Angular custom elements - stable tag names.
const TURNS: readonly TurnSelector[] = [
  {
    role: 'user',
    selectors: ['user-query .query-text', 'user-query'],
  },
  {
    role: 'assistant',
    selectors: ['model-response message-content', 'model-response'],
  },
];

export const geminiScraper: ConversationScraper = {
  platform: 'gemini',
  // Gemini has temporary chats, but their URL/DOM marker is not verified yet -
  // until it is, auto-capture cannot tell them apart (documented gap in the
  // knowledge repo's temporary-chats research note).
  isEphemeral(): boolean {
    return false;
  },
  scrape(doc, sourceUrl): ScrapeResult {
    const messages = collectMessages(doc, TURNS);
    if (messages.length === 0) {
      return { kind: 'failure', reason: 'gemini: no conversation turns found' };
    }
    return {
      kind: 'success',
      capture: {
        platform: 'gemini',
        title: cleanTitle(doc.title, ['Gemini']),
        sourceUrl,
        messages,
      },
    };
  },
};
