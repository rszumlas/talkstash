import { wrap, type IDBPDatabase } from 'idb';
import type { ConversationRepository } from '../application/ports';
import type { Conversation } from '../domain/conversation';
import { matchesQuery } from '../domain/conversation';
import type { ConversationId } from '../domain/values';

const DB_NAME = 'talkstash';
const DB_VERSION = 1;
const STORE = 'conversations';

/** Stored document - versioned from the very first write (cannot be added retroactively). */
interface StoredConversation extends Conversation {
  readonly schemaVersion: 1;
}

function toStored(c: Conversation): StoredConversation {
  return { ...c, schemaVersion: 1 };
}

function fromStored({ schemaVersion: _v, ...c }: StoredConversation): Conversation {
  return c;
}

export class IdbConversationRepository implements ConversationRepository {
  private readonly db: IDBPDatabase;

  private constructor(db: IDBPDatabase) {
    this.db = db;
  }

  /** The injectable factory keeps tests isolated (fresh fake IDBFactory per test). */
  static async open(
    factory: IDBFactory = globalThis.indexedDB,
    name: string = DB_NAME,
  ): Promise<IdbConversationRepository> {
    const request = factory.open(name, DB_VERSION);
    request.onupgradeneeded = () => {
      // Additive upgrades only; data migrations go here for future versions.
      const store = request.result.createObjectStore(STORE, { keyPath: 'id' });
      store.createIndex('bySourceUrl', 'sourceUrl', { unique: true });
    };
    const db = (await wrap(request)) as IDBPDatabase;
    return new IdbConversationRepository(db);
  }

  async save(conversation: Conversation): Promise<void> {
    await this.db.put(STORE, toStored(conversation));
  }

  async findById(id: ConversationId): Promise<Conversation | null> {
    const stored = (await this.db.get(STORE, id)) as StoredConversation | undefined;
    return stored ? fromStored(stored) : null;
  }

  async findBySourceUrl(sourceUrl: string): Promise<Conversation | null> {
    const stored = (await this.db.getFromIndex(STORE, 'bySourceUrl', sourceUrl)) as
      | StoredConversation
      | undefined;
    return stored ? fromStored(stored) : null;
  }

  async findAll(): Promise<readonly Conversation[]> {
    const stored = (await this.db.getAll(STORE)) as StoredConversation[];
    return stored.map(fromStored);
  }

  async search(query: string): Promise<readonly Conversation[]> {
    // Naive full scan is fine at MVP scale; swap for an index behind the same port if it hurts.
    const all = await this.findAll();
    return all.filter((c) => matchesQuery(c, query));
  }

  async deleteById(id: ConversationId): Promise<void> {
    await this.db.delete(STORE, id);
  }
}
