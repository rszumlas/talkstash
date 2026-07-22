import { storage } from 'wxt/utils/storage';

/**
 * All extension settings live in this single versioned item. Auto-capture
 * stays OFF until the user explicitly picks a capture mode on the first-run
 * page - the privacy policy and store listing promise nothing is captured
 * before that choice. Everything stays in the browser.
 */
export interface Settings {
  readonly autoCapture: boolean;
  readonly captureChoiceMade: boolean;
}

interface SettingsV1 {
  readonly autoCapture: boolean;
}

export const settingsItem = storage.defineItem<Settings>('local:settings', {
  version: 2,
  fallback: { autoCapture: false, captureChoiceMade: false },
  migrations: {
    // v1 installs already ran with their setting in effect - keep it, never re-prompt.
    2: (old: SettingsV1): Settings => ({ autoCapture: old.autoCapture, captureChoiceMade: true }),
  },
});

export async function recordCaptureChoice(autoCapture: boolean): Promise<void> {
  await settingsItem.setValue({ autoCapture, captureChoiceMade: true });
}
