// The /auto import provides the global IDB classes (IDBRequest etc.) that
// idb's wrap() instanceof-checks against; isolation still comes from a fresh
// IDBFactory per test below, not from the shared global factory.
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { describe } from 'vitest';
import { conversationRepositoryContract } from './conversation-repository.contract';
import { IdbConversationRepository } from './idb-conversation-repository';

describe('repository contract: IndexedDB adapter', () => {
  // A fresh IDBFactory per test = full isolation, parallel-safe.
  conversationRepositoryContract(() => IdbConversationRepository.open(new IDBFactory()));
});
