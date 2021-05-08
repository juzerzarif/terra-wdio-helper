<script lang="ts">
  import NoResource from '../common/NoResource.svelte';

  export let exists = true;
  export let active = true;
  export let id: string;
</script>

<div data-testid={id} {id} class={`h-full w-full ${!active ? 'hidden' : ''}`} role="tabpanel">
  {#if exists}
    <slot />
  {:else}
    <NoResource />
  {/if}
</div>
