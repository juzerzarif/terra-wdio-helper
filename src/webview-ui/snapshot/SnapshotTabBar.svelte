<script context="module" lang="ts">
  export type TabType = 'reference' | 'latest' | 'diff';
</script>

<script lang="ts">
  export let activeTab: TabType = 'reference';
  export let tabIds: { reference: string; latest: string; diff: string };

  $: tabHighlightPos = activeTab === 'reference' ? 0 * 7 : activeTab === 'latest' ? 1 * 7 : 2 * 7;

  const handleTabClick = (event: MouseEvent) => {
    activeTab = (event.currentTarget as HTMLButtonElement).dataset.snapshotTab as TabType;
  };

  const tabTypes: TabType[] = ['reference', 'latest', 'diff'];
</script>

<div class="border-b dark:border-white dark:border-opacity-20 relative">
  <div role="tablist">
    {#each tabTypes as tab}
      <button
        class="text-sm font-medium uppercase w-28 focus:outline-none btn"
        data-snapshot-tab={tab}
        role="tab"
        aria-selected={activeTab === tab}
        aria-controls={tabIds[tab]}
        tabindex={0}
        on:click={handleTabClick}
      >
        <div class="p-3 focus:outline-none btn-content" tabindex={-1}>{tab}</div>
      </button>
    {/each}
  </div>
  <div
    data-testid="selected-highlight"
    class="h-0.5 w-28 bg-lightBlue-500 absolute bottom-0 transition-all"
    style={`left: ${tabHighlightPos}rem`}
  />
</div>

<style lang="postcss">
  .btn:focus > .btn-content {
    @apply ring ring-lightBlue-200;
  }
</style>
