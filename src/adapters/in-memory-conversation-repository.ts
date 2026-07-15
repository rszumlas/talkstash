import type { Conversation } from '../domain/conversation';
import { matchesQuery } from '../domain/conversation';
import type { ConversationId } from '../domain/values';
import type { ConversationRepository } from '../application/ports';

/** In-memory adapter - used in tests and kept honest by the repository contract test. */
export class InMemoryConversationRepository implements ConversationRepository {
  private readonly byId = new Map<ConversationId, Conversation>();

  async save(conversation: Conversation): Promise<void> {
    this.byId.set(conversation.id, conversation);
  }

  async findById(id: ConversationId): Promise<Conversation | null> {
    return this.byId.get(id) ?? null;
  }

  async findBySourceUrl(sourceUrl: string): Promise<Conversation | null> {
    for (const c of this.byId.values()) {
      if (c.sourceUrl === sourceUrl) return c;
    }
    return null;
  }

  async findAll(): Promise<readonly Conversation[]> {
    return [...this.byId.values()];
  }

  async search(query: string): Promise<readonly Conversation[]> {
    return [...this.byId.values()].filter((c) => matchesQuery(c, query));
  }

  async deleteById(id: ConversationId): Promise<void> {
    this.byId.delete(id);
  }
}
