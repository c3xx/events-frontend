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

	let tabs = $state(['Overview', 'Workflows']);
	let activeTab: null | string = $state(tabs.length > 0 ? tabs[0] : null);
	let errorText = $state('');
	let submitLoading = $state(false);

	async function onSubmitEvent() {
		if (event.state !== 'success') return;
		try {
			errorText = '';
			submitLoading = true;
			await submitEvent(event.data.id);
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
		try {
			event = {
				state: 'success',
				data: await getEvent(page.params.id!)
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
				} catch (err: any) {
					workflows = {
						state: 'failed',
						message: 'Failed to load workflows'
					};
				}
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
							class={`px-sm py-xxs text-xs font-bold uppercase ${statusTextColors[event.data.status]} ${statusColors[event.data.status]}`}
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
				{#if errorText}
					<p class="mt-xs w-full bg-red-100 p-xxs text-red-400">{errorText}</p>
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
					<select
						bind:value={activeTab}
						class="flex h-9 w-full min-w-0 rounded-none border border-muted-foreground bg-background px-3 py-1 text-base shadow-xs ring-offset-background transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
					>
						{#each tabs as tab}
							<option value={tab}>{tab}</option>
						{/each}
					</select>
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
