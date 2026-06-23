<script lang="ts">
	import { allotEventVenue } from '$lib/api/events/venue-allotments';
	import DynamicSelectButton from '$lib/components/app/dynamic-select-button.svelte';
	import SelectButton from '$lib/components/app/select-button.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { formatDate } from '$lib/helpers';
	import type { EventVenueAllotment, LoadedData, Venue } from '$lib/types';
	import { Loader, X } from '@lucide/svelte';

	let {
		eventId,
		allotedVenues = $bindable([]),
		venues
	}: {
		eventId: number;
		allotedVenues: EventVenueAllotment[];
		venues: LoadedData<Venue[]>;
	} = $props();

	function toISOString(date: string, time: string): string {
		return new Date(`${date}T${time}`).toISOString();
	}

	let addVenueLoading = $state(false);
	let errorText = $state('');
	let newVenueId: number | null = $state(null);
	let newStartDate: string | undefined = $state(undefined);
	let newStartTime: string = $state('00:00:00');
	let newEndDate: string | undefined = $state(undefined);
	let newEndTime: string = $state('00:00:00');

	async function onAllotVenue() {
		if (venues.state !== 'success') return;
		if (newVenueId === null) {
			errorText = 'Please select a valid venue';
			return;
		}
		if (newStartDate === undefined) {
			errorText = 'Please enter a valid start date';
			return;
		}
		if (newStartTime === undefined) {
			errorText = 'Please enter a valid start time';
			return;
		}
		if (newEndDate === undefined) {
			errorText = 'Please enter a valid end date';
			return;
		}
		if (newEndTime === undefined) {
			errorText = 'Please enter a valid end time';
			return;
		}
		try {
			errorText = '';
			addVenueLoading = true;
			console.log(newStartDate);
			const startsAt = toISOString(newStartDate, newStartTime);
			const endsAt = toISOString(newEndDate, newEndTime);

			const { id } = await allotEventVenue(eventId, newVenueId, startsAt, endsAt);
			allotedVenues.push({
				id: id,
				venue: {
					id: newVenueId,
					name: venues.data.find((v) => v.id === newVenueId)?.name!
				},
				startsAt,
				endsAt
			});
		} catch (err: any) {
			errorText = err.message ?? 'Something went wrong';
		} finally {
			addVenueLoading = false;
		}
	}
</script>

<div class="flex w-full flex-col gap-y-sm">
	<div class="hidden sm:block">
		<table class="w-full max-w-200 border border-muted-foreground text-sm">
			<thead class="border-b border-muted-foreground text-muted-foreground">
				<tr class="bg-muted">
					<th class="p-xs text-left"> Venue </th>
					<th class="w-48 p-xs text-left">Start</th>
					<th class="w-48 p-xs text-left">End</th>
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
			</tbody>
		</table>
	</div>
	<div class="block max-w-200 border border-muted-foreground text-sm sm:hidden">
		{#if allotedVenues.length === 0}
			<p class="w-full py-6 text-center text-muted-foreground italic">No venues alloted yet</p>
		{/if}
		{#each allotedVenues as venue}
			<div
				class="flex flex-col items-start gap-y-xxs border-b border-muted-foreground p-xs last:border-b-0"
			>
				<div class="flex w-full items-center justify-between gap-x-xs">
					<p class="text-lg">{venue.venue.name}</p>
					<button><X size="15" /></button>
				</div>
				<div class="flex w-full items-center justify-between">
					<div class="flex flex-col text-xs">
						<p class="text-xs text-muted-foreground">Start</p>
						<p class="text-left">{formatDate(venue.startsAt)}</p>
					</div>
					<div class="flex flex-col text-xs">
						<p class="text-xs text-muted-foreground">End</p>
						<p class="text-left">
							{formatDate(venue.endsAt)}
						</p>
					</div>
				</div>
			</div>
		{/each}
	</div>
	<div
		class="flex flex-col gap-y-xxs max-sm:mt-sm sm:border sm:border-muted-foreground sm:bg-muted sm:p-xs"
	>
		<p class="font-bold">Add Venue</p>
		<p class="text-xs text-muted-foreground">
			Add an organizer by choosing an organization and assigning an appropriate role. The selected
			role determines the organizer's access level and responsibilities for managing the event.
		</p>
		{#if errorText}
			<p class="text-sm text-red-500">{errorText}</p>
		{/if}
		<div class="flex flex-col gap-y-xxs">
			<p class="italic">Venue</p>
			{#if venues.state === 'pending'}
				<p class="h-9 w-full border border-muted-foreground px-3 py-1">Loading Organizations...</p>
			{:else if venues.state === 'success'}
				<SelectButton
					name="venue"
					itemsList={venues.data}
					class="w-full max-w-80"
					optionName="name"
					optionValue="id"
					bind:value={newVenueId}
				/>
			{/if}
		</div>
		<div class="flex w-full max-w-80 gap-x-sm">
			<div class="flex w-full flex-col gap-y-xxs">
				<p class="italic">Start Date</p>
				<Input type="date" bind:value={newStartDate} />
			</div>
			<div class="flex w-full flex-col gap-y-xxs">
				<p class="italic">Start Time</p>
				<Input type="time" bind:value={newStartTime} />
			</div>
		</div>
		<div class="flex w-full max-w-80 gap-x-sm">
			<div class="flex w-full flex-col gap-y-xxs">
				<p class="italic">End Date</p>
				<Input type="date" bind:value={newEndDate} />
			</div>
			<div class="flex w-full flex-col gap-y-xxs">
				<p class="italic">End Time</p>
				<Input type="time" bind:value={newEndTime} />
			</div>
		</div>
		<Button disabled={addVenueLoading} onclick={onAllotVenue} class="mt-sm w-min"
			>{#if addVenueLoading}
				<Loader class="animate-spin" />
			{/if} Allot</Button
		>
	</div>
</div>
