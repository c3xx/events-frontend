<script lang="ts">
	import { page } from '$app/state';
	import { getEvent } from '$lib/api/events';
	import { getEventType } from '$lib/api/event-types';
	import { loadVenues } from '$lib/api/venue';
	import Button from '$lib/components/ui/button/button.svelte';
	import type {
		EventDetail,
		LoadedData,
		EventType,
		EventOrganizerInvitation,
		Organization,
		Venue,
		WorkflowInstance
	} from '$lib/types';
	import OrganizersSection from './organizers-section.svelte';
	import VenuesSection from './venues-section.svelte';
	import { loadOrganizerInvitations } from '$lib/api/events/organizer-invitations';
	import { loadOrgs } from '$lib/api/organizations';
	import OverviewSection from './overview-section.svelte';
	import WorkflowsSection from './workflows-section.svelte';
	import { loadEventWorkflows, loadEventWorkflowsLatest } from '$lib/api/events/workflow-instances';
	import { submitEvent } from '$lib/api/events/events';
	import { Loader, Send } from '@lucide/svelte';
	import { eventStatusColors, eventStatusTextColors } from '$lib/constants';
	import SelectButton from '$lib/components/app/select-button.svelte';

	let event = $state<LoadedData<EventDetail>>({
		state: 'pending',
		message: 'Loading event...'
	});

	let eventType = $state<LoadedData<EventType>>({
		state: 'pending',
		message: 'Loading event type...'
	});

	let organizerInvitations = $state<LoadedData<EventOrganizerInvitation[]>>({
		state: 'pending',
		message: 'Loading irganizer invitations...'
	});

	let organizations = $state<LoadedData<Organization[]>>({
		state: 'pending',
		message: 'Loading organizations...'
	});
	let venues = $state<LoadedData<Venue[]>>({
		state: 'pending',
		message: 'Loading Venues...'
	});

	let workflows = $state<LoadedData<WorkflowInstance[]>>({
		state: 'pending',
		message: 'Loading workflows...'
	});

	let latestWorkflow = $state<LoadedData<WorkflowInstance>>({
		state: 'pending',
		message: 'Loading latest workflow...'
	});

	let tabs = $state(['Overview', 'Workflows']);
	let activeTab: null | string = $state(tabs.length > 0 ? tabs[0] : null);
	let errorText = $state('');
	let successText = $state('');
	let submitLoading = $state(false);

	async function onSubmitEvent() {
		successText = '';
		if (event.state !== 'success') return;
		try {
			errorText = '';
			submitLoading = true;
			await submitEvent(event.data.id);
			successText = 'Event Submitted';
			loadEventData();
			setTimeout(() => {
				successText = '';
			}, 4000);
		} catch (err: any) {
			errorText = err.message ?? 'Something went wrong';
			setTimeout(() => {
				errorText = '';
			}, 4000);
		} finally {
			submitLoading = false;
		}
	}

	async function loadEventData() {
		tabs = ['Overview', 'Workflows'];
		errorText = '';
		try {
			event = {
				state: 'success',
				data: await getEvent(Number(page.params.id!))
			};
			try {
				eventType = {
					state: 'success',
					data: await getEventType(event.data.type.id)
				};
				if (eventType.data.collaborationPolicy !== 'forbidden') {
					tabs.push('Organizers');
					try {
						organizerInvitations = {
							state: 'success',
							data: await loadOrganizerInvitations(event.data.id)
						};
					} catch (err: any) {
						organizerInvitations = {
							state: 'failed',
							message: 'Failed to load invitations'
						};
					}
					try {
						organizations = {
							state: 'success',
							data: await loadOrgs()
						};
					} catch (err: any) {
						organizations = {
							state: 'failed',
							message: err.message ?? 'Failed to load organizations'
						};
					}
				}
				if (eventType.data.venuePolicy !== 'forbidden') {
					tabs.push('Venues');
					try {
						venues = {
							state: 'success',
							data: await loadVenues()
						};
					} catch (err: any) {
						venues = {
							state: 'failed',
							message: err.message ?? 'Failed to load venues'
						};
					}
				}
				try {
					workflows = {
						state: 'success',
						data: await loadEventWorkflows(event.data.id)
					};
					if (workflows.data.length > 0) {
						try {
							latestWorkflow = {
								state: 'success',
								data: await loadEventWorkflowsLatest(event.data.id)
							};
						} catch (err: any) {
							latestWorkflow = {
								state: 'failed',
								message: 'Failed to load latest workflow'
							};
						}
					}
				} catch (err: any) {
					workflows = {
						state: 'failed',
						message: 'Failed to load workflows'
					};
				}
			} catch (err: any) {
				eventType = {
					state: 'failed',
					message: 'Failed to load event type '
				};
			}
		} catch (err) {
			event = {
				state: 'failed',
				message: 'Failed to load event'
			};
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
		<div class="flex w-full flex-col px-r-pad">
			<div class="sticky top-12 z-40 max-w-200 bg-background max-sm:border-b">
				<div class="flex items-center justify-between pt-sm">
					<div class="flex items-center gap-x-sm gap-y-xxs max-sm:flex-col max-sm:items-start">
						<h2 class="text-2xl italic">{event.data.title}</h2>
						<span
							class={`px-sm py-xxs text-xs font-bold uppercase ${eventStatusTextColors[event.data.status]} ${eventStatusColors[event.data.status]}`}
						>
							{event.data.status}
						</span>
					</div>
					<Button class="hidden gap-x-xxs sm:flex" disabled={submitLoading} onclick={onSubmitEvent}
						>{#if submitLoading}<Loader class="animate-spin" />
						{/if} Submit</Button
					>
					<button disabled={submitLoading} onclick={onSubmitEvent} class="text-primary sm:hidden"
						>{#if submitLoading}
							<Loader class="animate-spin" />
						{:else}
							<Send />
						{/if}</button
					>
				</div>
				{#if errorText || successText}
					<p
						class={`mt-xs w-full p-xxs ${errorText ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}
					>
						{errorText ? errorText : successText}
					</p>
				{/if}
				<div class="mt-6 flex min-h-10 w-full max-w-200 items-end overflow-x-auto max-sm:hidden">
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
				<div class="my-xs flex w-full flex-col bg-muted p-xxs sm:hidden">
					<p class="w-full text-center text-xs uppercase">Tabs</p>
					<SelectButton name="tabs" class="w-full" itemsList={tabs} bind:value={activeTab!} />
				</div>
			</div>
			<div
				class={`h-full max-w-200 max-sm:pt-sm sm:border-x sm:border-b sm:border-muted-foreground sm:p-sm`}
			>
				{#if activeTab === 'Overview'}
					<OverviewSection {workflows} event={event.data} />
				{:else if activeTab === 'Organizers'}
					<OrganizersSection
						eventId={event.data.id}
						eventName={event.data.title}
						bind:organizerInvitations
						bind:organizers={event.data.organizers}
						{organizations}
					/>
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
					<VenuesSection
						eventId={event.data.id}
						bind:allotedVenues={event.data.venueAllotments}
						{venues}
					/>
				{:else if activeTab === 'Workflows'}
					<WorkflowsSection eventId={event.data.id} {workflows} {latestWorkflow} />
				{/if}
			</div>
		</div>
	</div>
{/if}
