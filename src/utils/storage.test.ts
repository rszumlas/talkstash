import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import { recordCaptureChoice, settingsItem } from './storage';

describe('choosing how conversations are captured', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('keeps auto-capture off until a first-run choice is made', async () => {
    //expected
    expect(await settingsItem.getValue()).toEqual({
      autoCapture: false,
      captureChoiceMade: false,
    });
  });

  it('records an auto-capture choice', async () => {
    //when
    await recordCaptureChoice(true);
    //then
    expect(await settingsItem.getValue()).toEqual({
      autoCapture: true,
      captureChoiceMade: true,
    });
  });

  it('records a save-on-click choice', async () => {
    //when
    await recordCaptureChoice(false);
    //then
    expect(await settingsItem.getValue()).toEqual({
      autoCapture: false,
      captureChoiceMade: true,
    });
  });

  it('treats migrated v1 installs as having already chosen', async () => {
    //given
    await fakeBrowser.storage.local.set({
      settings: { autoCapture: true },
      settings$: { v: 1 },
    });
    //when
    await settingsItem.migrate();
    //then
    expect(await settingsItem.getValue()).toEqual({
      autoCapture: true,
      captureChoiceMade: true,
    });
  });
});
