import { describe, expect, it } from 'vitest';
import { InMemoryConversationRepository } from '../adapters/in-memory-conversation-repository';
import type { CapturedConversation } from '../domain/capture';
import { makeSaveConversation } from './save-conversation';
import { makeSearchConversations } from './search-conversations';
import { FixedClock, SequentialIdGenerator } from './testing/fakes';

function setup() {
  const repo = new InMemoryConversationRepository();
  const save = makeSaveConversation({
    repo,
    clock: new FixedClock(1),
    ids: new SequentialIdGenerator(),
  });
  const search = makeSearchConversations({ repo });
  return { save, search };
}

const norway: CapturedConversation = {
  platform: 'chatgpt',
  title: 'Trip to Norway',
  sourceUrl: 'https://chatgpt.com/c/1',
  messages: [{ role: 'user', text: 'Fjords and hiking' }],
};

const svelte: CapturedConversation = {
  platform: 'claude',
  title: 'Svelte 5 runes',
  sourceUrl: 'https://claude.ai/chat/2',
  messages: [{ role: 'user', text: 'How does $derived work?' }],
};

describe('searching conversations', () => {
  it('returns only conversations matching the query', async () => {
    const { save, search } = setup();
    await save(norway);
    await save(svelte);

    const hits = await search('fjords');

    expect(hits.map((c) => c.title)).toEqual(['Trip to Norway']);
  });

  it('an empty query returns all conversations', async () => {
    const { save, search } = setup();
    await save(norway);
    await save(svelte);

    expect(await search('')).toHaveLength(2);
  });
});
