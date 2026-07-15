import { cleanTitle, collectMessages, type TurnSelector } from './dom';
import type { ConversationScraper, ScrapeResult } from './types';

// Selector fallback chains for chatgpt.com (verified against fixture 2026-07).
// data-* attributes first - CSS classes on this page are build-generated.
const TURNS: readonly TurnSelector[] = [
  {
    role: 'user',
    selectors: ['[data-message-author-role="user"]'],
  },
  {
    role: 'assistant',
    selectors: ['[data-message-author-role="assistant"]'],
  },
];

export const chatgptScraper: ConversationScraper = {
  platform: 'chatgpt',
  scrape(doc, sourceUrl): ScrapeResult {
    const messages = collectMessages(doc, TURNS);
    if (messages.length === 0) {
      return { kind: 'failure', reason: 'chatgpt: no conversation turns found' };
    }
    return {
      kind: 'success',
      capture: {
        platform: 'chatgpt',
        title: cleanTitle(doc.title, ['ChatGPT']),
        sourceUrl,
        messages,
      },
    };
  },
};
