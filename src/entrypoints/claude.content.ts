import { mountSaveButton } from '../adapters/content/save-button';
import { claudeScraper } from '../adapters/scrapers/claude';

export default defineContentScript({
  matches: ['https://claude.ai/*'],
  async main(ctx) {
    await mountSaveButton(ctx, claudeScraper);
  },
});
