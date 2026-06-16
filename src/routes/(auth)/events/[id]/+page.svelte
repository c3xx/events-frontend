<script lang="ts">
	import { page } from '$app/state';
	import { getEvent } from '$lib/api/events';
	import { getEventType } from '$lib/api/event-types';
	import { loadVenues } from '$lib/api/venue';
	import { createVenueAllotment } from '$lib/api/events';
	import TabButton from '$lib/components/app/tab-button.svelte';
	import DynamicSelectButton from '$lib/components/app/dynamic-select-button.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import type {
		EventDetail,
		EventTypeVenuePolicy,
		EventTypeCollaborationPolicy,
		LoadedData,
		Venue
	} from '$lib/types';
	import { PlusIcon, TrashIcon } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import OrganizersSection from './organizers-section.svelte';
	import VenuesSection from './venues-section.svelte';

	let event = $state<LoadedData<EventDetail>>({
		state: 'pending',
		message: 'Loading event...'
	});

	let venuePolicy = $state<EventTypeVenuePolicy>('forbidden');
	let collaborationPolicy = $state<EventTypeCollaborationPolicy>('forbidden');

	let selectedVenueId = $state('');
	let allotStartsAt = $state('');
	let allotEndsAt = $state('');

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleString('en-IN', {
			dateStyle: 'medium',
			timeStyle: 'short'
		});
	}

	const statusColors: Record<string, string> = {
		draft: 'bg-yellow-400/50',
		pending: 'bg-blue-400/50',
		approved: 'bg-green-400/50',
		cancelled: 'bg-red-400/50',
		overridden: 'bg-purple-400/50'
	};
	const statusTextColors: Record<string, string> = {
		draft: 'text-yellow-700',
		pending: 'text-blue-700',
		approved: 'text-green-700',
		cancelled: 'text-red-700',
		overridden: 'text-purple-700'
	};

	const tabs = ['Overview', 'Organizers', 'Venues', 'Workflow'] as const;
	let activeTab: null | string = $state(tabs.length > 0 ? tabs[0] : null);

	async function handleAllotVenue() {
		if (!selectedVenueId || !allotStartsAt || !allotEndsAt) return;
		if (event.state !== 'success') return;

		const promise = createVenueAllotment(page.params.id!, {
			venueId: selectedVenueId,
			startsAt: new Date(allotStartsAt).toISOString(),
			endsAt: new Date(allotEndsAt).toISOString()
		});
		toast.promise(promise, {
			loading: 'Allotting venue...',
			success: () => {
				loadEventData();
				selectedVenueId = '';
				allotStartsAt = '';
				allotEndsAt = '';
				return 'Venue allotted';
			},
			error: (err) => {
				console.error(err);
				return 'Failed to allot venue';
			}
		});
	}

	async function loadEventData() {
		try {
			const data = await getEvent(page.params.id!);
			event = { state: 'success', data };

			const eventType = await getEventType(data.type.id);
			venuePolicy = eventType.venuePolicy;
			collaborationPolicy = eventType.collaborationPolicy;
		} catch (err) {
			event = { state: 'failed', message: 'Failed to load event' };
		}
	}

	$effect(() => {
		loadEventData();
	});
</script>

