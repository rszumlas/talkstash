# Talkstash Privacy Policy

Last updated: 2026-07-14

Talkstash is a Chrome extension that lets you save, tag and search your AI chat
conversations (ChatGPT, Claude, Gemini). This policy describes exactly what data the
extension touches and where it goes.

## What Talkstash reads

When you click the "Save to Talkstash" button on a supported chat page
(chatgpt.com, chat.openai.com, claude.ai, gemini.google.com), the extension reads the
visible content of the currently open conversation from the page: the conversation
title, the text of the messages, and the page URL. Nothing is read automatically in
the background - a conversation is only captured when you explicitly click the button.

## Where your data is stored

All captured conversations, tags and folders are stored **locally in your browser**,
in the extension's own IndexedDB database on your device.

- **Nothing is sent to any server.** Talkstash has no backend, no analytics, no
  telemetry and makes no network requests with your data.
- Your data never leaves your device.
- Uninstalling the extension permanently deletes all stored data.

## What Talkstash does NOT do

- It does not collect, transmit or sell any personal data.
- It does not read pages other than the supported chat sites listed above.
- It does not track your browsing.
- It does not use cookies or any third-party services.

## Permissions explained

- `storage` - used to persist your saved conversations locally on your device.
- Host access to chatgpt.com, chat.openai.com, claude.ai and gemini.google.com -
  required so the save button can appear on those sites and read the conversation
  you choose to save. The extension has no access to any other website.

## Future changes

If a future version introduces an optional cloud sync feature, it will be strictly
opt-in, clearly labelled, and this policy will be updated before any such feature
ships. The default will always remain local-only.

## Contact

Questions about this policy: rszumlas0000@gmail.com
