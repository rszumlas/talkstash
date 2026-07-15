import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  // Do not spawn a separate browser instance on `npm run dev` - Google login
  // is blocked there. Load the extension unpacked in the regular Chrome
  // profile instead (chrome://extensions -> Load unpacked -> .output/chrome-mv3).
  webExt: {
    disabled: true,
  },
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    name: 'Talkstash',
    description:
      'One searchable library for your ChatGPT, Claude and Gemini chats. Tagged, offline, 100% local.',
    permissions: ['storage'],
    host_permissions: [
      'https://chat.openai.com/*',
      'https://chatgpt.com/*',
      'https://claude.ai/*',
      'https://gemini.google.com/*',
    ],
  },
});
