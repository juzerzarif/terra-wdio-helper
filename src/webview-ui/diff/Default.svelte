<script lang="ts">
  import Image from "../common/Image.svelte";

  export let diff: string;
</script>

<Image src={diff} alt="Default diff" />
