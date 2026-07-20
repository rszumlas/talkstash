import { mountAutoCapture } from '../adapters/content/auto-capture';
import { mountSaveButton } from '../adapters/content/save-button';
import { claudeScraper } from '../adapters/scrapers/claude';

export default defineContentScript({
  matches: ['https://claude.ai/*'],
  async main(ctx) {
    mountAutoCapture(ctx, claudeScraper);
    await mountSaveButton(ctx, claudeScraper);
  },
});
