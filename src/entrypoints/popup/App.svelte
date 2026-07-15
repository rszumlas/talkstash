<script lang="ts">
  import { sendMessage } from '../../adapters/messaging';
  import type { Conversation } from '../../domain/conversation';

  const PLATFORM_STAMPS = {
    chatgpt: { label: 'GPT', title: 'ChatGPT' },
    claude: { label: 'CLD', title: 'Claude' },
    gemini: { label: 'GEM', title: 'Gemini' },
  } as const;

  let query = $state('');
  let conversations = $state.raw<readonly Conversation[]>([]);
  let total = $state(0);
  let loading = $state(true);
  let addingFor = $state<string | null>(null);
  let confirmingFor = $state<string | null>(null);
  let tagDraft = $state('');

  async function refresh(): Promise<void> {
    loading = true;
    try {
      conversations = await sendMessage('searchConversations', query);
      if (query.trim() === '') total = conversations.length;
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

  function startAddingTag(id: string): void {
    confirmingFor = null;
    addingFor = id;
    tagDraft = '';
  }

  async function commitTag(id: string): Promise<void> {
    const tag = tagDraft.trim();
    if (tag.length === 0) {
      addingFor = null;
      return;
    }
    const outcome = await sendMessage('tagConversation', { id, tag });
    if (outcome.ok) {
      tagDraft = '';
      addingFor = null;
      await refresh();
    }
  }

  async function removeTag(id: string, tag: string): Promise<void> {
    const outcome = await sendMessage('untagConversation', { id, tag });
    if (outcome.ok) await refresh();
  }

  async function remove(id: string): Promise<void> {
    const outcome = await sendMessage('deleteConversation', id);
    confirmingFor = null;
    if (outcome.ok) {
      total = Math.max(0, total - 1);
      await refresh();
    }
  }

  function open(c: Conversation): void {
    window.open(c.sourceUrl, '_blank', 'noreferrer');
  }

  function formatDate(epochMs: number): string {
    return new Date(epochMs).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function focusOnMount(node: HTMLElement): void {
    node.focus();
  }
</script>

<main>
  <header>
    <span class="wordmark">Talkstash</span>
    {#if total > 0}
      <span class="count">{total} saved</span>
    {/if}
  </header>

  <div class="search">
    <span class="glass" aria-hidden="true">
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="6.5" cy="6.5" r="4.25" stroke="currentColor" stroke-width="1.4" />
        <path d="M9.7 9.7L13 13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
      </svg>
    </span>
    <input type="search" placeholder="Search your stash&hellip;" bind:value={query} />
  </div>

  <div class="list">
    {#if loading && conversations.length === 0}
      <p class="loading">Loading&hellip;</p>
    {:else if total === 0}
      <div class="empty">
        <div class="empty-heading">Your stash is empty</div>
        <div class="empty-body">
          Open a chat on ChatGPT, Claude or Gemini and hit Save to Talkstash.
        </div>
      </div>
    {:else if conversations.length === 0}
      <div class="empty">
        <div class="empty-heading">No matches</div>
        <div class="empty-body">
          No matches for &ldquo;{query.trim()}&rdquo;. Try a tag or a different word.
        </div>
      </div>
    {:else}
      {#each conversations as c (c.id)}
        <div
          class="row"
          role="button"
          tabindex="0"
          onclick={() => open(c)}
          onkeydown={(e) => {
            if (e.key === 'Enter' && e.target === e.currentTarget) {
              e.preventDefault();
              open(c);
            }
          }}
        >
          <div class="title-line">
            <span class="title">{c.title}</span>
            <span class="actions">
              {#if addingFor === c.id}
                <input
                  class="tag-input"
                  type="text"
                  placeholder="add tag&hellip;"
                  bind:value={tagDraft}
                  use:focusOnMount
                  onclick={(e) => e.stopPropagation()}
                  onkeydown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void commitTag(c.id);
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      addingFor = null;
                    }
                  }}
                />
              {:else}
                <button
                  type="button"
                  class="add-tag"
                  onclick={(e) => {
                    e.stopPropagation();
                    startAddingTag(c.id);
                  }}
                >
                  + tag
                </button>
                {#if confirmingFor === c.id}
                  <span class="confirm" role="none" onclick={(e) => e.stopPropagation()}>
                    <span class="confirm-question">Delete this?</span>
                    <button type="button" class="confirm-delete" onclick={() => void remove(c.id)}>
                      Delete
                    </button>
                    <span class="confirm-divider">|</span>
                    <button
                      type="button"
                      class="confirm-cancel"
                      onclick={() => (confirmingFor = null)}
                    >
                      Cancel
                    </button>
                  </span>
                {:else}
                  <button
                    type="button"
                    class="delete-trigger"
                    onclick={(e) => {
                      e.stopPropagation();
                      addingFor = null;
                      confirmingFor = c.id;
                    }}
                  >
                    Delete
                  </button>
                {/if}
              {/if}
            </span>
          </div>

          <div class="meta">
            <span class="stamp" title={PLATFORM_STAMPS[c.platform].title}>
              {PLATFORM_STAMPS[c.platform].label}
            </span>
            <span>{formatDate(c.capturedAt)}</span>
            <span aria-hidden="true">&middot;</span>
            <span>{c.messages.length} messages</span>
          </div>

          {#if c.tags.length > 0}
            <div class="tags">
              {#each c.tags as tag (tag)}
                <span class="chip">
                  {tag}
                  <button
                    type="button"
                    class="chip-remove"
                    aria-label={`Remove tag ${tag}`}
                    onclick={(e) => {
                      e.stopPropagation();
                      void removeTag(c.id, tag);
                    }}
                  >
                    &times;
                  </button>
                </span>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</main>

<style>
  main {
    width: 400px;
    height: 600px;
    display: flex;
    flex-direction: column;
    background: var(--paper);
    font-family: var(--font-ui);
    color: var(--ink);
    overflow: hidden;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 12px;
    flex: 0 0 auto;
  }
  .wordmark {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 21px;
    letter-spacing: 0.01em;
    line-height: 1;
    user-select: none;
  }
  .count {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: var(--tracking-mono);
    color: var(--pencil);
  }

  .search {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 16px 12px;
    background: var(--paper-raised);
    border: 1px solid var(--border-strong);
    border-radius: 4px;
    padding: 0 10px;
    height: 34px;
    flex: 0 0 auto;
  }
  .search:focus-within {
    outline: 2px solid var(--border-focus);
    outline-offset: 1px;
  }
  .glass {
    display: flex;
    color: var(--pencil);
  }
  .search input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    font-family: var(--font-ui);
    font-size: 14px;
    color: var(--ink);
    line-height: 1.2;
    padding: 0;
  }
  .search input::placeholder {
    color: var(--pencil);
  }

  .list {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    border-top: 1px solid var(--line);
  }

  .loading {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: var(--tracking-mono);
    color: var(--pencil);
    padding: 16px;
    margin: 0;
  }

  .empty {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 48px 32px;
  }
  .empty-heading {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 18px;
    line-height: 1.2;
  }
  .empty-body {
    font-size: 14px;
    color: var(--pencil);
    line-height: 1.5;
    max-width: 300px;
  }

  .row {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--line);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease-quiet);
  }
  .row:hover {
    background: var(--paper-sunk);
  }
  .row:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: -2px;
  }

  .title-line {
    display: flex;
    align-items: baseline;
    gap: 12px;
  }
  .title {
    flex: 1;
    min-width: 0;
    font-size: 15px;
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .actions {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--dur-fast);
  }
  .row:hover .actions,
  .row:focus-within .actions {
    opacity: 1;
    pointer-events: auto;
  }

  .add-tag {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: var(--tracking-mono);
    color: var(--pencil);
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 0;
  }
  .add-tag:hover,
  .add-tag:focus-visible {
    color: var(--ink);
  }

  .tag-input {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: var(--tracking-mono);
    color: var(--ink);
    background: var(--paper-raised);
    border: 1px solid var(--border-strong);
    border-radius: 2px;
    padding: 2px 6px;
    width: 78px;
  }
  .tag-input:focus {
    outline: 2px solid var(--border-focus);
    outline-offset: 1px;
  }

  .delete-trigger,
  .confirm-delete,
  .confirm-cancel {
    font-family: var(--font-ui);
    font-size: 13px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 2px;
    line-height: 1.2;
  }
  .delete-trigger,
  .confirm-cancel {
    color: var(--pencil);
  }
  .delete-trigger:hover,
  .delete-trigger:focus-visible,
  .confirm-cancel:hover,
  .confirm-cancel:focus-visible {
    color: var(--ink);
  }
  .confirm {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .confirm-question {
    font-size: 13px;
    color: var(--ink);
  }
  .confirm-delete {
    color: var(--stamp-red);
    font-weight: 700;
  }
  .confirm-divider {
    color: var(--line);
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: var(--tracking-mono);
    color: var(--pencil);
  }
  .stamp {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: var(--tracking-monogram);
    color: var(--ink);
    padding: 2px 4px;
    border: 1.5px solid var(--ink);
    border-radius: 2px;
    line-height: 1;
    text-transform: uppercase;
    user-select: none;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 1px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: var(--tracking-mono);
    color: var(--pencil);
    border: 1px solid var(--line);
    border-radius: 2px;
    padding: 1px 6px;
    line-height: 1.4;
    white-space: nowrap;
  }
  .chip-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: var(--pencil);
    cursor: pointer;
    padding: 0;
    width: 12px;
    height: 12px;
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 1;
  }
  .chip-remove:hover,
  .chip-remove:focus-visible {
    color: var(--ink);
  }
</style>
