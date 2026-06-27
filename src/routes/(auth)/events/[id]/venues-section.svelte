<script lang="ts">
	import { allotEventVenue } from '$lib/api/events/venue-allotments';
	import DynamicSelectButton from '$lib/components/app/dynamic-select-button.svelte';
	import SelectButton from '$lib/components/app/select-button.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { formatDate } from '$lib/helpers';
	import type { EventVenueAllotment, LoadedData, Venue } from '$lib/types';
	import { Clock, EllipsisVertical, Loader, Plus, X } from '@lucide/svelte';
	import VenuesSelectionPopup from './venues-selection-popup.svelte';
	import VenuesDatetimeSelectionPopup from './venues-datetime-selection-popup.svelte';

	let {
		eventId,
		allotedVenues = $bindable([])
	}: {
		eventId: number;
		allotedVenues: EventVenueAllotment[];
	} = $props();

	let selectedVenueId: number | null = $state(null);
	let selectedVenueName: string | null = $state(null);

	let selectVenuePopupOpen = $state(false);
	let selectDateTimePopupOpen = $state(false);
</script>

<div class="flex w-full flex-col gap-sm">
	<div class="flex items-center justify-between">
		<p class="text-base font-semibold uppercase">Venues</p>
	</div>
	<div class="flex grid-cols-2 flex-col gap-sm text-sm sm:grid">
		{#if allotedVenues.length === 0}
			<div
				class="flex w-full max-w-100 flex-col items-center justify-center gap-y-0.5 bg-muted p-xs py-10 text-base"
			>
				<p class="italic">No venues alloted yet</p>
			</div>
		{/if}
		{#each allotedVenues as venue}
			<div class="flex flex-col items-center gap-xs border bg-background p-xs">
				<div class="flex w-full items-center justify-between gap-x-xs">
					<p class="text-lg">{venue.venue.name}</p>
					<button><X size="15" /></button>
				</div>
				<div class="flex w-full flex-col items-start text-muted-foreground">
					<div title="start date/time" class="flex gap-xxs text-xs">
						<Clock size="15" />
						<p class="text-left">{formatDate(venue.startsAt)}</p>
					</div>
					<EllipsisVertical size="15" />
					<div title="end date/time" class="flex gap-xxs text-xs">
						<Clock size="15" />
						<p class="text-left">{formatDate(venue.endsAt)}</p>
					</div>
				</div>
			</div>
		{/each}
	</div>
	<Button
		class="w-min has-[>svg]:p-0"
		onclick={() => {
			selectVenuePopupOpen = true;
		}}
		variant="link"><Plus />Add</Button
	>
</div>

{#if selectVenuePopupOpen}
	<VenuesSelectionPopup
		{allotedVenues}
		bind:isDateTimePopupOpen={selectDateTimePopupOpen}
		bind:isOpen={selectVenuePopupOpen}
		bind:selectedVenueId
		bind:selectedVenueName
	/>
{/if}

{#if selectDateTimePopupOpen}
	<VenuesDatetimeSelectionPopup
		{eventId}
		bind:isOpen={selectDateTimePopupOpen}
		bind:selectedVenueId
		bind:selectedVenueName
		bind:allotedVenues
	/>
{/if}
