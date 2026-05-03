<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import type { Organization } from '$lib/types';
	import { EllipsisIcon } from '@lucide/svelte';
	import { goto } from '$app/navigation';

	let { row }: { row: Organization } = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<EllipsisIcon />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Item
				onclick={() => {
					goto(`/organizations/${row.id}`);
				}}>View Details</DropdownMenu.Item
			>
				</DropdownMenu.Group>

	</DropdownMenu.Content>
</DropdownMenu.Root>

