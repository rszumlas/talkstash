import { describe } from 'vitest';
import { conversationRepositoryContract } from './conversation-repository.contract';
import { InMemoryConversationRepository } from './in-memory-conversation-repository';

describe('repository contract: in-memory adapter', () => {
  conversationRepositoryContract(async () => new InMemoryConversationRepository());
});
