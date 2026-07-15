import type { ContentScriptContext } from 'wxt/utils/content-script-context';
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root';
import { sendMessage } from '../messaging';
import type { ConversationScraper } from '../scrapers/types';

type ButtonState = 'idle' | 'saving' | 'saved' | 'error';

const LABELS: Record<ButtonState, string> = {
  idle: 'Save to Talkstash',
  saving: 'Saving...',
  saved: 'Saved',
  error: 'Could not save',
};

/**
 * Floating save button - the only UI a content script owns. Scrapes the
 * current page and submits the capture to the background; never touches
 * storage itself.
 */
export async function mountSaveButton(
  ctx: ContentScriptContext,
  scraper: ConversationScraper,
): Promise<void> {
  const ui = await createShadowRootUi(ctx, {
    name: 'talkstash-save',
    position: 'inline',
    anchor: 'body',
    onMount(container) {
      const button = document.createElement('button');
      button.type = 'button';
      // px sizes on purpose: rem in a shadow root scales with the host page.
      button.style.cssText = [
        'position: fixed',
        'right: 16px',
        'bottom: 16px',
        'z-index: 2147483647',
        'padding: 8px 14px',
        'border: none',
        'border-radius: 999px',
        'background: #1a1a2e',
        'color: #ffffff',
        'font: 600 13px/1 system-ui, sans-serif',
        'cursor: pointer',
        'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25)',
      ].join(';');

      let state: ButtonState = 'idle';
      const render = () => {
        button.textContent = LABELS[state];
        button.disabled = state === 'saving';
      };
      const settle = (next: ButtonState) => {
        state = next;
        render();
        ctx.setTimeout(() => {
          state = 'idle';
          render();
        }, 2000);
      };

      button.addEventListener('click', async () => {
        state = 'saving';
        render();
        const result = scraper.scrape(document, window.location.href);
        if (result.kind === 'failure') {
          console.warn(`[talkstash] ${result.reason}`);
          settle('error');
          return;
        }
        try {
          const outcome = await sendMessage('saveConversation', result.capture);
          settle(outcome.ok ? 'saved' : 'error');
          if (!outcome.ok) console.warn(`[talkstash] save failed: ${outcome.error}`);
        } catch (error) {
          console.warn('[talkstash] messaging failed', error);
          settle('error');
        }
      });

      render();
      container.append(button);
    },
  });

  ui.mount();
}
