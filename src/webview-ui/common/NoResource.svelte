<script lang="ts">
  import Tumbleweed from './Tumbleweed.svelte';
</script>

<div class="h-full w-full flex flex-col justify-center items-center">
  <p class="snapshot-text text-4xl text-center font-semibold opacity-40 mb-6">
    Resource Does Not Exist
  </p>
  <div class="h-2/6 w-full opacity-40">
    <Tumbleweed />
  </div>
</div>

<style>
  .snapshot-text {
    font-family: 'Balsamiq Sans', cursive;
  }
</style>
