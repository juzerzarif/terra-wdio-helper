<script lang="ts">
  export let reference: string;
  export let latest: string;
</script>

<div data-testid="two-up-diff" class="h-full w-full grid grid-cols-2 gap-3 content-center">
  <img class="object-scale-down place-self-end" src={reference} alt="Reference snapshot" />
  <img class="object-scale-down place-self-start" src={latest} alt="Latest snapshot" />
</div>
