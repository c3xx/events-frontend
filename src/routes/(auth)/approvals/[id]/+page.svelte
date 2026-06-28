<script lang="ts">
	import { page } from '$app/state';
	import { loadEventAssignments, respondEventAssignments } from '$lib/api/me/approval-assignments';
	import CenterLoader from '$lib/components/app/center-loader.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		workflowStepAssignmentStatusColors,
		workflowStepAssignmentStatusTextColors
	} from '$lib/constants';
	import { formatDate } from '$lib/helpers';
	import type { EventAssignmentsAndDetails, LoadedData } from '$lib/types';
	import { onMount } from 'svelte';
	import Popup from './popup.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	let eventId: number | null = $derived(Number(page.params.id) ?? null);

	let eventAssignments = $state<LoadedData<EventAssignmentsAndDetails>>({
		state: 'pending',
		message: 'Loading event assignments...'
	});

	onMount(() => {
		(async () => {
			if (!eventId) return null;
			try {
				eventAssignments = {
					state: 'success',
					// data: {
					// 	id: 1,
					// 	title: 'string',
					// 	expectedParticipants: 2,
					// 	requestDetails: 'string',
					// 	status: 'pending',
					// 	parentEventId: null,
					// 	startsAt: 'null',
					// 	endsAt: 'null',
					// 	type: {
					// 		id: 2,
					// 		name: ''
					// 	},
					// 	category: {
					// 		id: 3,
					// 		name: 'string'
					// 	},
					// 	parentEvent: null,
					// 	createdAt: '',
					// 	updatedAt: '',
					// 	venueAllotments: [
					// 		{
					// 			id: 1,
					// 			startsAt: 'string',
					// 			endsAt: 'string',
					// 			venue: {
					// 				id: 2,
					// 				name: 'string'
					// 			}
					// 		}
					// 	],
					// 	organizers: [
					// 		{
					// 			id: 1,
					// 			role: 'host',
					// 			organization: {
					// 				id: 1,
					// 				name: 'string',
					// 				organizationTypeId: 'undefined',
					// 				parentOrganizationId: '',
					// 				isActive: true
					// 			}
					// 		}
					// 	],
					// 	assignments: [
					// 		{
					// 			state: 'approved',
					// 			id: 1,
					// 			status: 'pending',
					// 			remarks: null,
					// 			completedAt: null,
					// 			step: {
					// 				id: 1,
					// 				name: 'string',
					// 				status: 'active',
					// 				instanceId: 4
					// 			},
					// 			role: {
					// 				id: 2,
					// 				name: 'string',
					// 				scope: {
					// 					type: 'organization',
					// 					kindId: 3,
					// 					kindName: 'string'
					// 				}
					// 			},
					// 			scope: {
					// 				type: 'organization',
					// 				id: 2,
					// 				name: 'string'
					// 			}
					// 		}
					// 	]
					// }
					data: await loadEventAssignments(Number(eventId))
				};
			} catch (err: any) {
				eventAssignments = {
					state: 'failed',
					message: err.message ?? 'Failed to load assignments'
				};
			}
		})();
	});

	let popupOpen = $state(false);
	let activeUserRole: string | null = $state(null);
	let activeUserRoleScopeKindName: string | null = $state(null);
	let activeKindName: string | null = $state(null);
	let activeDecision: 'approved' | 'denied' = $state('approved');
	let activeIds: number[] = $state([]);
</script>

