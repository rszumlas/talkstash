import type { Conversation } from '../domain/conversation';
import type { ConversationRepository } from './ports';

export interface SearchConversationsDeps {
  repo: ConversationRepository;
}

export const makeSearchConversations =
  ({ repo }: SearchConversationsDeps) =>
  (query: string): Promise<readonly Conversation[]> =>
    repo.search(query);

export type SearchConversations = ReturnType<typeof makeSearchConversations>;
