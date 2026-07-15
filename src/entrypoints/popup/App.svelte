<script lang="ts">
  import { sendMessage } from '../../adapters/messaging';
  import type { Conversation } from '../../domain/conversation';

  const PLATFORM_LABELS = { chatgpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini' } as const;

  let query = $state('');
  let conversations = $state.raw<readonly Conversation[]>([]);
  let loading = $state(true);
  let tagDrafts = $state<Record<string, string>>({});

  async function refresh(): Promise<void> {
    loading = true;
    try {
      conversations = await sendMessage('searchConversations', query);
    } finally {
      loading = false;
    }
  }

  // Initial load; re-run on query change (external world = background call).
  $effect(() => {
    const q = query; // read synchronously so the effect tracks it
    void q;
    void refresh();
  });

  async function addTag(id: string): Promise<void> {
    const tag = (tagDrafts[id] ?? '').trim();
    if (tag.length === 0) return;
    const outcome = await sendMessage('tagConversation', { id, tag });
    if (outcome.ok) {
      tagDrafts[id] = '';
      await refresh();
    }
  }

  async function removeTag(id: string, tag: string): Promise<void> {
    const outcome = await sendMessage('untagConversation', { id, tag });
    if (outcome.ok) await refresh();
  }

  async function remove(id: string): Promise<void> {
    const outcome = await sendMessage('deleteConversation', id);
    if (outcome.ok) await refresh();
  }

  function formatDate(epochMs: number): string {
    return new Date(epochMs).toLocaleDateString();
  }
</script>

<main>
  <header>
    <h1>Talkstash</h1>
    <input
      type="search"
      placeholder="Search conversations..."
      bind:value={query}
    />
  </header>

  {#if loading && conversations.length === 0}
    <p class="empty">Loading...</p>
  {:else if conversations.length === 0}
    <p class="empty">
      {query.trim() ? 'Nothing matches your search.' : 'No conversations saved yet. Open ChatGPT, Claude or Gemini and click "Save to Talkstash".'}
    </p>
  {:else}
    <ul>
      {#each conversations as c (c.id)}
        <li>
          <div class="row">
            <a href={c.sourceUrl} target="_blank" rel="noreferrer" title="Open original">
              {c.title}
            </a>
            <button class="delete" onclick={() => remove(c.id)} title="Delete">x</button>
          </div>
          <div class="meta">
            <span class="platform">{PLATFORM_LABELS[c.platform]}</span>
            <span>{formatDate(c.capturedAt)}</span>
            <span>{c.messages.length} msg</span>
          </div>
          <div class="tags">
            {#each c.tags as tag (tag)}
              <button class="tag" onclick={() => removeTag(c.id, tag)} title="Remove tag">
                {tag} x
              </button>
            {/each}
            <input
              class="tag-input"
              placeholder="+ tag"
              bind:value={tagDrafts[c.id]}
              onkeydown={(e) => e.key === 'Enter' && addTag(c.id)}
            />
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</main>

<style>
  main {
    width: 380px;
    max-height: 560px;
    overflow-y: auto;
    padding: 12px;
    font-family: system-ui, sans-serif;
    font-size: 13px;
    color: #1a1a2e;
  }
  header {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 10px;
  }
  h1 {
    margin: 0;
    font-size: 16px;
  }
  input[type='search'] {
    padding: 6px 10px;
    border: 1px solid #c9c9d4;
    border-radius: 6px;
    font-size: 13px;
  }
  input[type='search']:focus,
  .tag-input:focus {
    outline: 2px solid #1a1a2e;
    outline-offset: 1px;
  }
  .empty {
    color: #61616e;
    text-align: center;
    padding: 24px 8px;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  li {
    border: 1px solid #e3e3ea;
    border-radius: 8px;
    padding: 8px 10px;
  }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
  }
  .row a {
    font-weight: 600;
    color: #1a1a2e;
    text-decoration: none;
  }
  .row a:hover {
    text-decoration: underline;
  }
  .delete {
    border: none;
    background: none;
    color: #9a9aa6;
    cursor: pointer;
    font-size: 13px;
  }
  .delete:hover {
    color: #c0392b;
  }
  .meta {
    display: flex;
    gap: 10px;
    color: #61616e;
    font-size: 12px;
    margin-top: 2px;
  }
  .platform {
    font-weight: 600;
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 6px;
    align-items: center;
  }
  .tag {
    border: none;
    background: #ececf3;
    border-radius: 999px;
    padding: 2px 8px;
    font-size: 12px;
    cursor: pointer;
  }
  .tag:hover {
    background: #dcdce8;
  }
  .tag-input {
    border: 1px dashed #c9c9d4;
    border-radius: 999px;
    padding: 2px 8px;
    font-size: 12px;
    width: 64px;
  }
</style>
