<script lang="ts">
  import NoResource from "../common/NoResource.svelte";

  export let exists = true;
  export let active = true;
</script>

{#if exists}
  <div class={`h-full w-full ${!active ? 'hidden' : ''}`}>
    <slot />
  </div>
{:else}
  <NoResource hidden={!active} />
{/if}
