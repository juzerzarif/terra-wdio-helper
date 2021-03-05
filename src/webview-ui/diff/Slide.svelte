<script lang="ts">
  import { vsCodeWritable } from "../vscodeWebviewApi";

  export let id: string;
  export let reference: string;
  export let latest: string;

  let latestImg: HTMLImageElement | undefined;
  let sliderBorder: HTMLInputElement | undefined;
  let resizeObserver: ResizeObserver;

  const compareSliderValue = vsCodeWritable<number>(`${id}-slider-range`, 50);

  $: {
    if (latestImg) {
      latestImg.style.clipPath = `inset(0 ${100 - $compareSliderValue}% 0 0)`;
    }
  }

  $: {
    if (latestImg) {
      resizeObserver?.disconnect();
      resizeObserver = new ResizeObserver(([{ contentRect }]) => {
        if (latestImg && sliderBorder) {
          const nativeWidth = latestImg.naturalWidth;
          const nativeHeight = latestImg.naturalHeight;
          const imageHeight = (nativeHeight/nativeWidth) * contentRect.width;
          const topOffset = (contentRect.height - imageHeight)/2;
          sliderBorder.style.height = `${imageHeight}px`;
          sliderBorder.style.top = `${topOffset}px`;
          sliderBorder.style.setProperty('--thumb-height', `${imageHeight}px`);
        }
      });

      resizeObserver.observe(latestImg);
    }
  }
</script>

<div class="h-full w-full relative flex justify-center">
  <div class="absolute h-full flex">
    <img class="object-contain  max-h-full" src={reference} alt="Reference snaphsot" />
  </div>
  <div class="absolute h-full flex">
    <img class="object-contain max-h-full" src={latest} alt="Latest snapshot" bind:this={latestImg} />
    <input 
      class="slider-border absolute w-full appearance-none bg-transparent focus:outline-none" 
      type="range" 
      min={0}
      max={100}
      value={$compareSliderValue}
      bind:this={sliderBorder}
      disabled
    />
    <input 
      class="compare-slider absolute w-full appearance-none focus:outline-none h-0" 
      type="range" 
      min={0} 
      max={100} 
      bind:value={$compareSliderValue} 
    />
  </div>
</div>

<style lang="postcss">
  .compare-slider {
    width: calc(100% + 40px);
    top: 50%;
    left: -20px;
    clip-path: inset(-20px 20px);
  }

  .compare-slider::-webkit-slider-thumb {
    appearance: none;
    height: 40px;
    width: 40px;
    @apply bg-white bg-opacity-30 border border-solid border-gray-600 rounded-full shadow-md cursor-pointer;
  }

  .slider-border::-webkit-slider-thumb {
    height: var(--thumb-height);
    @apply appearance-none bg-gray-700 w-0.5;
  }
</style>