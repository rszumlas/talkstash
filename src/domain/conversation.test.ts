import { describe, expect, it } from 'vitest';
import type { CapturedConversation } from './capture';
import {
  addTag,
  createConversation,
  EmptyConversation,
  matchesQuery,
  moveToFolder,
  refreshFromCapture,
  removeTag,
} from './conversation';
import { conversationId, folderId, tagName } from './values';

const capture: CapturedConversation = {
  platform: 'chatgpt',
  title: 'Planning a trip to Norway',
  sourceUrl: 'https://chatgpt.com/c/abc123',
  messages: [
    { role: 'user', text: 'Where should I go in Norway in June?' },
    { role: 'assistant', text: 'Consider the Lofoten islands and Bergen.' },
  ],
};

const id = conversationId('conv-1');

describe('creating a conversation from a capture', () => {
  it('assigns identity and capture date while preserving the captured content', () => {
    const c = createConversation(capture, id, 1_700_000_000_000, 'manual');

    expect(c.id).toBe(id);
    expect(c.capturedAt).toBe(1_700_000_000_000);
    expect(c.platform).toBe('chatgpt');
    expect(c.title).toBe(capture.title);
    expect(c.messages).toEqual(capture.messages);
    expect(c.tags).toEqual([]);
    expect(c.folderId).toBeNull();
  });

  it('preserves the source message order', () => {
    const c = createConversation(capture, id, 1, 'manual');
    expect(c.messages.map((m) => m.role)).toEqual(['user', 'assistant']);
  });

  it('rejects a capture with no messages', () => {
    expect(() => createConversation({ ...capture, messages: [] }, id, 1, 'manual')).toThrow(
      EmptyConversation,
    );
  });
});

describe('capture origin of a conversation', () => {
  it('records the origin it was created with', () => {
    expect(createConversation(capture, id, 1, 'auto').origin).toBe('auto');
    expect(createConversation(capture, id, 1, 'manual').origin).toBe('manual');
  });

  it('an explicit manual save upgrades an auto-captured conversation', () => {
    const auto = createConversation(capture, id, 1, 'auto');
    expect(refreshFromCapture(auto, capture, 2, 'manual').origin).toBe('manual');
  });

  it('an auto re-capture never downgrades a manually saved conversation', () => {
    const manual = createConversation(capture, id, 1, 'manual');
    expect(refreshFromCapture(manual, capture, 2, 'auto').origin).toBe('manual');
  });

  it('an auto re-capture of an auto capture stays auto', () => {
    const auto = createConversation(capture, id, 1, 'auto');
    expect(refreshFromCapture(auto, capture, 2, 'auto').origin).toBe('auto');
  });
});

describe('tagging a conversation', () => {
  it('adds a tag', () => {
    const c = addTag(createConversation(capture, id, 1, 'manual'), tagName('travel'));
    expect(c.tags).toEqual(['travel']);
  });

  it('adding an existing tag is a no-op, not an error', () => {
    const once = addTag(createConversation(capture, id, 1, 'manual'), tagName('travel'));
    const twice = addTag(once, tagName('Travel'));
    expect(twice.tags).toEqual(['travel']);
  });

  it('removes a tag; removing a missing one is a no-op', () => {
    const tagged = addTag(createConversation(capture, id, 1, 'manual'), tagName('travel'));
    expect(removeTag(tagged, tagName('travel')).tags).toEqual([]);
    expect(removeTag(tagged, tagName('work')).tags).toEqual(['travel']);
  });

  it('does not mutate the input conversation', () => {
    const before = createConversation(capture, id, 1, 'manual');
    addTag(before, tagName('travel'));
    expect(before.tags).toEqual([]);
  });
});

describe('moving a conversation to a folder', () => {
  it('sets the folder and allows clearing it', () => {
    const c = createConversation(capture, id, 1, 'manual');
    const moved = moveToFolder(c, folderId('f-1'));
    expect(moved.folderId).toBe('f-1');
    expect(moveToFolder(moved, null).folderId).toBeNull();
  });
});

describe('matching a conversation against a query', () => {
  const c = addTag(createConversation(capture, id, 1, 'manual'), tagName('travel'));

  it('matches a title fragment, case-insensitively', () => {
    expect(matchesQuery(c, 'norway')).toBe(true);
  });

  it('matches a fragment of message content', () => {
    expect(matchesQuery(c, 'lofoten')).toBe(true);
  });

  it('matches by tag', () => {
    expect(matchesQuery(c, 'travel')).toBe(true);
  });

  it('does not match when the query appears nowhere', () => {
    expect(matchesQuery(c, 'kubernetes')).toBe(false);
  });

  it('an empty query matches every conversation', () => {
    expect(matchesQuery(c, '  ')).toBe(true);
  });
});
