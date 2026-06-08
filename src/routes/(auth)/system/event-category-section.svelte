<script lang="ts">
	import { addEventCategory, loadEventCategories } from '$lib/api/event-categories';
	import { addFacility, loadFacilities } from '$lib/api/facilities';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import type { EventCategory, Facility, LoadedData } from '$lib/types';
	import { PlusIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let categories = $state<LoadedData<EventCategory[]>>({
		state: 'pending',
		message: 'Loading Event Categories...'
	});
	let newCategoryValue: string = $state('');

	async function onSave() {
		if (!newCategoryValue) return;
		const saveToastId = toast.loading('Saving new event category...');
		try {
			const newCateory = await addEventCategory(newCategoryValue);
			if (categories.state === 'success') {
				categories.data = [
					...categories.data,
					{
						id: newCateory.id,
						name: newCategoryValue
					}
				];
			}
			toast.success('Event Category Saved', { id: saveToastId });
		} catch (err) {
			console.error(err);
			toast.error('Failed to save event category', { id: saveToastId });
		} finally {
			newCategoryValue = '';
		}
	}

	onMount(async () => {
		try {
			categories = {
				state: 'success',
				data: await loadEventCategories()
			};
		} catch (error) {
			categories = {
				state: 'failed',
				message: 'Failed to load event categories'
			};
		}
	});
</script>

<div class="flex w-full max-w-200 flex-col gap-y-sm p-r-pad">
	<h2 class="text-lg">Event Categories</h2>
	<p class="text-sm text-muted-foreground">Manage Event Categories.</p>
	<div class=" border border-muted-foreground bg-muted">
		{#if categories.state === 'pending'}
			<p class="p-xs">{categories.message}</p>
		{:else if categories.state === 'success'}
			{#each categories.data as category}
				<div
					class="w-full justify-start rounded-none border-b border-b-muted-foreground px-sm py-xs text-sm text-secondary-foreground"
				>
					{category.name}
				</div>
			{/each}
			<div class="flex w-full items-center p-xxs max-sm:flex-col">
				<Input
					bind:value={newCategoryValue}
					onchange={(e) => {
						newCategoryValue = e.currentTarget.value;
					}}
					name="facilityName"
					class="w-full rounded-none border-secondary-foreground"
					type="text"
				/>
				<Button onclick={onSave} variant="link"><PlusIcon /> Add</Button>
			</div>
		{:else}
			<p class="p-xs">Failed to Load: {categories.message}</p>
		{/if}
	</div>
</div>
