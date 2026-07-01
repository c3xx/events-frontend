<script lang="ts">
	import { Search, Delete } from '@lucide/svelte';

	let {
		placeholder = '',
		value = $bindable('')
	}: {
		placeholder?: string;
		value?: string;
	} = $props();
</script>

<div class="relative flex w-full items-center">
	<Search class="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 transform" />
	<input
		bind:value
		{placeholder}
		class="h-9 w-full min-w-0 rounded-sm border bg-transparent px-8 py-1 text-sm transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm"
	/>
	<button
		class={[
			'absolute top-1/2 right-2.5 -translate-y-1/2 transform p-0 transition-all duration-150',
			value.length > 0 ? 'opacity-100' : 'opacity-0'
		]}
		onclick={() => (value = '')}
	>
		<Delete class="size-4" />
	</button>
</div>
