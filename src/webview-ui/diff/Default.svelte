<script lang="ts">
  import Image from "../common/Image.svelte";

  export let diff: string;
</script>

<div data-testid="default-diff" class="h-full w-full">
  <Image src={diff} alt="Default diff" />
</div>
