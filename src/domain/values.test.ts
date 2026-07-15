import { describe, expect, it } from 'vitest';
import { InvalidTagName, tagName } from './values';

describe('tag name', () => {
  it('normalizes casing and whitespace', () => {
    expect(tagName('  Work ')).toBe('work');
  });

  it('rejects an empty tag', () => {
    expect(() => tagName('   ')).toThrow(InvalidTagName);
  });

  it('rejects a tag longer than 50 characters', () => {
    expect(() => tagName('x'.repeat(51))).toThrow(InvalidTagName);
  });

  it('two tags with the same normalized value are equal (===)', () => {
    expect(tagName('Work')).toBe(tagName('work '));
  });
});
