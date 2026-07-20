import type { ContentScriptContext } from 'wxt/utils/content-script-context';
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root';
import { settingsItem } from '../../utils/storage';
import { sendMessage } from '../messaging';
import type { ConversationScraper } from '../scrapers/types';

type ButtonState = 'idle' | 'saving' | 'saved' | 'error';

const LABELS: Record<ButtonState, string> = {
  idle: 'Save to Talkstash',
  saving: 'Saving…',
  saved: 'Saved',
  error: "Couldn't read this chat",
};

const CHECK_SVG =
  '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" style="display:block;flex:0 0 auto">' +
  '<path d="M2.5 7L5 9.5L10.5 3.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* Ink pill with paper text; the "saved" label seats like a pressed stamp -
 * the one justified animation, skipped under prefers-reduced-motion.
 * @font-face does not apply inside a shadow root in Chrome, so the button
 * relies on the system fallback stack. All sizes in px: rem in a shadow root
 * scales with the host page. */
const BUTTON_CSS = `
.ts-save {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 2147483647;
  display: inline-flex;
  align-items: center;
  font-family: 'Atkinson Hyperlegible', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  color: #f4f5f2;
  background: #232833;
  border: none;
  border-radius: 999px;
  padding: 11px 18px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(35, 40, 51, 0.24), 0 4px 12px rgba(35, 40, 51, 0.2);
  transition: background 90ms cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-font-smoothing: antialiased;
}
.ts-save:hover:not(:disabled) { background: #2c323f; }
.ts-save:active:not(:disabled) { background: #1b1f27; }
.ts-save:disabled { cursor: default; }
.ts-save:focus-visible { outline: 2px solid #f4f5f2; outline-offset: 2px; }
.ts-label { display: inline-flex; align-items: center; gap: 7px; color: #f4f5f2; }
.ts-save[data-state='saved'] .ts-label {
  color: #2e7d4f;
  animation: ts-stamp-seat 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.ts-save[data-state='error'] .ts-label { color: #b3402a; }
@keyframes ts-stamp-seat {
  0% { opacity: 0; transform: scale(1.12) rotate(-3deg); }
  55% { opacity: 1; transform: scale(0.97) rotate(0.5deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}
@media (prefers-reduced-motion: reduce) {
  .ts-save[data-state='saved'] .ts-label { animation: none; }
}
`;

/**
 * Floating save button - the only UI a content script owns. It shows only when
 * auto-capture is disabled in settings; otherwise there would be no way to save
 * at all. Scrapes the current page and submits the capture to the background.
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
      const style = document.createElement('style');
      style.textContent = BUTTON_CSS;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ts-save';
      button.setAttribute('aria-live', 'polite');

      const label = document.createElement('span');
      label.className = 'ts-label';
      button.append(label);

      let state: ButtonState = 'idle';
      let resetTimer: number | null = null;
      const cancelReset = () => {
        if (resetTimer !== null) {
          clearTimeout(resetTimer);
          resetTimer = null;
        }
      };
      const render = () => {
        button.dataset['state'] = state;
        if (state === 'saved') {
          label.innerHTML = `${CHECK_SVG}${LABELS.saved}`;
        } else {
          label.textContent = LABELS[state];
        }
        button.disabled = state === 'saving';
      };
      const settle = (next: ButtonState) => {
        cancelReset();
        state = next;
        render();
        resetTimer = ctx.setTimeout(() => {
          resetTimer = null;
          state = 'idle';
          render();
        }, 2000);
      };

      button.addEventListener('click', async () => {
        cancelReset();
        state = 'saving';
        render();
        const result = scraper.scrape(document, window.location.href);
        if (result.kind === 'failure') {
          console.warn(`[talkstash] ${result.reason}`);
          settle('error');
          return;
        }
        try {
          const outcome = await sendMessage('saveConversation', {
            capture: result.capture,
            origin: 'manual',
          });
          settle(outcome.ok ? 'saved' : 'error');
          if (!outcome.ok) console.warn(`[talkstash] save failed: ${outcome.error}`);
        } catch (error) {
          console.warn('[talkstash] messaging failed', error);
          settle('error');
        }
      });

      // Visibility depends only on the auto-capture setting (changes live from
      // the popup) - re-evaluate instead of mounting/unmounting.
      let autoCaptureEnabled = true;
      const updateVisibility = () => {
        button.style.display = autoCaptureEnabled ? 'none' : '';
      };
      void settingsItem.getValue().then((settings) => {
        autoCaptureEnabled = settings.autoCapture;
        updateVisibility();
      });
      ctx.onInvalidated(
        settingsItem.watch((settings) => {
          autoCaptureEnabled = settings.autoCapture;
          updateVisibility();
        }),
      );
      updateVisibility();

      render();
      container.append(style, button);
    },
  });

  ui.mount();
}
