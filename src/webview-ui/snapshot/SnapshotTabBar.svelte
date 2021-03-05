<script context="module" lang="ts">
  export type TabType = 'reference' | 'latest' | 'diff';
</script>

<script lang="ts">
  export let activeTab: TabType = 'reference';

  $: tabHighlightPos = (
    activeTab === 'reference' ? 0 * 7
    : activeTab === 'latest' ? 1 * 7
    : 2 * 7
  );

  const handleTabClick = (event: MouseEvent) => {
    activeTab = (event.currentTarget as HTMLButtonElement).dataset.snapshotTab as TabType;
  }
</script>

<div class="border-b dark:border-white dark:border-opacity-20 relative">
  <div>
    {#each ['reference', 'latest', 'diff'] as tab}
      <button 
        class="text-sm font-medium uppercase w-28 btn" 
        data-snapshot-tab={tab}
        role="tab"
        tabindex={0} 
        on:click={handleTabClick}
      >
        <div class="p-3 btn-content" tabindex={-1}>{tab}</div>
      </button>
    {/each}
  </div>
  <div class="h-0.5 w-28 bg-lightBlue-500 absolute bottom-0 transition-all" style={`left: ${tabHighlightPos}rem`} />
</div>

<style lang="postcss">
  .btn:focus, .btn-content:focus {
    outline: none;
  }

  .btn:focus > .btn-content {
    @apply ring ring-lightBlue-200;
  }
</style>
