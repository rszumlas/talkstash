import { recordCaptureChoice } from '../../utils/storage';

function byId(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (el === null) throw new Error(`onboarding: missing #${id}`);
  return el;
}

function wireChoice(buttonId: string, autoCapture: boolean): void {
  byId(buttonId).addEventListener('click', () => {
    void recordCaptureChoice(autoCapture).then(() => {
      byId('choices').hidden = true;
      byId('done').hidden = false;
    });
  });
}

wireChoice('choose-auto', true);
wireChoice('choose-manual', false);
