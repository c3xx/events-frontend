<script lang="ts">
	import { SearchIcon } from '@lucide/svelte';

	export let value = '';
	export let placeholder = 'Search...';
</script>

<div class="flex w-full items-center gap-2 border-b border-border px-4 py-2">
	<SearchIcon class="h-4 w-4 shrink-0 text-muted-foreground" />

	<input
		bind:value
		{placeholder}
		class="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
	/>

	
</div>