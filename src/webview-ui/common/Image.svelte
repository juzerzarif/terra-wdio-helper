<script lang="ts">
  export let src: string;
  export let alt: string;
</script>

<div class="h-full w-full flex items-center justify-center"> 
  <img class="object-scale-down h-full" {src} {alt} />
</div>
