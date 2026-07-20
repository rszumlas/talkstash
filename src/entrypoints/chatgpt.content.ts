import { mountAutoCapture } from '../adapters/content/auto-capture';
import { mountSaveButton } from '../adapters/content/save-button';
import { chatgptScraper } from '../adapters/scrapers/chatgpt';

export default defineContentScript({
  matches: ['https://chatgpt.com/*', 'https://chat.openai.com/*'],
  async main(ctx) {
    mountAutoCapture(ctx, chatgptScraper);
    await mountSaveButton(ctx, chatgptScraper);
  },
});
