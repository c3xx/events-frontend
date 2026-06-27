<script lang="ts">
	import { page } from '$app/state';
	import { getEvent } from '$lib/api/events';
	import { getEventType } from '$lib/api/event-types';
	import type {
		EventDetail,
		LoadedData,
		EventType,
		EventOrganizerInvitation,
		Organization,
		WorkflowInstance
	} from '$lib/types';
	import OrganizersSection from './organizers-section.svelte';
	import VenuesSection from './venues-section.svelte';
	import { loadOrganizerInvitations } from '$lib/api/events/organizer-invitations';
	import { loadOrgs } from '$lib/api/organizations';
	import OverviewSection from './overview-section.svelte';
	import WorkflowsSection from './workflows-section.svelte';
	import { loadEventWorkflowsLatest } from '$lib/api/events/workflow-instances';
	import { submitEvent } from '$lib/api/events/events';
	import { Ban, CheckCircle, Edit, Loader, Send, XCircle } from '@lucide/svelte';
	import { eventStatusColors, eventStatusTextColors } from '$lib/constants';
	import Button from '$lib/components/ui/button/button.svelte';

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

	let latestWorkflow = $state<LoadedData<WorkflowInstance> | null>({
		state: 'pending',
		message: 'Loading latest workflow...'
	});

	type TabType = 'overview' | 'organizers' | 'venues' | 'workflows';
	let activeTab: TabType = $state('overview');
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
				if (event.data.status !== 'draft') {
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
				} else {
					latestWorkflow = null;
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

	function onEnter(id: TabType) {
		activeTab = id;
	}
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
	<div class="flex w-full max-w-200 flex-col">
		<div class="flex w-full flex-col">
			<div class="sticky top-12 z-40 bg-background p-r-pad shadow-xs max-sm:border-b">
				<div class="flex w-full flex-col gap-xxs pt-sm">
					<div class="flex items-start justify-between gap-xxs">
						<div class="flex items-center gap-0.5 text-sm text-muted-foreground">
							<p class="text-foreground">{event.data.type.name}</p>
							<p>·</p>
							<p>{event.data.category.name}</p>
						</div>
						<p
							class={`px-xxs py-0.5 text-xs font-bold uppercase ${eventStatusTextColors[event.data.status]} ${eventStatusColors[event.data.status]}`}
						>
							{event.data.status}
						</p>
					</div>
					<div class="flex justify-between gap-xs">
						<h1>{event.data.title}</h1>
						<Button variant="link">Edit <Edit /></Button>
					</div>
					<!-- <Button class="max-sm:hidden sm:flex" disabled={submitLoading} onclick={onSubmitEvent}
						>{#if submitLoading}<Loader size="15" class="animate-spin" />
						{/if} Submit</Button
					>
					<button disabled={submitLoading} onclick={onSubmitEvent} class="text-primary sm:hidden"
						>{#if submitLoading}
							<Loader class="animate-spin" />
						{:else}
							<Send />
						{/if}</button
					> -->
				</div>
				{#if errorText || successText}
					<p
						class={`mt-xs w-full p-xxs ${errorText ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}
					>
						{errorText ? errorText : successText}
					</p>
				{/if}
			</div>
			<div
				class={`/sm:border-b /sm:border-muted-foreground /sm:p-sm /sm:border-x flex h-full max-w-200 flex-col gap-8 p-r-pad`}
			>
				<OverviewSection event={event.data} />
				<OrganizersSection
					eventId={event.data.id}
					eventName={event.data.title}
					bind:organizerInvitations
					bind:organizers={event.data.organizers}
					{organizations}
				/>
				<VenuesSection eventId={event.data.id} bind:allotedVenues={event.data.venueAllotments} />
				<WorkflowsSection eventId={event.data.id} activeWorkflow={latestWorkflow} />
				<div class="flex w-full gap-xs max-sm:flex-col-reverse">
					<Button class="bg-red-600 text-white sm:flex-1"><XCircle size="15" /> Cancel Event</Button
					>
					{#if event.data.status !== 'pending'}
						<Button onclick={onSubmitEvent} class="sm:flex-1"
							>{#if submitLoading}
								<Loader size="15" class="animate-spin" />{:else}<CheckCircle size="15" />
							{/if} Submit Event</Button
						>
					{:else}
						<Button class="bg-red-300 text-foreground sm:flex-1"
							><Ban size="15" /> Abort Workflow</Button
						>
					{/if}
				</div>
			</div>
			<!-- <TabsScrollBar bind:activeTab /> -->
		</div>
	</div>
{/if}
