<script lang="ts">
	import { addFacility, loadFacilities } from '$lib/api/facilities';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import type { Facility, LoadedData } from '$lib/types';
	import { PlusIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let facilities = $state<LoadedData<Facility[]>>({
		state: 'pending',
		message: 'Loading facilities...'
	});
	let newFacilityValue: string = $state('');

	async function onSave() {
		if (!newFacilityValue) return;
		const saveToastId = toast.loading('Saving new facility...');
		try {
			const newFacility = await addFacility(newFacilityValue);
			if (facilities.state === 'success') {
				facilities.data = [
					...facilities.data,
					{
						id: newFacility.id,
						name: newFacilityValue
					}
				];
			}
			toast.success('Facility Saved', { id: saveToastId });
		} catch (err) {
			console.error(err);
			toast.error('Failed to save facility', { id: saveToastId });
		} finally {
			newFacilityValue = '';
		}
	}

	onMount(async () => {
		try {
			facilities = {
				state: 'success',
				data: await loadFacilities()
			};
		} catch (error) {
			facilities = {
				state: 'failed',
				message: 'Failed to load facilities'
			};
		}
	});
</script>

<div class="flex w-full max-w-200 flex-col gap-y-sm p-r-pad">
	<h2 class="text-lg">Facilities</h2>
	<p class="text-sm text-muted-foreground">Manage facilities that can be linked to venues.</p>
	<div class=" border border-muted-foreground bg-muted">
		{#if facilities.state === 'pending'}
			<p class="p-xs">{facilities.message}</p>
		{:else if facilities.state === 'success'}
			{#each facilities.data as facility}
				<div
					class="w-full justify-start rounded-none border-b border-b-muted-foreground px-sm py-xs text-sm text-secondary-foreground"
				>
					{facility.name}
				</div>
			{/each}
			<div class="flex w-full items-center p-xxs max-sm:flex-col">
				<Input
					bind:value={newFacilityValue}
					onchange={(e) => {
						newFacilityValue = e.currentTarget.value;
					}}
					name="facilityName"
					class="w-full rounded-none border-secondary-foreground"
					type="text"
				/>
				<Button onclick={onSave} variant="link"><PlusIcon /> Add</Button>
			</div>
		{:else}
			<p class="p-xs">Failed to Load: {facilities.message}</p>
		{/if}
	</div>
</div>
