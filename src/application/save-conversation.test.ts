import { describe, expect, it } from 'vitest';
import { InMemoryConversationRepository } from '../adapters/in-memory-conversation-repository';
import type { CapturedConversation } from '../domain/capture';
import { tagName } from '../domain/values';
import { addTag } from '../domain/conversation';
import { makeSaveConversation } from './save-conversation';
import { FixedClock, SequentialIdGenerator } from './testing/fakes';

const capture: CapturedConversation = {
  platform: 'claude',
  title: 'Refactoring a Svelte store',
  sourceUrl: 'https://claude.ai/chat/xyz',
  messages: [{ role: 'user', text: 'How do I share $state between components?' }],
};

function setup() {
  const repo = new InMemoryConversationRepository();
  const save = makeSaveConversation({
    repo,
    clock: new FixedClock(1_700_000_000_000),
    ids: new SequentialIdGenerator(),
  });
  return { repo, save };
}

describe('saving a captured conversation', () => {
  it('saves the conversation, assigning an id and a capture date', async () => {
    const { repo, save } = setup();

    const id = await save(capture, 'manual');

    const stored = await repo.findById(id);
    expect(stored).not.toBeNull();
    expect(stored?.title).toBe('Refactoring a Svelte store');
    expect(stored?.capturedAt).toBe(1_700_000_000_000);
    expect(stored?.origin).toBe('manual');
  });

  it('an explicit save of an auto-captured conversation makes it manual for good', async () => {
    const { repo, save } = setup();
    const id = await save(capture, 'auto');
    expect((await repo.findById(id))?.origin).toBe('auto');

    await save(capture, 'manual');
    expect((await repo.findById(id))?.origin).toBe('manual');

    await save(capture, 'auto');
    expect((await repo.findById(id))?.origin).toBe('manual');
  });

  it('re-capturing the same source refreshes content while keeping id, tags and folder', async () => {
    const { repo, save } = setup();
    const id = await save(capture, 'manual');
    const tagged = addTag((await repo.findById(id))!, tagName('svelte'));
    await repo.save(tagged);

    const grown: CapturedConversation = {
      ...capture,
      messages: [...capture.messages, { role: 'assistant', text: 'Use a .svelte.ts module.' }],
    };
    const secondId = await save(grown, 'auto');

    expect(secondId).toBe(id);
    const stored = await repo.findById(id);
    expect(stored?.messages).toHaveLength(2);
    expect(stored?.tags).toEqual(['svelte']);
    expect(await repo.findAll()).toHaveLength(1);
  });

  it('different sources produce separate conversations', async () => {
    const { repo, save } = setup();
    await save(capture, 'manual');
    await save({ ...capture, sourceUrl: 'https://claude.ai/chat/other' }, 'manual');

    expect(await repo.findAll()).toHaveLength(2);
  });
});
