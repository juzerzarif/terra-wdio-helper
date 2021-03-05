<script lang="ts">
  import DiffContainer from '../diff/DiffContainer.svelte';
  import DiffBadge from '../common/DiffBadge.svelte';
  import Image from '../common/Image.svelte';
  import SnapshotTab from './SnapshotTab.svelte';
  import SnapshotTabBar from './SnapshotTabBar.svelte';
  import { getContext } from 'svelte';
  import { vsCodeWritable } from "../vscodeWebviewApi";
  import type { WdioWebview } from '../../types';
  import type { TabType } from './SnapshotTabBar.svelte';
  
  export let resource: WdioWebview.Resource;

  const { locale, formFactor } = resource;
  const { defaultSnapshotTab, fallbackSnapshotTab } = getContext<WdioWebview.ExtensionConfig>('extension-config');
  const initialTab = resource[defaultSnapshotTab].exists ? defaultSnapshotTab : fallbackSnapshotTab;
  const containerId = `${locale}-${formFactor}`;
  const activeTab = vsCodeWritable<TabType>(`${containerId}-active-tab`, initialTab);
</script>

<div class=" mb-8 last:mb-0 border-b last:border-b-0" data-snapshot-container>
  <div class="flex mb-2.5 px-2">
    <h2 class="text-2xl font-medium mr-2.5">{resource.locale} | {resource.formFactor}</h2>
    {#if resource.diff.exists} <DiffBadge /> {/if}
  </div>
  <SnapshotTabBar bind:activeTab={$activeTab} />
  <div class="p-5 content">
    <div class={$activeTab === 'diff' && resource.diff.exists ? 'h-full w-full' : 'tab-container'}>
      <SnapshotTab exists={resource.reference.exists} active={$activeTab === 'reference'}>
        <Image src={resource.reference.src} alt="Reference snapshot" />
      </SnapshotTab>
      <SnapshotTab exists={resource.latest.exists} active={$activeTab === 'latest'}>
        <Image src={resource.latest.src} alt="Latest snapshot" />
      </SnapshotTab>
      <SnapshotTab exists={resource.diff.exists} active={$activeTab === 'diff'}>
        <DiffContainer id={containerId} reference={resource.reference.src} latest={resource.latest.src} diff={resource.diff.src} />
      </SnapshotTab>
    </div>
  </div>
</div>

<style>
  .tab-container {
    height: 90%;
  }

  .content {
    height: 75vh;
  }
</style>
