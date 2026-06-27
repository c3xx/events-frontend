<script lang="ts">
	import { Plus, Search, X } from '@lucide/svelte';
	import type { LoadedData, Event, CreateEventData } from '$lib/types';

	import Button from '$lib/components/ui/button/button.svelte';
	import { loadEvents, createEvent } from '$lib/api/events';
	import { toast } from 'svelte-sonner';
	import EventCard from './event-card.svelte';
	import HorizontalScroller from './horizontal-scroller.svelte';
	import { goto } from '$app/navigation';
	import { permissionGrantedSomewhere } from '$lib/helpers';
	import { eventStatusColors, eventStatusTextColors } from '$lib/constants';

	let events = $state<LoadedData<Event[]>>({
		state: 'pending',
		message: 'Loading events...'
	});

	let search = $state('');

	let groupedEvents = $derived(
		events.state === 'success'
			? (() => {
					const filtered = events.data.filter((e) =>
						e.title.toLowerCase().includes(search.toLowerCase())
					);

					return {
						drafts: filtered.filter((e) => e.status === 'draft'),
						pending: filtered.filter((e) => e.status === 'pending'),
						past: filtered.filter(
							(e) =>
								e.status === 'approved' || e.status === 'cancelled' || e.status === 'overridden'
						)
					};
				})()
			: { drafts: [], pending: [], past: [] }
	);

	$effect(() => {
		(async () => {
			try {
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
		})();
	});

	export function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleString('en-IN', {
			day: '2-digit',
			month: 'short'
		});
	}

	let canCreateEvent = $derived(permissionGrantedSomewhere('event:manage'));
</script>

<div class="flex w-full max-w-200 flex-col">
	<div class="sticky top-12 z-40 flex flex-col gap-xs bg-background p-r-pad">
		<div class="flex w-full items-center justify-between">
			<h1>Events</h1>
			<div class="flex items-center gap-x-xxs">
				<div
					class="flex h-8 max-w-56 items-center gap-x-xxs border p-xxs text-muted-foreground/50 max-sm:hidden"
				>
					<Search size="20" />
					<input
						class="w-full flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
						bind:value={search}
						placeholder="Search Events..."
					/>
					{#if search}
						<button
							onclick={() => {
								search = '';
							}}><X size="15" /></button
						>
					{/if}
				</div>
				{#if canCreateEvent}
					<button
						onclick={async () => {
							await goto('events/new');
						}}
						class="btn-primary max-sm:invisible">Create<Plus size="15" /></button
					>
					<button
						onclick={async () => {
							await goto('events/new');
						}}
						class="text-primary sm:hidden"
					>
						<Plus />
					</button>
				{/if}
			</div>
		</div>
		<div class="flex w-full items-center justify-between gap-xs sm:hidden">
			<div class="flex w-full items-center gap-x-xxs border p-xxs text-muted-foreground/50">
				<Search size="20" />
				<input
					class="w-full flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
					bind:value={search}
					placeholder="Search Events..."
				/>
				{#if search}
					<button
						onclick={() => {
							search = '';
						}}><X size="15" /></button
					>
				{/if}
			</div>
		</div>
	</div>

	<div class="flex flex-col gap-y-8 p-r-pad">
		{#if events.state === 'pending' || events.state === 'failed'}
			<p>{events.message}</p>
		{:else if events.state === 'success'}
			{#if groupedEvents.drafts.length > 0}
				<HorizontalScroller title="DRAFTS">
					{#each groupedEvents.drafts as event}
						<EventCard cardType="tile" {event} />
					{/each}
				</HorizontalScroller>
			{/if}
			{#if groupedEvents.pending.length > 0}
				<HorizontalScroller title="PENDING APPROVAL">
					{#each groupedEvents.pending as event}
						<EventCard cardType="tile" {event} />
					{/each}
				</HorizontalScroller>
			{/if}

			<div class="flex flex-col gap-y-xs">
				<!-- <h2 class="text-sm font-semibold uppercase">Past Events</h2> -->
				<div class="flex flex-col border border-neutral-400 sm:hidden">
					{#if groupedEvents.past.length === 0}
						<p class="w-full py-6 text-center text-muted-foreground italic">No events yet</p>
					{/if}
					{#each groupedEvents.past as event}
						<EventCard cardType="list-tile" {event} />
					{/each}
				</div>
				<div class="max-sm:hidden">
					<table class="/border-muted-foreground w-full max-w-200 border text-sm">
						<thead class="text-xs text-muted-foreground">
							<tr class="bg-muted">
								<th class="p-xs text-left font-normal">Event</th>
								<th class="p-xs text-left font-normal whitespace-nowrap">Status</th>
								<th class="p-xs text-left font-normal whitespace-nowrap">Type</th>
								<th class="p-xs text-left font-normal whitespace-nowrap">Host</th>
								<th class="p-xs text-left font-normal whitespace-nowrap">Start Date</th>
								<th class="p-xs text-left font-normal whitespace-nowrap">Parent Event</th>
							</tr>
						</thead>
						<tbody>
							{#if groupedEvents.past.length === 0}
								<tr
									><td class="py-12" colspan="6"
										><p class="w-full text-center text-muted-foreground italic">
											No events yet
										</p></td
									></tr
								>
							{/if}
							{#each groupedEvents.past as event}
								<tr
									onclick={() => {
										goto(`/events/${event.id}`);
									}}
									class="cursor-pointer text-sm text-muted-foreground hover:bg-primary/10"
								>
									<td class="px-xs py-sm text-foreground">
										<div class="max-w-full truncate">
											{event.title}
										</div>
									</td>
									<td class="px-xs py-sm text-left whitespace-nowrap"
										><p
											class={`w-min rounded px-1 py-0.5 text-start text-[10px] font-semibold uppercase ${eventStatusTextColors[event.status]} ${eventStatusColors[event.status]}`}
										>
											{event.status}
										</p></td
									>
									<td class="px-xs py-sm text-left whitespace-nowrap">{event.type.name}</td>
									<td class="px-xs py-sm text-left whitespace-nowrap"
										>{event.organizers.find((o) => o.role === 'host')?.organization.name ??
											'--'}</td
									>
									<td class="px-xs py-sm text-left whitespace-nowrap"
										>{formatDate(event.startsAt)}</td
									>
									<td class="px-xs py-sm text-left whitespace-nowrap"
										>{event.parentEvent?.title ?? 'NIL'}</td
									>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	</div>
</div>
