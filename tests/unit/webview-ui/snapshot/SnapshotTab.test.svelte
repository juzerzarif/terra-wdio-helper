<script lang="ts">
  import SnapshotTab from '../../../../src/webview-ui/snapshot/SnapshotTab.svelte';

  export let content: string;
</script>

<SnapshotTab id="some-id" {...$$restProps}>
  <div>{content}</div>
</SnapshotTab>