import type { CapturedConversation } from '../../domain/capture';
import type { Platform } from '../../domain/values';

export type ScrapeResult =
  | { readonly kind: 'success'; readonly capture: CapturedConversation }
  | { readonly kind: 'failure'; readonly reason: string };

/**
 * Anti-corruption layer between a chat page's markup and the domain.
 * No DOM type, selector or CSS class leaks past implementations of this
 * interface; a markup change on a platform touches only its scraper module
 * and fixtures.
 */
export interface ConversationScraper {
  readonly platform: Platform;
  scrape(doc: Document, sourceUrl: string): ScrapeResult;
}
