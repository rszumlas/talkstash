import type { CapturedConversation, CapturedMessage } from './capture';
import type { ConversationId, FolderId, Platform, TagName } from './values';

/**
 * Aggregate root. State is only ever changed through the functions in this
 * module; they return new objects (survives structuredClone across contexts).
 */
export interface Conversation {
  readonly id: ConversationId;
  readonly platform: Platform;
  readonly title: string;
  readonly sourceUrl: string;
  /** Epoch ms of the last capture. */
  readonly capturedAt: number;
  readonly messages: readonly CapturedMessage[];
  readonly tags: readonly TagName[];
  readonly folderId: FolderId | null;
}

export class EmptyConversation extends Error {
  constructor() {
    super('A conversation must contain at least one message');
    this.name = 'EmptyConversation';
  }
}

export function createConversation(
  capture: CapturedConversation,
  id: ConversationId,
  capturedAt: number,
): Conversation {
  if (capture.messages.length === 0) throw new EmptyConversation();
  return {
    id,
    platform: capture.platform,
    title: capture.title,
    sourceUrl: capture.sourceUrl,
    capturedAt,
    messages: capture.messages,
    tags: [],
    folderId: null,
  };
}

/** Re-capture of the same source: refresh content, keep identity, tags and folder. */
export function refreshFromCapture(
  existing: Conversation,
  capture: CapturedConversation,
  capturedAt: number,
): Conversation {
  if (capture.messages.length === 0) throw new EmptyConversation();
  return {
    ...existing,
    title: capture.title,
    messages: capture.messages,
    capturedAt,
  };
}

export function addTag(c: Conversation, tag: TagName): Conversation {
  return c.tags.includes(tag) ? c : { ...c, tags: [...c.tags, tag] };
}

export function removeTag(c: Conversation, tag: TagName): Conversation {
  return c.tags.includes(tag) ? { ...c, tags: c.tags.filter((t) => t !== tag) } : c;
}

export function moveToFolder(c: Conversation, folder: FolderId | null): Conversation {
  return { ...c, folderId: folder };
}

/** Case-insensitive full-text match across title, message texts and tags. */
export function matchesQuery(c: Conversation, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return true;
  if (c.title.toLowerCase().includes(q)) return true;
  if (c.tags.some((t) => t.includes(q))) return true;
  return c.messages.some((m) => m.text.toLowerCase().includes(q));
}
