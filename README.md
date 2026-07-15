# Talkstash

One searchable library for all your AI chats - ChatGPT, Claude and Gemini in one place.

Talkstash is a Chrome extension that lets you save the AI conversations worth keeping,
tag them your way and search them all together - full-text, across every platform.

- **One library, every AI** - save from ChatGPT, Claude and Gemini with one click,
  search everything in one place.
- **Bookmarks, not history** - keep only the conversations that matter, instead of
  digging through hundreds of throwaway chats.
- **Your own copy** - stored locally on your device, available offline, independent
  of any provider's retention policy.
- **Privacy first** - everything lives in your browser's IndexedDB. No server, no
  account, no analytics, no tracking, zero network requests with your data. This
  repository is public so you can verify that yourself.

[Privacy policy](docs/privacy-policy.md)

## Development

Requirements: Node 20+.

```
npm install
npm run dev     # watch build (load .output/chrome-mv3 unpacked in Chrome)
npm run test    # vitest
npm run check   # svelte-check
npm run build   # production build
npm run zip     # package for Chrome Web Store
```

To load the extension: `chrome://extensions` -> enable Developer mode ->
"Load unpacked" -> select `.output/chrome-mv3`.

## Architecture

TypeScript + [WXT](https://wxt.dev) + Svelte 5, hexagonal (ports & adapters):

```
src/
  domain/        # pure domain: Conversation aggregate, value objects - no browser APIs
  application/   # use cases (save, search, tag, delete) + ports (interfaces)
  adapters/      # IndexedDB repository, per-platform DOM scrapers, typed messaging
  entrypoints/   # WXT: background (composition root), content scripts, popup (Svelte)
```

Content scripts never touch storage - they scrape the page into a DTO and message the
background, which is the single writer to IndexedDB. Each platform's DOM selectors are
confined to one scraper module tested against HTML fixtures.
