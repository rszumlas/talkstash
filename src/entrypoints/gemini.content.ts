import { mountSaveButton } from '../adapters/content/save-button';
import { geminiScraper } from '../adapters/scrapers/gemini';

export default defineContentScript({
  matches: ['https://gemini.google.com/*'],
  async main(ctx) {
    await mountSaveButton(ctx, geminiScraper);
  },
});
