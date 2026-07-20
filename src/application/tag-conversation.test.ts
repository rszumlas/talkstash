import { describe, expect, it } from 'vitest';
import { InMemoryConversationRepository } from '../adapters/in-memory-conversation-repository';
import type { CapturedConversation } from '../domain/capture';
import { makeDeleteConversation } from './delete-conversation';
import { makeSaveConversation } from './save-conversation';
import { makeTagConversation, makeUntagConversation, UnknownConversation } from './tag-conversation';
import { FixedClock, SequentialIdGenerator } from './testing/fakes';

const capture: CapturedConversation = {
  platform: 'gemini',
  title: 'CSS grid basics',
  sourceUrl: 'https://gemini.google.com/app/1',
  messages: [{ role: 'user', text: 'Explain CSS grid.' }],
};

function setup() {
  const repo = new InMemoryConversationRepository();
  const save = makeSaveConversation({
    repo,
    clock: new FixedClock(1),
    ids: new SequentialIdGenerator(),
  });
  const tag = makeTagConversation({ repo });
  const untag = makeUntagConversation({ repo });
  const remove = makeDeleteConversation({ repo });
  return { repo, save, tag, untag, remove };
}

describe('tagging a saved conversation', () => {
  it('adds a normalized tag and persists the change', async () => {
    const { repo, save, tag } = setup();
    const id = await save(capture, 'manual');

    await tag(id, '  Learning ');

    expect((await repo.findById(id))?.tags).toEqual(['learning']);
  });

  it('removes a tag and persists the change', async () => {
    const { repo, save, tag, untag } = setup();
    const id = await save(capture, 'manual');
    await tag(id, 'learning');

    await untag(id, 'learning');

    expect((await repo.findById(id))?.tags).toEqual([]);
  });

  it('rejects tagging a missing conversation', async () => {
    const { tag } = setup();
    await expect(tag('missing', 'learning')).rejects.toThrow(UnknownConversation);
  });
});

describe('deleting a conversation', () => {
  it('removes the conversation from the repository', async () => {
    const { repo, save, remove } = setup();
    const id = await save(capture, 'manual');

    await remove(id);

    expect(await repo.findAll()).toHaveLength(0);
  });
});
