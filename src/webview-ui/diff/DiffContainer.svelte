<script lang="ts">
  import Default from "./Default.svelte";
  import TwoUp from "./TwoUp.svelte";
  import Slide from "./Slide.svelte";
  import Onion from "./Onion.svelte";
  import { vsCodeWritable } from "../vscodeWebviewApi";
  import { getContext, SvelteComponent } from "svelte";
  import type { ExtensionConfiguration } from "../../types";

  export let id: string;
  export let reference: string;
  export let latest: string;
  export let diff: string;

  type DiffType = 'default' | 'two-up' | 'slide' | 'onion';
  const { defaultDiffOption } = getContext<ExtensionConfiguration>('extension-config');
  const activeDiff = vsCodeWritable<DiffType>(`${id}-active-diff`, defaultDiffOption)

  const diffComponents = [
    ['default', Default, { diff }],
    ['two-up', TwoUp, { reference, latest }],
    ['slide', Slide, { id, reference, latest }],
    ['onion', Onion, { id, reference, latest }],
  ];

  const handleDiffOptionClick = (event: MouseEvent) => {
    $activeDiff = (event.currentTarget as HTMLButtonElement).dataset.diffOption as DiffType;
  }
</script>

<div class="h-full w-full">
  <div class="image-container">
    {#each diffComponents as [diffType, component, props]}
      <div class={`h-full w-full ${$activeDiff !== diffType ? 'hidden' : ''}`}>
        <svelte:component this={component} {...props} />
      </div>  
    {/each}
  </div>
  <div class="options-container flex justify-center items-center space-x-3">
    {#each diffComponents as [diffType]}
      <button 
        data-diff-option={diffType}
        class={`btn w-20 shadow rounded-full capitalize font-medium text-sm text-black ${$activeDiff === diffType ? 'bg-lightBlue-400' : 'bg-gray-200'}`}
        on:click={handleDiffOptionClick}
      >
        <div class="py-1 px-3 rounded-full btn-content" tabindex={-1}>{diffType}</div>
      </button>
    {/each}
  </div>
</div>

<style lang="postcss">
  .image-container {
    height: 90%;
  }

  .options-container {
    height: 10%;
  }

  .btn:focus, .btn-content:focus {
    outline: none;
  }

  .btn:focus > .btn-content {
    @apply ring ring-lightBlue-200;
  }
</style>