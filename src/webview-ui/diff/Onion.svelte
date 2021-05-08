<script lang="ts">
  import { vsCodeWritable } from '../vscodeWebviewApi';

  export let id: string;
  export let reference: string;
  export let latest: string;

  const latestPeelValue = vsCodeWritable<number>(`${id}-onion-range`, 50);
  let latestImg: HTMLImageElement | undefined;

  $: if (latestImg) {
    latestImg.style.opacity = `${$latestPeelValue / 100}`;
  }
</script>

<div data-testid="onion-diff" class="h-[90%] relative">
  <img class="absolute h-full w-full object-scale-down" src={reference} alt="Reference snaphsot" />
  <img class="absolute h-full w-full object-scale-down" src={latest} alt="Latest snapshot" bind:this={latestImg} />
</div>
<div class="h-[10%] w-[50rem] flex space-x-3 max-w-full mx-auto">
  <span class="w-24 text-base text-right flex justify-end items-center">Reference</span>
  <input
    class="onion-slider appearance-none w-full h-1 rounded-full bg-gray-400 bg-opacity-40 focus:outline-none self-center"
    type="range"
    min={0}
    max={100}
    bind:value={$latestPeelValue}
  />
  <span class="w-24 text-base flex items-center">Latest</span>
</div>

<style global lang="postcss">
  .onion-slider::-webkit-slider-thumb {
    appearance: none;
    @apply h-4 w-4 bg-lightBlue-500 rounded-full cursor-pointer transition-all;
  }

  .onion-slider:focus::-webkit-slider-thumb,
  .onion-slider:hover::-webkit-slider-thumb {
    @apply ring-4 ring-lightBlue-200 dark:ring-opacity-30 ring-opacity-70;
  }

  .onion-slider:active::-webkit-slider-thumb {
    @apply ring-8;
  }
</style>
