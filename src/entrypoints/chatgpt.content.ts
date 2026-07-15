import { mountSaveButton } from '../adapters/content/save-button';
import { chatgptScraper } from '../adapters/scrapers/chatgpt';

export default defineContentScript({
  matches: ['https://chatgpt.com/*', 'https://chat.openai.com/*'],
  async main(ctx) {
    await mountSaveButton(ctx, chatgptScraper);
  },
});
