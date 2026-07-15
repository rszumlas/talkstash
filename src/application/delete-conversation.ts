import { conversationId } from '../domain/values';
import type { ConversationRepository } from './ports';

export interface DeleteConversationDeps {
  repo: ConversationRepository;
}

export const makeDeleteConversation =
  ({ repo }: DeleteConversationDeps) =>
  async (rawId: string): Promise<void> => {
    await repo.deleteById(conversationId(rawId));
  };

export type DeleteConversation = ReturnType<typeof makeDeleteConversation>;
