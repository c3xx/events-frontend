<script lang="ts">
	import { allotEventVenue } from '$lib/api/events/venue-allotments';
	import { loadVenues } from '$lib/api/venue';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import type { EventVenueAllotment, LoadedData, Venue } from '$lib/types';
	import { Loader } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let {
		eventId,
		allotedVenues = $bindable([])
	}: { eventId: string; allotedVenues: EventVenueAllotment[] } = $props();

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleString('en-IN', {
			dateStyle: 'medium',
			timeStyle: 'short'
		});
	}

	let venues = $state<LoadedData<Venue[]>>({
		state: 'pending',
		message: 'Loading Venues...'
	});

	let addVenueLoading = $state(false);

	onMount(async () => {
		try {
			venues = {
				state: 'success',
				data: await loadVenues()
			};
		} catch (err: any) {
			venues = {
				state: 'failed',
				message: `Failed to load: ${err.message}`
			};
		}
	});
	let errorText = $state('');
	let newVenueId: string | null = $state(null);
	let newStartDateTime: string | null = $state(null);
	let newEndDateTime: string | null = $state(null);

	async function onAllotVenue() {
		if (venues.state !== 'success') return;
		if (newVenueId === null) {
			errorText = 'Please select a valid venue';
			return;
		}
		if (newStartDateTime === null) {
			errorText = 'Please enter a valid start date and time';
			return;
		}
		if (newEndDateTime === null) {
			errorText = 'Please enter a valid end date and time';
			return;
		}
		try {
			addVenueLoading = true;
			const { id } = await allotEventVenue(eventId, newVenueId, newStartDateTime, newEndDateTime);
			allotedVenues.push({
				id: id.toString(),
				venue: {
					id: parseInt(newVenueId),
					name: venues.data.find((v) => v.id === newVenueId)?.name!
				},
				startsAt: formatDate(newStartDateTime),
				endsAt: formatDate(newEndDateTime)
			});
		} catch (err: any) {
			errorText = err.message ?? 'Something went wrong';
		} finally {
			addVenueLoading = false;
		}
	}
</script>

<div class="flex w-full flex-col">
	{#if errorText}
		<p class="text-red-400">{errorText}</p>
	{/if}
	<table class="max-w-200 border border-muted-foreground text-sm">
		<thead class="border-b border-muted-foreground text-muted-foreground">
			<tr class="bg-muted">
				<th class="p-xs text-left"> Venue </th>
				<th class="w-40 p-xs text-left">Start</th>
				<th class="w-40 p-xs text-left">End</th>
			</tr>
		</thead>
		<tbody>
			{#if allotedVenues.length === 0}
				<tr
					><td class="py-6" colspan="3"
						><p class="w-full text-center text-muted-foreground italic">
							No venues alloted yet
						</p></td
					></tr
				>
			{/if}
			{#each allotedVenues as venue}
				<tr>
					<td class="px-xs py-xxs text-left">{venue.venue.name}</td>
					<td class="px-xs py-xxs text-left">{formatDate(venue.startsAt)}</td>
					<td class="px-xs py-xxs text-left">{formatDate(venue.endsAt)}</td>
				</tr>
			{/each}
			{#if venues.state === 'success'}
				<tr class="border-t border-muted-foreground bg-muted text-muted-foreground uppercase">
					<td class="p-xxs" colspan="3">Add New Venue</td>
				</tr>
				<tr class="">
					<td class="p-xxs text-left"
						><select
							bind:value={newVenueId}
							class="flex h-9 w-full min-w-0 rounded-none border border-muted-foreground bg-background px-3 py-1 text-base shadow-xs ring-offset-background transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
						>
							{#each venues.data as o}
								<option value={o.id}>{o.name}</option>
							{/each}
						</select></td
					>
					<td class="p-xxs text-left"
						><Input
							placeholder="Date/Time"
							class="primary-input"
							bind:value={newStartDateTime}
							onchange={(e) => (newStartDateTime = e.currentTarget.value)}
							name="start"
						/></td
					>
					<td class="p-xxs text-left"
						><Input
							placeholder="Date/Time"
							class="primary-input"
							bind:value={newEndDateTime}
							onchange={(e) => (newEndDateTime = e.currentTarget.value)}
							name="start"
						/></td
					>
				</tr>
				<tr>
					<td colspan="3" class="px-xxs pb-xxs">
						<Button
							disabled={addVenueLoading}
							onclick={onAllotVenue}
							variant="link"
							class="w-min p-0"
							>{#if addVenueLoading}
								<Loader class="animate-spin" />
							{/if} Add Venue</Button
						>
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>
