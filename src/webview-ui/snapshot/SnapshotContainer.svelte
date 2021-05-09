<script lang="ts">
  import DiffContainer from '../diff/DiffContainer.svelte';
  import DiffBadge from '../common/DiffBadge.svelte';
  import Image from '../common/Image.svelte';
  import SnapshotTab from './SnapshotTab.svelte';
  import SnapshotTabBar from './SnapshotTabBar.svelte';
  import { getContext } from 'svelte';
  import { sendWebviewMessage, vsCodeWritable } from '../vscodeWebviewApi';
  import type { WdioWebview } from '../../types';
  import type { TabType } from './SnapshotTabBar.svelte';

  export let resource: WdioWebview.Resource;

  const { locale, formFactor } = resource;
  const { defaultSnapshotTab, fallbackSnapshotTab } = getContext<WdioWebview.ExtensionConfig>('extension-config');
  const initialTab = resource[defaultSnapshotTab].exists ? defaultSnapshotTab : fallbackSnapshotTab;
  const containerId = `${locale}-${formFactor}`;
  const activeTab = vsCodeWritable<TabType>(`${containerId}-active-tab`, initialTab);
  const tabIds = {
    reference: `${containerId}-reference`,
    latest: `${containerId}-latest`,
    diff: `${containerId}-diff`,
  };
  let replaceButtonDisabled = false;

  const handleReplaceReferenceClick = () => {
    sendWebviewMessage({ intent: 'replaceReferenceWithLatest', locale, formFactor });
    /**
     * We're just gonna disable the button for a second cause there's no decent way to know when the operation is done
     * and either way re-requesting the action doesn't really do anything bad.
     */
    replaceButtonDisabled = true;
    setTimeout(() => {
      replaceButtonDisabled = false;
    }, 1000);
  };
</script>

<div class=" mb-8 last:mb-0 border-b last:border-b-0" data-snapshot-container>
  <div class="flex mb-2.5 px-2">
    <h2 class="text-2xl font-medium mr-2.5">{resource.locale} | {resource.formFactor}</h2>
    {#if resource.diff.exists} <DiffBadge /> {/if}
    <button
      disabled={!resource.diff.exists || replaceButtonDisabled}
      class="
        btn ml-auto focus:outline-none
        border-2 rounded border-current
        text-sm font-medium
        active:bg-gray-300 dark:active:bg-opacity-800 active:bg-opacity-30 disabled:active:bg-transparent
        disabled:cursor-not-allowed disabled:opacity-30"
      on:click={handleReplaceReferenceClick}
    >
      <div class="btn-content focus:outline-none rounded px-2 h-full w-full flex items-center" tabindex={-1}>
        Replace reference with latest
      </div>
    </button>
  </div>
  <SnapshotTabBar {tabIds} bind:activeTab={$activeTab} />
  <div class="p-5 h-[75vh]">
    <div class={$activeTab === 'diff' && resource.diff.exists ? 'h-full w-full' : 'h-[90%]'}>
      <SnapshotTab id={tabIds.reference} exists={resource.reference.exists} active={$activeTab === 'reference'}>
        <Image src={resource.reference.src} alt="Reference snapshot" />
      </SnapshotTab>
      <SnapshotTab id={tabIds.latest} exists={resource.latest.exists} active={$activeTab === 'latest'}>
        <Image src={resource.latest.src} alt="Latest snapshot" />
      </SnapshotTab>
      <SnapshotTab id={tabIds.diff} exists={resource.diff.exists} active={$activeTab === 'diff'}>
        <DiffContainer
          id={containerId}
          reference={resource.reference.src}
          latest={resource.latest.src}
          diff={resource.diff.src}
        />
      </SnapshotTab>
    </div>
  </div>
</div>

<style>
  .btn:focus > .btn-content {
    @apply ring ring-gray-400 ring-opacity-50 ring-offset-4 ring-offset-transparent;
  }
</style>
