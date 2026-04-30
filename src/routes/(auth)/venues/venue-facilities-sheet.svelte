<script lang="ts">
	import { getVenueFacilities, setVenueFacilities } from '$lib/api/venue.js';
	import { loadFacilities } from '$lib/api/facilities.js';
	import DynamicSelectButton from '$lib/components/app/dynamic-select-button.svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { venueFacilitiesState } from '$lib/global/venueFacilities.svelte';
	import type { Facility, LoadedData, VenueFacilities } from '$lib/types';
	import { PlusIcon, TrashIcon } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let linkedFacilities = $state<LoadedData<VenueFacilities>>({
		state: 'pending',
		message: 'Loading facilities...'
	});
	let selectedFacilityId = $state('');

	let prevVenueId: number | null = $state(null);

	$effect(() => {
		const venue = venueFacilitiesState.selectedVenue;
		if (venue && venueFacilitiesState.sheetOpen && venue.id !== prevVenueId) {
			prevVenueId = venue.id;
			loadLinkedFacilities(venue.id);
		}
	});

	async function loadLinkedFacilities(venueId: number) {
		linkedFacilities = { state: 'pending', message: 'Loading facilities...' };
		try {
			const data = await getVenueFacilities(venueId);
			linkedFacilities = { state: 'success', data: data.flat() };
		} catch (err) {
			linkedFacilities = { state: 'failed', message: 'Failed to load facilities' };
		}
	}

	async function handleLinkFacility() {
		if (!venueFacilitiesState.selectedVenue || !selectedFacilityId) return;
		const venueId = venueFacilitiesState.selectedVenue.id;
		const facilityId = parseInt(selectedFacilityId);

		if (linkedFacilities.state !== 'success') return;

		const existing = linkedFacilities.data.map((f) => f.facilityId);
		if (existing.includes(facilityId)) {
			toast.error('Facility already linked');
			return;
		}

		const allIds = [...existing, facilityId];
		const promise = setVenueFacilities(venueId, allIds);
		toast.promise(promise, {
			loading: 'Linking facility...',
			success: () => {
				loadLinkedFacilities(venueId);
				selectedFacilityId = '';
				return 'Facility linked';
			},
			error: (err) => {
				console.error(err);
				return 'Failed to link facility';
			}
		});
	}

	async function handleUnlinkFacility(facilityId: number) {
		if (!venueFacilitiesState.selectedVenue || linkedFacilities.state !== 'success') return;
		const venueId = venueFacilitiesState.selectedVenue.id;
		const remaining = linkedFacilities.data
			.filter((f) => f.facilityId !== facilityId)
			.map((f) => f.facilityId);

		const promise = setVenueFacilities(venueId, remaining);
		toast.promise(promise, {
			loading: 'Unlinking facility...',
			success: () => {
				loadLinkedFacilities(venueId);
				return 'Facility unlinked';
			},
			error: (err) => {
				console.error(err);
				return 'Failed to unlink facility';
			}
		});
	}
</script>

<Sheet.Root
	bind:open={venueFacilitiesState.sheetOpen}
	onOpenChange={(open) => {
		if (!open) prevVenueId = null;
	}}
>
	<Sheet.Content class="h-screen w-full sm:min-w-120" side="right">
		<Sheet.Header class="border-b border-muted-foreground pb-2">
			<Sheet.Title>{venueFacilitiesState.selectedVenue?.name ?? 'Venue'}</Sheet.Title>
			<Sheet.Description>Manage facilities linked to this venue.</Sheet.Description>
		</Sheet.Header>
		<div class="mx-xs flex h-full flex-col overflow-auto">
			<div class="border border-muted-foreground bg-muted">
				<!-- <h3 class="p-xs text-sm font-medium">Linked Facilities</h3>
				<Separator /> -->
				{#if linkedFacilities.state === 'pending'}
					<p class="p-xs text-sm">{linkedFacilities.message}</p>
				{:else if linkedFacilities.state === 'success'}
					{#each linkedFacilities.data as facility}
						<div
							class="flex w-full items-center justify-start rounded-none border-b border-b-muted-foreground px-sm text-sm text-secondary-foreground"
						>
							<p class="w-full py-xs">{facility.facilityName}</p>
							<Button
								onclick={() => handleUnlinkFacility(facility.facilityId)}
								class="text-red-400"
								size="icon"
								variant="ghost"><TrashIcon /></Button
							>
						</div>
					{/each}
					{#if linkedFacilities.data.length === 0}
						<p class="p-xs text-sm italic">No facilities linked yet.</p>
					{/if}
					<div class="flex">
						<DynamicSelectButton
							name="facility"
							initialText="Select a Facility"
							size="full"
							bind:value={selectedFacilityId}
							loadFn={async () => {
								const all = await loadFacilities();
								if (linkedFacilities.state !== 'success') return all;
								const linkedIds = new Set(linkedFacilities.data.map((f) => f.facilityId));
								return all.filter((f) => !linkedIds.has(f.id));
							}}
							mapOption={(item: Facility) => ({ value: item.id.toString(), label: item.name })}
						/>
						<Button variant="link" onclick={handleLinkFacility} class="rounded-none"
							><PlusIcon />Add</Button
						>
					</div>
				{:else}
					<p class="p-xs text-sm">Failed to load facilities.</p>
				{/if}
			</div>
		</div>
		<Sheet.Footer>
			<Sheet.Close class={buttonVariants({ variant: 'outline' })}>Close</Sheet.Close>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
