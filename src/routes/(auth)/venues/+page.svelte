<script lang="ts">
	import { PlusIcon } from '@lucide/svelte';
	import type { LoadedData, TableProps, Venue } from '$lib/types';
	import { loadVenues } from '$lib/api/venue.js';
	import { onMount } from 'svelte';
	import AssignRole from './assign-role.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import AddVenue from './add-venue.svelte';
	import VenueFacilitiesSheet from './venue-facilities-sheet.svelte';
	import { goto } from '$app/navigation';
	import { venueFacilitiesState } from '$lib/global/venueFacilities.svelte';
	import DataTable from '$lib/components/app/data-table.svelte';

	let venues = $state<LoadedData<Venue[]>>({
		state: 'pending',
		message: 'Loading venues...'
	});

	let addVenueSheetOpen = $state(false);

	async function refreshVenues() {
		try {
			venues = {
				state: 'pending',
				message: 'Refreshing venues...'
			};
			venues = {
				state: 'success',
				data: await loadVenues()
			};
		} catch (error) {
			venues = {
				state: 'failed',
				message: 'Failed to load venues'
			};
		}
	}

	onMount(refreshVenues);

	let columns: TableProps<Venue>['columns'] = [
		{
			key: 'name',
			header: 'Name',
			type: 'link',
			href: 'venues/'
		},
		{
			key: 'maxCapacity',
			header: 'Max Capacity',
			type: 'text'
		},
		{
			key: 'venueTypeId',
			header: 'Type',
			type: 'text'
		}
	];

	let optionsList: TableProps<Venue>['optionsList'] = [
		{
			id: '1',
			name: 'View Details',
			onclick: (venue) => {
				goto(`/venues/${venue.id}`);
			}
		},
		{
			id: '2',
			name: 'Manage Facilities',
			onclick: (venue) => {
				venueFacilitiesState.selectedVenue = venue;
				venueFacilitiesState.sheetOpen = true;
			}
		}
	];
</script>

<div class="flex w-full flex-col">
	<div class="border-muted-background flex w-full items-center justify-between border-b py-xs">
		<h1 class="px-2 text-xl">Venues</h1>
	</div>
	<div class="border-muted-background flex w-full items-center justify-end border-b p-xxs">
		<Button
			onclick={() => {
				addVenueSheetOpen = true;
			}}>Add Venue <PlusIcon /></Button
		>
	</div>
	<div class="p-xxs">
		{#if venues.state === 'pending'}
			<p class="p-4 text-center">Loading venues...</p>
		{:else if venues.state === 'success'}
			<DataTable data={venues.data} {columns} {optionsList} />
		{:else}
			<p class="p-4 text-center text-red-500">{venues.message}</p>
		{/if}
	</div>
</div>

<AddVenue bind:open={addVenueSheetOpen} />
<AssignRole />
<VenueFacilitiesSheet />
