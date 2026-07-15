import type { Conversation } from '../domain/conversation';
import type { ConversationId } from '../domain/values';

/** Driven port - implemented by adapters (IndexedDB, in-memory). */
export interface ConversationRepository {
  save(conversation: Conversation): Promise<void>;
  findById(id: ConversationId): Promise<Conversation | null>;
  findBySourceUrl(sourceUrl: string): Promise<Conversation | null>;
  findAll(): Promise<readonly Conversation[]>;
  search(query: string): Promise<readonly Conversation[]>;
  deleteById(id: ConversationId): Promise<void>;
}

export interface Clock {
  now(): number;
}

export interface IdGenerator {
  next(): string;
}
