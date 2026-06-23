<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Sheet from '../ui/sheet/index';

	let {
		title,
		description,
		children,
		sheetOpen = $bindable(false),
		errorText
	}: {
		title: string;
		description: string;
		children: Snippet<[]>;
		sheetOpen: boolean;
		errorText: string;
	} = $props();
</script>

<Sheet.Root bind:open={sheetOpen}>
	<Sheet.Content
		class="flex h-screen w-full flex-col gap-y-0 overflow-auto sm:min-w-100"
		side="right"
	>
		<Sheet.Header class="sticky top-0 flex flex-col border-b border-muted-foreground bg-background">
			<div class="flex flex-col">
				<h2 class="text-lg font-bold">{title}</h2>
				<h3 class="text-sm">
					{description}
				</h3>
			</div>
		</Sheet.Header>
		<div class="flex h-full flex-col gap-y-4 p-4">
			{#if errorText}
				<p class="text-sm text-red-500">{errorText}</p>
			{/if}
			{@render children()}
		</div>
	</Sheet.Content>
</Sheet.Root>
