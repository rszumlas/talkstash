# Talkstash Privacy Policy

Last updated: 2026-07-22

Talkstash is a Chrome extension that lets you save, tag and search your AI chat
conversations (ChatGPT, Claude, Gemini). This policy describes exactly what data the
extension touches and where it goes.

## What Talkstash reads, and when

On its first run, Talkstash opens a one-time setup page where you choose how
conversations get saved. Nothing is captured before you make that choice.

- **Auto-save** (recommended on the setup page): after you enable it, the extension
  reads the visible content of conversations you open on the supported chat sites
  (chatgpt.com, chat.openai.com, claude.ai, gemini.google.com) - the conversation
  title, the text of the messages, and the page URL - and saves them to your local
  library as you browse.
- **Only when I click**: the extension reads a conversation only at the moment you
  click the "Save to Talkstash" button on the page.

You can switch between the two modes at any time in the extension popup. In both
modes the extension reads only the supported chat sites, and only conversation
content - never other tabs, never your browsing history. Temporary/incognito-style
chats are never auto-saved.

## Where your data is stored

All captured conversations and tags are stored **locally in your browser**, in the
extension's own IndexedDB database on your device.

- **Nothing is sent to any server.** Talkstash has no backend, no account, no
  analytics, no telemetry and makes no network requests with your data.
- Your data never leaves your device.
- Uninstalling the extension permanently deletes all stored data.

## What Talkstash does NOT do

- It does not collect, transmit or sell any personal data.
- It does not read pages other than the supported chat sites listed above.
- It does not track your browsing.
- It does not use cookies or any third-party services.

## Permissions explained

- `storage` - used to persist your saved conversations and your capture-mode choice
  locally on your device.
- Host access to chatgpt.com, chat.openai.com, claude.ai and gemini.google.com -
  required to show the save button and to read the conversation content that gets
  saved, in whichever capture mode you chose. The extension has no access to any
  other website.

## Future changes

If a future version introduces an optional cloud sync feature, it will be strictly
opt-in, clearly labelled, and this policy will be updated before any such feature
ships. The default will always remain local-only.

## Contact

Questions about this policy: rszumlas0000@gmail.com
