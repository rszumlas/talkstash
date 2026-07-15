import type { CapturedConversation } from '../domain/capture';
import { createConversation, refreshFromCapture } from '../domain/conversation';
import { conversationId, type ConversationId } from '../domain/values';
import type { Clock, ConversationRepository, IdGenerator } from './ports';

export interface SaveConversationDeps {
  repo: ConversationRepository;
  clock: Clock;
  ids: IdGenerator;
}

/**
 * Saves a capture. Re-capturing the same sourceUrl refreshes the stored
 * conversation (content, title, capturedAt) while keeping id, tags and folder.
 */
export const makeSaveConversation =
  ({ repo, clock, ids }: SaveConversationDeps) =>
  async (capture: CapturedConversation): Promise<ConversationId> => {
    const existing = await repo.findBySourceUrl(capture.sourceUrl);
    const conversation = existing
      ? refreshFromCapture(existing, capture, clock.now())
      : createConversation(capture, conversationId(ids.next()), clock.now());
    await repo.save(conversation);
    return conversation.id;
  };

export type SaveConversation = ReturnType<typeof makeSaveConversation>;
