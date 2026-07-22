# Talkstash

Chrome extension (MV3): one searchable library for AI chat conversations (ChatGPT,
Claude, Gemini). Save conversations with one click, tag them, search them full-text -
everything stored locally in the browser (IndexedDB), zero data sent anywhere.

## Stack

TypeScript + WXT (wxt.dev) + Svelte 5 (runes) + idb + @webext-core/messaging + valibot.
Tests: Vitest + fake-indexeddb + @webext-core/fake-browser (WxtVitest).

## Rules (hard)

- TDD (red-green-refactor, tests through ports with in-memory fakes, adapter contract
  tests, HTML fixtures for scrapers), hexagonal architecture (imports point inward
  only), tactical DDD (branded types + factories, aggregate as pure functions,
  ubiquitous language).
- `npm run check` and `npm run test` must be green before finishing a task.
- ZERO em/en dashes in prose. Always "-".
- Everything in this repo is written in English: docs, comments, test names, commits.

## Architecture (hexagonal)

```
src/
  domain/        # pure domain: Conversation (aggregate), value objects, no external imports
  application/   # use cases (SaveConversation, SearchConversations...) + ports (interfaces)
  adapters/      # IdbConversationRepository, per-platform DOM scrapers (ACL), messaging
  entrypoints/   # WXT: background (write-side composition root), *.content, popup (Svelte)
```

Hard boundaries:
- A content script NEVER writes to IndexedDB - it scrapes the DOM into a DTO and sends
  it to the background via messaging.
- Writes happen ONLY in the background (single writer). The popup calls use cases
  "remotely" through messaging.
- Svelte components never call the repository - they call use cases.
- No DOM selector leaks outside its platform's scraper module.

## Project glossary (ubiquitous language)

- **Conversation** - a saved AI conversation (not "chat", not "thread").
- **Capture** - the act/result of capturing a conversation from a page
  (CapturedConversation = DTO before identity is assigned; a Conversation is created
  from a Capture in SaveConversation).
- **Folder** - an organizational container; a conversation is in at most one.
- **Tag** - a repeatable label (not "label").
- **Platform** - the conversation source: chatgpt | claude | gemini.

## Running

```
npm install
npm run dev     # watch build; load .output/chrome-mv3 unpacked in Chrome
npm run test    # vitest
npm run build   # production build (adapter .output/chrome-mv3)
npm run zip     # package for Chrome Web Store
```

## Chrome Web Store notes

- Minimal permissions on purpose: `storage` + host_permissions for the three chat
  domains only. No `<all_urls>`.
- Code stays readable and unobfuscated; the privacy policy (docs/privacy-policy.md)
  states exactly what is read from the DOM and that everything stays local.
- **Docs-vs-code guardrail (hard rule):** any change to data-handling behavior (what
  is captured, when, defaults, storage) MUST update `docs/privacy-policy.md` AND
  `docs/store-listing.md` in the same commit. The store listing file is the source of
  truth for what gets pasted into the CWS dashboard.
- Capture-mode consent: auto-capture stays OFF until the user picks a mode on the
  first-run page (`entrypoints/onboarding/`); the setting is `Settings.captureChoiceMade`
  in `utils/storage.ts` (versioned item, v1 installs migrate as "already chosen").
