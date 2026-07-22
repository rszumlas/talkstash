import * as v from 'valibot';
import { IdbConversationRepository } from '../adapters/idb-conversation-repository';
import {
  ConversationIdInputSchema,
  onMessage,
  SaveConversationInputSchema,
  SearchQuerySchema,
  TagInputSchema,
  type SaveOutcome,
} from '../adapters/messaging';
import { makeDeleteConversation } from '../application/delete-conversation';
import type { Clock, IdGenerator } from '../application/ports';
import { makeSaveConversation } from '../application/save-conversation';
import { makeSearchConversations } from '../application/search-conversations';
import { makeTagConversation, makeUntagConversation } from '../application/tag-conversation';
import { settingsItem } from '../utils/storage';

const systemClock: Clock = { now: () => Date.now() };
const cryptoIds: IdGenerator = { next: () => crypto.randomUUID() };

function failure(error: unknown): SaveOutcome {
  return { ok: false, error: error instanceof Error ? error.message : String(error) };
}

export default defineBackground(() => {
  // Composition root of the write side - the only context that knows IndexedDB.
  // The repository is awaited inside handlers (MV3 service worker can be
  // restarted at any point); listeners are registered synchronously below.
  const repoPromise = IdbConversationRepository.open();

  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
      void browser.tabs.create({ url: browser.runtime.getURL('/onboarding.html') });
    } else if (reason === 'update') {
      void settingsItem.migrate();
    }
  });

  onMessage('saveConversation', async ({ data }): Promise<SaveOutcome> => {
    try {
      const { capture, origin } = v.parse(SaveConversationInputSchema, data);
      const repo = await repoPromise;
      const save = makeSaveConversation({ repo, clock: systemClock, ids: cryptoIds });
      const id = await save(capture, origin);
      return { ok: true, id };
    } catch (error) {
      return failure(error);
    }
  });

  onMessage('searchConversations', async ({ data }) => {
    const query = v.parse(SearchQuerySchema, data);
    const repo = await repoPromise;
    const search = makeSearchConversations({ repo });
    const hits = await search(query);
    return [...hits].sort((a, b) => b.capturedAt - a.capturedAt);
  });

  onMessage('tagConversation', async ({ data }): Promise<SaveOutcome> => {
    try {
      const { id, tag } = v.parse(TagInputSchema, data);
      const repo = await repoPromise;
      await makeTagConversation({ repo })(id, tag);
      return { ok: true, id };
    } catch (error) {
      return failure(error);
    }
  });

  onMessage('untagConversation', async ({ data }): Promise<SaveOutcome> => {
    try {
      const { id, tag } = v.parse(TagInputSchema, data);
      const repo = await repoPromise;
      await makeUntagConversation({ repo })(id, tag);
      return { ok: true, id };
    } catch (error) {
      return failure(error);
    }
  });

  onMessage('deleteConversation', async ({ data }): Promise<SaveOutcome> => {
    try {
      const id = v.parse(ConversationIdInputSchema, data);
      const repo = await repoPromise;
      await makeDeleteConversation({ repo })(id);
      return { ok: true, id };
    } catch (error) {
      return failure(error);
    }
  });
});