{#if event.state === 'pending'}
	<div class="p-r-pad">
		<p>{event.message}</p>
	</div>
{:else if event.state === 'failed'}
	<div class="p-r-pad">
		<p class="text-red-500">{event.message}</p>
	</div>
{:else}
	<div class="flex w-full flex-col">
		<div class="flex w-full flex-col p-r-pad">
			<div class="flex items-center gap-x-sm">
				<h2 class="text-2xl italic">{event.data.title}</h2>
				<span
					class={`px-sm py-xxs text-xs font-bold uppercase ${statusTextColors[event.data.status]} ${statusColors[event.data.status]}`}
				>
					{event.data.status}
				</span>
			</div>
			<!-- <div class="flex gap-x-xxs">
				<TabButton onclick={setActiveTab} title="Overview" isActive={activeTab === 'Overview'} />
				{#if collaborationPolicy !== 'forbidden'}
					<TabButton
						onclick={setActiveTab}
						title="Organizers"
						isActive={activeTab === 'Organizers'}
					/>
				{/if}
				{#if venuePolicy !== 'forbidden'}
					<TabButton onclick={setActiveTab} title="Venues" isActive={activeTab === 'Venues'} />
				{/if}
			</div> -->
			<div class="mt-6 flex min-h-10 w-full max-w-200 items-end overflow-x-auto">
				{#each tabs as tab}
					<button
						onclick={() => {
							activeTab = tab;
						}}
						class={`${activeTab === tab ? 'border-x border-t text-primary' : 'border-b text-muted-foreground'} flex items-center border-muted-foreground px-xs py-xs`}
						>{tab}</button
					>
				{/each}
				<div class="h-full w-full border-b border-muted-foreground"></div>
			</div>
			<div class="h-full max-w-200 border-x border-b border-muted-foreground p-sm">
				{#if activeTab === 'Overview'}
					<div class="flex flex-col gap-y-sm">
						<div class="grid grid-cols-2 gap-sm max-sm:grid-cols-1">
							<div>
								<p class="text-xs text-muted-foreground">Type</p>
								<p class="text-sm">{event.data.type.name}</p>
							</div>
							<div>
								<p class="text-xs text-muted-foreground">Category</p>
								<p class="text-sm">{event.data.category.name}</p>
							</div>
							<div>
								<p class="text-xs text-muted-foreground">Expected Participants</p>
								<p class="text-sm">{event.data.expectedParticipants}</p>
							</div>
							<div>
								<p class="text-xs text-muted-foreground">Starts At</p>
								<p class="text-sm">{formatDate(event.data.startsAt)}</p>
							</div>
							<div>
								<p class="text-xs text-muted-foreground">Ends At</p>
								<p class="text-sm">{formatDate(event.data.endsAt)}</p>
							</div>
							{#if event.data.parentEvent}
								<div>
									<p class="text-xs text-muted-foreground">Parent Event</p>
									<a
										href="/events/{event.data.parentEvent.id}"
										class="text-sm text-primary underline"
									>
										{event.data.parentEvent.title}
									</a>
								</div>
							{/if}
							<div>
								<p class="text-xs text-muted-foreground">Created</p>
								<p class="text-sm">{formatDate(event.data.createdAt)}</p>
							</div>
						</div>
						<div>
							<p class="text-xs text-muted-foreground">Description</p>
							<p class="mt-xxs w-full max-w-200 bg-muted p-xxs text-sm whitespace-pre-wrap">
								{event.data.requestDetails}
							</p>
						</div>
						{#if event.data.report}
							<Separator />
							<div>
								<p class="text-xs text-muted-foreground">Report</p>
								<p class="mt-xxs text-sm whitespace-pre-wrap">{event.data.report.details}</p>
								<p class="mt-xxs text-xs text-muted-foreground">
									Submitted: {formatDate(event.data.report.submittedAt)}
								</p>
							</div>
						{/if}
					</div>
				{:else if activeTab === 'Organizers'}
					<OrganizersSection eventId={event.data.id} organizers={event.data.organizers} />
				{:else if activeTab === 'Venues'}
					<!-- <div class="border border-muted-foreground bg-muted">
						{#each event.data.venueAllotments as allotment}
							<div
								class="flex w-full items-center justify-start border-b border-b-muted-foreground px-sm text-sm text-secondary-foreground"
							>
								<p class="w-full py-xs">{allotment.venue.name}</p>
								<span class="text-xs text-muted-foreground">
									{formatDate(allotment.startsAt)} — {formatDate(allotment.endsAt)}
								</span>
							</div>
						{/each}
						{#if event.data.venueAllotments.length === 0}
							<p class="p-xs text-sm italic">No venues allotted yet.</p>
						{/if}
						<Separator />
						<div class="flex flex-col gap-y-xxs p-xxs">
							<div class="flex gap-x-xxs">
								<DynamicSelectButton
									name="venue"
									initialText="Select a Venue"
									size="full"
									bind:value={selectedVenueId}
									loadFn={loadVenues}
									mapOption={(item: Venue) => ({
										value: item.id.toString(),
										label: item.name
									})}
								/>
							</div>
							<div class="flex gap-x-xxs max-sm:flex-col">
								<Input
									bind:value={allotStartsAt}
									type="datetime-local"
									class="w-full rounded-none border-secondary-foreground"
								/>
								<Input
									bind:value={allotEndsAt}
									type="datetime-local"
									class="w-full rounded-none border-secondary-foreground"
								/>
								<Button variant="link" onclick={handleAllotVenue}><PlusIcon /> Allot</Button>
							</div>
						</div>
					</div> -->
					<VenuesSection eventId={event.data.id} allotedVenues={event.data.venueAllotments} />
				{/if}
			</div>
		</div>
	</div>
{/if}
