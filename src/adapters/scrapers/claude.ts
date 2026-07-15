import { cleanTitle, collectMessages, type TurnSelector } from './dom';
import type { ConversationScraper, ScrapeResult } from './types';

// Selector fallback chains for claude.ai (verified against fixture 2026-07).
const TURNS: readonly TurnSelector[] = [
  {
    role: 'user',
    selectors: ['[data-testid="user-message"]'],
  },
  {
    role: 'assistant',
    selectors: ['.font-claude-message', '[data-testid="assistant-message"]'],
  },
];

export const claudeScraper: ConversationScraper = {
  platform: 'claude',
  scrape(doc, sourceUrl): ScrapeResult {
    const messages = collectMessages(doc, TURNS);
    if (messages.length === 0) {
      return { kind: 'failure', reason: 'claude: no conversation turns found' };
    }
    return {
      kind: 'success',
      capture: {
        platform: 'claude',
        title: cleanTitle(doc.title, ['Claude']),
        sourceUrl,
        messages,
      },
    };
  },
};
