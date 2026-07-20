import { mountAutoCapture } from '../adapters/content/auto-capture';
import { mountSaveButton } from '../adapters/content/save-button';
import { geminiScraper } from '../adapters/scrapers/gemini';

export default defineContentScript({
  matches: ['https://gemini.google.com/*'],
  async main(ctx) {
    mountAutoCapture(ctx, geminiScraper);
    await mountSaveButton(ctx, geminiScraper);
  },
});
