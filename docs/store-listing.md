# Chrome Web Store - listing materials

## Name

Talkstash - One Library for All Your AI Chats

## Short description (max 132 chars)

Search your ChatGPT, Claude & Gemini chats in one place. Keep the ones that matter -
tagged, offline, 100% local.

## Full description

Your best AI conversations are scattered across ChatGPT, Claude and Gemini - three
separate histories, none of them searchable together. "Where did I talk about this...
and with which AI?" Talkstash ends that.

ONE LIBRARY, EVERY AI
Save conversations from ChatGPT, Claude and Gemini with one click and search them all
in one place - full-text, across titles and message content.

BOOKMARKS, NOT HISTORY
Your chat history is hundreds of throwaway conversations; searching it means digging
through noise. Talkstash works like bookmarks: you deliberately keep only the
conversations worth keeping, and tag them your way ("invoices", "svelte", "ideas").
A curated knowledge base instead of a junk drawer.

YOUR OWN COPY
Conversations on AI platforms live at the provider's mercy: accounts get locked, chats
get deleted, retention policies change, temporary chats vanish. Your Talkstash copy is
yours - stored on your device, available offline, forever.

PRIVACY FIRST
Everything is stored locally in your browser (IndexedDB). No server, no account, no
analytics, no tracking. Talkstash makes zero network requests with your data - the
code is readable and unobfuscated, you can verify it yourself.

Permissions: storage (local saving) and access to the three chat sites only.

## Permission justifications (for the Privacy practices tab)

- `storage`: Persists conversations the user explicitly saves, locally in the
  browser's IndexedDB. No data is transmitted anywhere.
- Host permission chatgpt.com / chat.openai.com: Shows the "Save to Talkstash"
  button on ChatGPT and reads the currently open conversation's visible text ONLY
  when the user clicks the button.
- Host permission claude.ai: Same as above, for Claude.
- Host permission gemini.google.com: Same as above, for Gemini.

Single purpose: saving and organizing the user's AI chat conversations locally.

## Reviewer note (dev note)

Talkstash adds a floating "Save to Talkstash" button on chatgpt.com, claude.ai and
gemini.google.com. To test: log into any of these services (any account), open a
conversation, click the button, then open the extension popup to see the saved
conversation, search it, and add/remove tags. All data is stored locally in
IndexedDB (inspect via DevTools > Application > IndexedDB > talkstash). The
extension makes no network requests.

## Assets - status

- [x] Icons 16/32/48/96/128 (public/icon-*.png)
- [x] Promo tile 440x280 (docs/store-assets/promo-tile-440x280.png)
- [ ] Min. 1 screenshot 1280x800 - TODO manually with the extension loaded
      (popup with saved conversations + a chat page with the save button)
