import { expect, it } from 'vitest';
import type { ConversationRepository } from '../application/ports';
import type { CapturedConversation } from '../domain/capture';
import { addTag, createConversation } from '../domain/conversation';
import { conversationId, tagName } from '../domain/values';

const baseCapture: CapturedConversation = {
  platform: 'chatgpt',
  title: 'Trip to Norway',
  sourceUrl: 'https://chatgpt.com/c/norway',
  messages: [
    { role: 'user', text: 'Fjords and hiking in June?' },
    { role: 'assistant', text: 'Lofoten is stunning then.' },
  ],
};

function conversation(id: string, overrides: Partial<CapturedConversation> = {}) {
  return createConversation({ ...baseCapture, ...overrides }, conversationId(id), 1_700_000_000_000);
}

/**
 * Repository contract test - the single set of behaviours every
 * ConversationRepository adapter must satisfy. Run against BOTH the in-memory
 * fake and the IndexedDB adapter; this is what earns the fake the right to
 * stand in for the real adapter in use case tests.
 */
export function conversationRepositoryContract(
  makeRepo: () => Promise<ConversationRepository>,
): void {
  it('finds a saved conversation by id', async () => {
    const repo = await makeRepo();
    const c = conversation('c-1');
    await repo.save(c);

    expect(await repo.findById(c.id)).toEqual(c);
  });

  it('returns null for an unknown id', async () => {
    const repo = await makeRepo();
    expect(await repo.findById(conversationId('missing'))).toBeNull();
  });

  it('finds a conversation by source url', async () => {
    const repo = await makeRepo();
    const c = conversation('c-1');
    await repo.save(c);

    expect(await repo.findBySourceUrl(c.sourceUrl)).toEqual(c);
    expect(await repo.findBySourceUrl('https://chatgpt.com/c/other')).toBeNull();
  });

  it('overwrites a conversation when saved again with the same id', async () => {
    const repo = await makeRepo();
    const c = conversation('c-1');
    await repo.save(c);
    const tagged = addTag(c, tagName('travel'));
    await repo.save(tagged);

    expect(await repo.findById(c.id)).toEqual(tagged);
    expect(await repo.findAll()).toHaveLength(1);
  });

  it('returns all saved conversations', async () => {
    const repo = await makeRepo();
    await repo.save(conversation('c-1'));
    await repo.save(conversation('c-2', { sourceUrl: 'https://chatgpt.com/c/two' }));

    expect(await repo.findAll()).toHaveLength(2);
  });

  it('full-text search matches a fragment of message content', async () => {
    const repo = await makeRepo();
    await repo.save(conversation('c-1'));
    await repo.save(
      conversation('c-2', {
        title: 'Svelte runes',
        sourceUrl: 'https://chatgpt.com/c/svelte',
        messages: [{ role: 'user', text: 'How does $derived work?' }],
      }),
    );

    const hits = await repo.search('lofoten');
    expect(hits.map((c) => c.title)).toEqual(['Trip to Norway']);
  });

  it('an empty query returns everything', async () => {
    const repo = await makeRepo();
    await repo.save(conversation('c-1'));
    expect(await repo.search('')).toHaveLength(1);
  });

  it('deletes a conversation by id; deleting a missing one is a no-op', async () => {
    const repo = await makeRepo();
    const c = conversation('c-1');
    await repo.save(c);

    await repo.deleteById(c.id);
    expect(await repo.findById(c.id)).toBeNull();

    await repo.deleteById(conversationId('missing'));
    expect(await repo.findAll()).toHaveLength(0);
  });
}
