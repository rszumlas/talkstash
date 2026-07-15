declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };

export type ConversationId = Brand<string, 'ConversationId'>;
export type FolderId = Brand<string, 'FolderId'>;
export type TagName = Brand<string, 'TagName'>;

export const PLATFORMS = ['chatgpt', 'claude', 'gemini'] as const;
export type Platform = (typeof PLATFORMS)[number];

export class InvalidTagName extends Error {
  constructor(raw: string) {
    super(`Invalid tag name: "${raw}"`);
    this.name = 'InvalidTagName';
  }
}

export class InvalidId extends Error {
  constructor(raw: string) {
    super(`Invalid id: "${raw}"`);
    this.name = 'InvalidId';
  }
}

/** Single validation gate for tag names; the only place allowed to assert the brand. */
export function tagName(raw: string): TagName {
  const normalized = raw.trim().toLowerCase();
  if (normalized.length === 0 || normalized.length > 50) throw new InvalidTagName(raw);
  return normalized as TagName;
}

export function conversationId(raw: string): ConversationId {
  if (raw.trim().length === 0) throw new InvalidId(raw);
  return raw as ConversationId;
}

export function folderId(raw: string): FolderId {
  if (raw.trim().length === 0) throw new InvalidId(raw);
  return raw as FolderId;
}
