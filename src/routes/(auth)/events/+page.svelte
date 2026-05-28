<script lang="ts">
	import { PlusIcon, SearchIcon } from '@lucide/svelte';
	import type { LoadedData, TableProps, Event } from '$lib/types';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import DataTable from '$lib/components/app/data-table.svelte';
	import { loadEvents } from '$lib/api/events';
	import EventSheet from './event-sheet.svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { SearchBar } from '$lib/components/ui/search-bar';
	import Card from '$lib/components/ui/card/card.svelte';
	import { CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';

	// Define a mapped type for DataTable compatibility because DataTable requires string IDs
	type TableEvent = Omit<Event, 'id'> & { id: string };

	let events = $state<LoadedData<Event[]>>({
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

	function handleAddEvent(eventData: { title: string; category: string; startsAt: string }) {
		toast.success(`Event "${eventData.title}" created successfully!`, {
			description: `Category: ${eventData.category || 'N/A'}`
		});
		refreshEvents();
	}

	let columns: TableProps<TableEvent>['columns'] = [
		{
			key: 'title',
			header: 'Title',
			type: 'link',
			href: 'events/'
		},
		{
			key: 'status',
			header: 'Status',
			type: 'text'
		},
		{
			key: 'startsAt',
			header: 'Starts At',
			type: 'text'
		}
	];

	let optionsList: TableProps<TableEvent>['optionsList'] = [
		{
			id: '1',
			name: 'View Details',
			onclick: (event) => {
				goto(`/events/${event.id}`);
			}
		}
	];
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
