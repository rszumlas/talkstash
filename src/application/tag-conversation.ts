import { addTag, removeTag } from '../domain/conversation';
import { conversationId, tagName } from '../domain/values';
import type { ConversationRepository } from './ports';

export class UnknownConversation extends Error {
  constructor(id: string) {
    super(`No conversation with id "${id}"`);
    this.name = 'UnknownConversation';
  }
}

export interface TagConversationDeps {
  repo: ConversationRepository;
}

export const makeTagConversation =
  ({ repo }: TagConversationDeps) =>
  async (rawId: string, rawTag: string): Promise<void> => {
    const id = conversationId(rawId);
    const existing = await repo.findById(id);
    if (!existing) throw new UnknownConversation(rawId);
    await repo.save(addTag(existing, tagName(rawTag)));
  };

export const makeUntagConversation =
  ({ repo }: TagConversationDeps) =>
  async (rawId: string, rawTag: string): Promise<void> => {
    const id = conversationId(rawId);
    const existing = await repo.findById(id);
    if (!existing) throw new UnknownConversation(rawId);
    await repo.save(removeTag(existing, tagName(rawTag)));
  };

export type TagConversation = ReturnType<typeof makeTagConversation>;
export type UntagConversation = ReturnType<typeof makeUntagConversation>;
