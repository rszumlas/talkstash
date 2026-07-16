import { defineExtensionMessaging } from '@webext-core/messaging';
import * as v from 'valibot';
import { CAPTURE_ORIGINS } from '../domain/capture';
import type { Conversation } from '../domain/conversation';
import { PLATFORMS } from '../domain/values';

/** Serializable outcome crossing the messaging boundary. */
export type SaveOutcome =
  | { readonly ok: true; readonly id: string }
  | { readonly ok: false; readonly error: string };

/**
 * The single typed protocol between content scripts, popup and background.
 * Payloads are validated with valibot on the receiving side (background) -
 * senders are trusted code, but the boundary still parses, never casts.
 */
interface ProtocolMap {
  saveConversation(input: unknown): SaveOutcome;
  searchConversations(query: string): Conversation[];
  tagConversation(input: { id: string; tag: string }): SaveOutcome;
  untagConversation(input: { id: string; tag: string }): SaveOutcome;
  deleteConversation(id: string): SaveOutcome;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();

export const CapturedConversationSchema = v.object({
  platform: v.picklist(PLATFORMS),
  title: v.pipe(v.string(), v.trim(), v.minLength(1)),
  sourceUrl: v.pipe(v.string(), v.url()),
  messages: v.pipe(
    v.array(
      v.object({
        role: v.picklist(['user', 'assistant']),
        text: v.pipe(v.string(), v.minLength(1)),
      }),
    ),
    v.minLength(1),
  ),
});

/** Payload of `saveConversation`: what was scraped plus how the save was initiated. */
export const SaveConversationInputSchema = v.object({
  capture: CapturedConversationSchema,
  origin: v.picklist(CAPTURE_ORIGINS),
});
