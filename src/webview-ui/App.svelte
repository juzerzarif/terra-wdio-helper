<script lang="ts">
  import DiffBadge from "./common/DiffBadge.svelte";
  import SnapshotContainer from "./snapshot/SnapshotContainer.svelte";
  import TailwindBase from './tailwind/Base.svelte';
  import TailwindComponents from './tailwind/Components.svelte';
  import TailwindUtilities from './tailwind/Utilities.svelte';
  import { onMount, setContext } from "svelte";
  import { getWebviewData, isCurrentThemeDark, createScrollSync } from "./webviewStateHelpers";
  import { sendWebviewMessage } from "./vscodeWebviewApi";

  const { snapshotData, extensionConfig } = getWebviewData();
  const darkMode = isCurrentThemeDark();
  const syncScroll = createScrollSync();

  onMount(() => {
    sendWebviewMessage({ intent: 'webviewReady', ready: true });
  })

  $: {
    if ($darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  $: diffExists = !!$snapshotData?.resources.some(({diff}) => diff.exists);

  $: {
    if ($extensionConfig) {
      setContext('extension-config', $extensionConfig);
    }
  }
</script>

<TailwindBase />
<TailwindComponents />
<TailwindUtilities />
<main class="w-full h-full flex flex-col">
  {#if $snapshotData}
    <div class="flex p-4 shadow space-x-3">
      <h1 class="text-2xl italic font-medium flex">{$snapshotData.name}</h1>
      {#if diffExists} <DiffBadge /> {/if}
    </div>
    <div data-testid="content" class="flex-grow overflow-auto p-4 pb-14" use:syncScroll>
      {#each $snapshotData.resources as resource}
        {#key `${resource.locale}-${resource.formFactor}`}
          <SnapshotContainer {resource} />
        {/key}
      {/each}
    </div>
  {/if}
</main>

<style global>
  html, body {
    height: 100%;
    width: 100%
  }
</style>
