<script lang="ts">
	import { SearchIcon } from '@lucide/svelte';
	import Input from '$lib/components/ui/input/input.svelte';

	export let value = '';
	export let placeholder = 'Search...';
	export let className = '';
</script>

<div class={`relative flex w-full max-w-md items-center ${className}`}>
	<div class="pointer-events-none absolute left-3 text-muted-foreground">
		<SearchIcon class="h-4 w-4" />
	</div>

	<Input
		bind:value
		{placeholder}
		class="w-full rounded-xl border-muted bg-card pl-10 shadow-sm transition-all focus:ring-2 focus:ring-primary/20"
	/>
</div>