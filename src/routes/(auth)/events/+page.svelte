<script lang="ts">
	import { PlusIcon } from '@lucide/svelte';
	import type { LoadedData, Event, CreateEventData } from '$lib/types';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { loadEvents, createEvent } from '$lib/api/events';
	import EventSheet from './event-sheet.svelte';
	import { toast } from 'svelte-sonner';
	import { SearchBar } from '$lib/components/ui/search-bar';
	import EventCard from './event-card.svelte';
	import { HorizontalScroller } from '$lib/components/ui/horizontal-scroller';

	let events = $state<LoadedData<Event[]>>({
		state: 'pending',
		message: 'Loading events...'
	});

	let search = $state('');
	let sheetOpen = $state(false);
	
let groupedEvents = $derived(
	events.state === 'success'
		? (() => {
				const filtered = events.data.filter((e) =>
					e.title.toLowerCase().includes(search.toLowerCase())
				);

				return {
					drafts: filtered.filter((e) => e.status === 'draft'),
					pending: filtered.filter((e) => e.status === 'pending'),
					approved: filtered.filter((e) => e.status === 'approved')
				};
			})()
		: { drafts: [], pending: [], approved: [] }
);
	async function refreshEvents() {
		try {
			events = { state: 'pending', message: 'Refreshing events...' };

			events = {
				state: 'success',
				data: await loadEvents()
			};
		} catch (error) {
			events = {
				state: 'failed',
				message: error instanceof Error ? error.message : 'Failed to load events'
			};
		}
	}

	onMount(refreshEvents);

	async function handleAddEvent(eventData: CreateEventData) {
		try {
			const toastId = toast.loading('Creating event...');
			await createEvent(eventData);
			toast.success(`Event "${eventData.title}" created successfully!`, { id: toastId });
			refreshEvents();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to create event');
		}
	}
</script>

<div class="flex w-full flex-col">
	<!-- Header -->
	<div class="flex w-full items-center justify-between border-b border-muted-background py-xs">
		<h1 class="px-2 text-xl">Events</h1>

	</div>
	<div class="flex w-full items-center justify-between border-b border-muted-background py-xs">

	<!-- Search --> 
	<SearchBar bind:value={search} placeholder="Search events..." />
		<Button
			onclick={() => (sheetOpen = true)}
			class="shadow-md transition-all duration-200 hover:shadow-lg"
		>
			Create Event <PlusIcon class="ml-2 h-4 w-4" />
		</Button>
</div>

	<div class="space-y-6 p-xxs">
		{#if events.state === 'pending'}
			<p class="p-4 text-center">Loading events...</p>

		{:else if events.state === 'success'}

			<!-- DRAFTS -->
{#if groupedEvents.drafts.length > 0}
	<HorizontalScroller title="DRAFTS">
		{#each groupedEvents.drafts as event}
			<div class="min-w-[280px] flex-shrink-0">
				<EventCard {event} />
			</div>
		{/each}
	</HorizontalScroller>
{:else}
	<div class="space-y-2">
		<h2 class="px-1 text-sm font-semibold text-muted-foreground">
			DRAFTS
		</h2>
		<div
			class="flex h-24 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground"
		>
			No draft events
		</div>
	</div>
{/if}
			<!-- PENDING -->
{#if groupedEvents.pending.length > 0}
	<HorizontalScroller title="PENDING APPROVAL">
		{#each groupedEvents.pending as event}
			<div class="min-w-[280px] flex-shrink-0">
				<EventCard {event} />
			</div>
		{/each}
	</HorizontalScroller>
{:else}
	<div class="space-y-2">
		<h2 class="px-1 text-sm font-semibold text-muted-foreground">
			PENDING APPROVAL
		</h2>
		<div
			class="flex h-24 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground"
		>
			No pending events
		</div>
	</div>
{/if}

			<!-- APPROVED -->
{#if groupedEvents.approved.length > 0}
	<HorizontalScroller title="APPROVED">
		{#each groupedEvents.approved as event}
			<div class="min-w-[280px] flex-shrink-0">
				<EventCard {event} />
			</div>
		{/each}
	</HorizontalScroller>
{:else}
	<div class="space-y-2">
		<h2 class="px-1 text-sm font-semibold text-muted-foreground">
			APPROVED
		</h2>
		<div
			class="flex h-24 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground"
		>
			No approved events
		</div>
	</div>
{/if}

		{:else}
			<p class="p-4 text-center text-red-500">
				{events.message}
			</p>
		{/if}
	</div>
</div>

<EventSheet bind:open={sheetOpen} onadd={handleAddEvent} />