# Chrome Web Store - listing materials

Source of truth for the CWS dashboard. Any change to capture behavior MUST update this
file and docs/privacy-policy.md in the same commit.

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
Save conversations from ChatGPT, Claude and Gemini and search them all in one place -
full-text, across titles and message content.

YOU CHOOSE HOW SAVING WORKS
On first run, Talkstash asks how you want to save: automatically as you chat
(recommended - your library builds itself), or only when you click the "Save to
Talkstash" button. Nothing is captured before you choose, and you can switch modes
anytime in the popup.

YOUR OWN COPY
Conversations on AI platforms live at the provider's mercy: accounts get locked, chats
get deleted, retention policies change, temporary chats vanish. Your Talkstash copy is
yours - stored on your device, available offline.

PRIVACY FIRST
Everything is stored locally in your browser (IndexedDB). No server, no account, no
analytics, no tracking. Talkstash makes zero network requests with your data - the
code is readable and unobfuscated, you can verify it yourself.

Permissions: storage (local saving) and access to the three chat sites only.

## Permission justifications (for the Privacy practices tab)

- `storage`: Persists saved conversations and the user's capture-mode choice, locally
  in the browser's IndexedDB / extension storage. No data is transmitted anywhere.
- Host permission chatgpt.com / chat.openai.com: Shows the "Save to Talkstash" button
  on ChatGPT and reads the currently open conversation's visible text so it can be
  saved locally. Automatic capture happens ONLY after the user explicitly enables it
  on the extension's first-run setup page; otherwise a conversation is read only when
  the user clicks the button.
- Host permission claude.ai: Same as above, for Claude.
- Host permission gemini.google.com: Same as above, for Gemini.

Single purpose: saving and organizing the user's AI chat conversations locally.

## Reviewer note (dev note)

On install, Talkstash opens a one-time setup page where the user chooses between
automatic saving of conversations they open, or saving only via the on-page "Save to
Talkstash" button. Nothing is captured before this choice is made.

To test: install, pick either mode on the setup page, log into chatgpt.com / claude.ai
/ gemini.google.com (any account) and open a conversation. In auto-save mode the
conversation appears in the extension popup by itself; in click mode, click the
floating button first. The popup supports full-text search, tagging and deletion. All
data is stored locally in IndexedDB (inspect via DevTools > Application > IndexedDB >
talkstash). The extension makes no network requests.

## Assets - status

- [x] Icons 16/32/48/96/128 (public/icon-*.png)
- [x] Promo tile 440x280 (docs/store-assets/promo-tile-440x280.png)
- [ ] Min. 1 screenshot 1280x800 - TODO manually with the extension loaded
      (popup with saved conversations + a chat page with the save button;
      consider a third one showing the first-run setup page)
