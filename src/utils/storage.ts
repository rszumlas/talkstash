import { storage } from 'wxt/utils/storage';

/**
 * All extension settings live in this single versioned item. Auto-capture is
 * on by default - disclosed on first run and in the store listing; everything
 * stays in the browser.
 */
export interface Settings {
  readonly autoCapture: boolean;
}

export const settingsItem = storage.defineItem<Settings>('local:settings', {
  version: 1,
  fallback: { autoCapture: true },
});