{#if eventAssignments.state === 'pending' || eventAssignments.state === 'failed'}
	<CenterLoader state={eventAssignments.state} message={eventAssignments.message} />
{:else}
	<div class="mx-auto flex w-full max-w-prose flex-col">
		<div class="sticky top-12 z-40 flex flex-col gap-xs bg-background p-r-pad">
			<div class="flex w-full items-center justify-between">
				<h1 class="text-2xl leading-none">
					{eventAssignments.data.title}
				</h1>
			</div>
		</div>

		<div class="flex flex-col gap-xs">
			<div class="flex flex-col gap-sm p-r-pad">
				<div class="flex flex-col gap-y-xxs">
					<p>Description</p>
					<p
						class="w-full max-w-200 border border-muted-foreground bg-muted p-xxs text-sm whitespace-pre-wrap"
					>
						{eventAssignments.data.requestDetails}
					</p>
				</div>
				<div class="flex flex-col gap-y-xxs">
					<p>Event Details</p>
					<div
						class="grid grid-cols-2 flex-col border border-muted-foreground bg-muted p-sm text-xs uppercase max-sm:flex sm:gap-sm"
					>
						<p class="text-muted-foreground">Type</p>
						<p class="text-sm max-sm:mb-sm">{eventAssignments.data.type.name}</p>
						<p class="text-muted-foreground">Category</p>
						<p class="text-sm max-sm:mb-sm">{eventAssignments.data.category.name}</p>
						<p class="text-muted-foreground">Expected Participants</p>
						<p class="text-sm max-sm:mb-sm">{eventAssignments.data.expectedParticipants}</p>
						<p class="text-muted-foreground">Starts At</p>
						<p class="text-sm max-sm:mb-sm">{formatDate(eventAssignments.data.startsAt)}</p>
						<p class="text-muted-foreground">Ends At</p>
						<p class="text-sm max-sm:mb-sm">{formatDate(eventAssignments.data.endsAt)}</p>
						{#if eventAssignments.data.parentEvent}
							<p class="text-primary">Parent Event</p>
							{eventAssignments.data.parentEvent.title}
						{/if}
						<p class="text-muted-foreground">Created</p>
						<p class="text-sm max-sm:mb-sm">{formatDate(eventAssignments.data.createdAt)}</p>
					</div>
				</div>
				<div class="flex flex-col gap-y-xxs">
					<p>Organizers</p>
					<div class="hidden sm:block">
						<table class="w-full max-w-200 border border-muted-foreground text-sm">
							<thead class="border-b border-muted-foreground text-muted-foreground">
								<tr class="bg-muted">
									<th class="p-xs text-left"> Name </th>
									<th class="p-xs text-left">Role</th>
								</tr>
							</thead>
							<tbody>
								{#if eventAssignments.data.organizers.length === 0}
									<tr
										><td class="py-6" colspan="2"
											><p class="w-full text-center text-muted-foreground italic">
												No organizers found
											</p></td
										></tr
									>
								{/if}
								{#each eventAssignments.data.organizers as o}
									<tr>
										<td class="px-xs py-xxs text-left">{o.organization.name}</td>
										<td class="px-xs py-xxs text-left capitalize">{o.role}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					<div class="block max-w-200 border border-muted-foreground text-sm sm:hidden">
						{#if eventAssignments.data.organizers.length === 0}
							<p class="w-full py-6 text-center text-muted-foreground italic">
								No organizers found
							</p>
						{/if}
						{#each eventAssignments.data.organizers as o}
							<div
								class="flex items-center justify-between gap-xxs border-b border-muted-foreground p-xs last:border-b-0"
							>
								<div class="flex flex-col gap-px">
									<p class="text-lg">{o.organization.name}</p>
									<p class="text-muted-foreground capitalize">{o.role}</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
				<div class="flex flex-col gap-y-xxs">
					<p>Venues Alloted</p>
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
								{#if eventAssignments.data.venueAllotments.length === 0}
									<tr
										><td class="py-6" colspan="3"
											><p class="w-full text-center text-muted-foreground italic">
												No venues alloted yet
											</p></td
										></tr
									>
								{/if}
								{#each eventAssignments.data.venueAllotments as venue}
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
						{#if eventAssignments.data.venueAllotments.length === 0}
							<p class="w-full py-6 text-center text-muted-foreground italic">
								No venues alloted yet
							</p>
						{/if}
						{#each eventAssignments.data.venueAllotments as venue}
							<div
								class="flex flex-col items-start gap-y-xxs border-b border-muted-foreground p-xs last:border-b-0"
							>
								<div class="flex w-full items-center justify-between gap-x-xs">
									<p class="text-lg">{venue.venue.name}</p>
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
				</div>
			</div>
			<div class="flex flex-col gap-y-xxs p-r-pad">
				<p>Approvals</p>
				<div class="max-w-200 border border-muted-foreground text-sm">
					{#if eventAssignments.data.assignments.length === 0}
						<p class="flex justify-center py-10 text-xs text-muted-foreground italic">
							No pending approvals
						</p>
					{/if}
					{#each eventAssignments.data.assignments as assignment}
						<div
							class="flex flex-col gap-xs border-b border-muted-foreground bg-background p-xs text-sm last:border-0"
						>
							<div class="flex w-full flex-col">
								<div class="flex w-full items-end justify-between">
									<p class="text-xs text-muted-foreground">To</p>
									<p
										class={`w-min px-xxs py-0.5 text-xs font-semibold uppercase ${workflowStepAssignmentStatusTextColors[assignment.status]} ${workflowStepAssignmentStatusColors[assignment.status]}`}
									>
										{assignment.status}
									</p>
								</div>
								<p class="text-lg capitalize">{assignment.role.name}</p>
								<p class="text-xs font-bold text-muted-foreground uppercase">
									{assignment.role.scope.kindName}
								</p>
								{#if assignment.remarks && assignment.remarks.length > 0}
									<Separator class="my-xs" />
									<p class=" text-xs text-muted-foreground">
										Remarks: <span class="text-foreground">{assignment.remarks}</span>
									</p>
								{/if}
							</div>
							{#if assignment.status === 'pending'}
								<div class="flex justify-end gap-xs max-sm:flex-col">
									<Button
										onclick={() => {
											activeUserRole = assignment.role.name;
											activeDecision = 'denied';
											activeKindName = assignment.scope.name;
											activeUserRoleScopeKindName = assignment.role.scope.kindName;
											activeIds = [assignment.id];
											popupOpen = true;
										}}
										variant="secondary"
										class="max-sm:w-full">Deny</Button
									>
									<Button
										onclick={() => {
											activeUserRole = assignment.role.name;
											activeDecision = 'approved';
											activeKindName = assignment.scope.name;
											activeUserRoleScopeKindName = assignment.role.scope.kindName;
											activeIds = [assignment.id];
											popupOpen = true;
										}}
										class="max-sm:w-full">Approve</Button
									>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}

{#if eventAssignments.state === 'success'}
	<Popup
		bind:isOpen={popupOpen}
		{eventId}
		bind:eventAssignments
		decision={activeDecision}
		kindName={activeKindName!}
		userRoleName={activeUserRole!}
		userScopeKindName={activeUserRoleScopeKindName!}
		eventName={eventAssignments.data.title}
		ids={activeIds}
	/>
{/if}
