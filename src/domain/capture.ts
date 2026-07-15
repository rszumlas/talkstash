import type { Platform } from './values';

export type MessageRole = 'user' | 'assistant';

export interface CapturedMessage {
  readonly role: MessageRole;
  readonly text: string;
}

/**
 * Raw result of capturing a conversation from a chat page, before it is given
 * an identity. A Conversation is created from a Capture in SaveConversation.
 * Plain serializable data - it crosses the content script -> background boundary.
 */
export interface CapturedConversation {
  readonly platform: Platform;
  readonly title: string;
  readonly sourceUrl: string;
  readonly messages: readonly CapturedMessage[];
}
