import type { CapturedMessage, MessageRole } from '../../domain/capture';

export interface TurnSelector {
  /** Fallback chain - tried in order, first selector with any hits wins. */
  readonly selectors: readonly string[];
  readonly role: MessageRole;
}

function collectForRole(doc: Document, spec: TurnSelector): readonly Element[] {
  for (const selector of spec.selectors) {
    const hits = [...doc.querySelectorAll(selector)];
    if (hits.length > 0) return hits;
  }
  return [];
}

/**
 * Collects user and assistant turns and merges them in document order.
 * Sanity check per hit: non-empty text; empty elements are dropped.
 */
export function collectMessages(
  doc: Document,
  specs: readonly TurnSelector[],
): readonly CapturedMessage[] {
  const hits: { element: Element; role: MessageRole }[] = [];
  for (const spec of specs) {
    for (const element of collectForRole(doc, spec)) {
      hits.push({ element, role: spec.role });
    }
  }
  hits.sort((a, b) =>
    a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
  );
  return hits
    .map(({ element, role }) => ({ role, text: (element.textContent ?? '').trim() }))
    .filter((m) => m.text.length > 0);
}

/** Page title with the platform suffix/prefix stripped. */
export function cleanTitle(rawTitle: string, platformNames: readonly string[]): string {
  let title = rawTitle.trim();
  for (const name of platformNames) {
    for (const pattern of [` - ${name}`, ` | ${name}`]) {
      if (title.endsWith(pattern)) title = title.slice(0, -pattern.length).trim();
    }
    for (const pattern of [`${name} - `, `${name} | `]) {
      if (title.startsWith(pattern)) title = title.slice(pattern.length).trim();
    }
  }
  return title.length > 0 ? title : 'Untitled conversation';
}
