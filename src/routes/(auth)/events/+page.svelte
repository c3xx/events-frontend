<script lang="ts">
	import { PlusIcon } from '@lucide/svelte';
	import type { LoadedData, TableProps, Event as BackendEvent, CreateEventData } from '$lib/types';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { loadEvents, createEvent } from '$lib/api/events';
	import EventSheet from './event-sheet.svelte';
	import { toast } from 'svelte-sonner';
	import { SearchBar } from '$lib/components/ui/search-bar';
	import Card from '$lib/components/ui/card/card.svelte';
	import { CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';


	let events = $state<LoadedData<BackendEvent[]>>({
		state: 'pending',
		message: 'Loading events...'
	});

	let search = $state('');
	let sheetOpen = $state(false);

	let filteredEvents = $derived(
		events.state === 'success'
			? events.data.filter(
					(e) =>
						e.title.toLowerCase().includes(search.toLowerCase()) ||
						e.status.toLowerCase().includes(search.toLowerCase())
				)
			: []
	);

	async function refreshEvents() {
		try {
			events = {
				state: 'pending',
				message: 'Refreshing events...'
			};
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
	<div class="border-muted-background flex w-full items-center justify-between border-b py-xs">
		<h1 class="px-2 text-xl">Events</h1>


		<div class="flex items-center gap-3">
			<Button
				onclick={() => {
					sheetOpen = true;
				}}
				class="shadow-md transition-all duration-200 hover:shadow-lg"
			>
				Create Event <PlusIcon class="ml-2 h-4 w-4" />
			</Button>
		</div>
	</div>

	<SearchBar
	bind:value={search}
	placeholder="Search events..."
/>
	<div class="p-xxs">
		{#if events.state === 'pending'}
	<p class="p-4 text-center">Loading events...</p>

{:else if events.state === 'success'}
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
		{#each filteredEvents as event}
			<Card>
				<CardHeader>
					<CardTitle>{event.title}</CardTitle>
				</CardHeader>

				<CardContent>
					<p>Status: {event.status}</p>
					<p>Starts: {event.startsAt}</p>
				</CardContent>
			</Card>
		{/each}
	</div>

{:else}
	<p class="p-4 text-center text-red-500">
		{events.message}
	</p>
{/if}
	</div>
</div>

<EventSheet bind:open={sheetOpen} onadd={handleAddEvent} />
