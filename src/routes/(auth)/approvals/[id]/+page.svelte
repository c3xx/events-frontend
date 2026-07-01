<script lang="ts">
	import { page } from '$app/state';
	import { loadEventAssignments, respondEventAssignments } from '$lib/api/me/approval-assignments';
	import CenterLoader from '$lib/components/app/center-loader.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		workflowStepAssignmentStatusColors,
		workflowStepAssignmentStatusTextColors
	} from '$lib/constants';
	import { formatDate, formatDateDayAndMonthAndYear, formatDateOnlyTime } from '$lib/helpers';
	import type { EventAssignmentsAndDetails, LoadedData } from '$lib/types';
	import { onMount } from 'svelte';
	import Popup from './popup.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { nav } from '../../header.svelte';
	import ShapeAvatarSvg from '$lib/components/app/shape-avatar-svg.svelte';
	import {
		Check,
		CheckCheck,
		CheckCircle,
		ChevronLast,
		Clock,
		Ellipsis,
		Skull,
		X,
		XCircle
	} from '@lucide/svelte';

	let eventId: number | null = $derived(Number(page.params.id) ?? null);

	let eventAssignments = $state<LoadedData<EventAssignmentsAndDetails>>({
		state: 'pending',
		message: 'Loading event assignments...'
	});

	onMount(() => {
		nav.set([{ title: 'Approvals', url: '/approvals' }]);

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

	let descLength = $state(150);
	function onMoreClick() {
		descLength += 100;
	}

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
			<div class="flex w-full flex-col items-start justify-between gap-xxs">
				<h1 class="text-2xl leading-none">
					{eventAssignments.data.title}
				</h1>
				<div class="flex gap-x-xxs text-xs">
					<p class="">{eventAssignments.data.type.name}</p>
					<p>&middot;</p>
					<p class=" text-muted-foreground">
						{eventAssignments.data.category.name}
					</p>
				</div>
			</div>
		</div>

		<div class="flex flex-col gap-8 p-r-pad">
			<div class="flex flex-col gap-6">
				{#if eventAssignments.data.parentEvent}
					<div class="flex w-full flex-col">
						<p class="text-xs text-muted-foreground">Parent Event</p>
						<p class="text-sm font-bold">{eventAssignments.data.parentEvent}</p>
					</div>
				{/if}
				<div class="flex w-full flex-col">
					<p class="leading-tight text-muted-foreground">
						{eventAssignments.data.requestDetails.slice(0, descLength).trim()}
						{#if eventAssignments.data.requestDetails.length > descLength}
							<span>
								<Button onclick={onMoreClick} variant="link" class="h-min p-0 text-xs"
									>Show more</Button
								>
							</span>
						{/if}
					</p>
				</div>
				<div class="flex gap-sm max-sm:flex-col">
					<div class="flex w-full flex-col">
						<p class="text-xs text-muted-foreground">Expected participants</p>
						<p class="text-lg leading-tight">{eventAssignments.data.expectedParticipants}</p>
					</div>
					<div class="flex w-full items-center justify-between">
						<div class="flex w-full flex-col">
							<p class="text-xs text-muted-foreground">Starts at</p>
							<p class="text-left text-lg leading-tight">
								{formatDateDayAndMonthAndYear(eventAssignments.data.startsAt)}
							</p>
							<p class="text-lg leading-tight">
								{formatDateOnlyTime(eventAssignments.data.startsAt)}
							</p>
						</div>
						<Ellipsis />
						<div class="flex w-full flex-col items-end">
							<p class="text-xs text-muted-foreground">Ends at</p>
							<p class="text-right text-lg leading-tight">
								{formatDateDayAndMonthAndYear(eventAssignments.data.endsAt)}
							</p>
							<p class="text-lg leading-tight">
								{formatDateOnlyTime(eventAssignments.data.endsAt)}
							</p>
						</div>
					</div>
				</div>
			</div>

			<div class="space-y-2">
				<div class="flex place-items-center justify-between">
					<p class="text-lg font-medium">Organizers</p>
				</div>

				<div class="flex grid-cols-2 flex-col divide-y rounded-lg border sm:grid sm:divide-y-0">
					{#each eventAssignments.data.organizers as o}
						<div
							class="flex place-items-center justify-between gap-4 py-2 pr-2 pl-3 first:rounded-t-lg last:rounded-b-lg"
						>
							<div class="flex place-items-center gap-2.5">
								<ShapeAvatarSvg size={32} seed={o.organization.name} class="rounded-sm" />
								<div>
									<div>{o.organization.name}</div>
									<p class="text-xs text-muted-foreground">
										{#if o.role === 'host'}
											Host
										{:else if o.role === 'co_host'}
											Co-host
										{:else if o.role === 'resource_provider'}
											Resource provider
										{:else}
											{o.role}
										{/if}
									</p>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<div class="space-y-2">
				<div class="flex place-items-center justify-between">
					<p class="text-lg font-medium">Assignments</p>
				</div>

				<div class="flex flex-col divide-y rounded-lg border">
					{#each eventAssignments.data.assignments as assignment}
						<div
							class="flex place-items-center justify-between gap-4 py-2 pr-2 pl-3 first:rounded-t-lg last:rounded-b-lg"
						>
							<div class="flex place-items-center gap-2.5">
								<div
									class={[
										'aspect-square rounded-full p-1 text-background',
										assignment.status === 'approved'
											? 'bg-emerald-600'
											: assignment.status === 'denied'
												? 'bg-red-700'
												: assignment.status === 'skipped'
													? 'bg-neutral-300'
													: assignment.status === 'pending'
														? 'bg-amber-300 text-foreground'
														: 'bg-background text-foreground'
									]}
								>
									{#if assignment.status === 'approved'}
										<Check size="12" strokeWidth={3} />
									{:else if assignment.status === 'denied'}
										<X size="12" strokeWidth={3} />
									{:else if assignment.status === 'skipped'}
										<ChevronLast size="12" strokeWidth={3} />
									{:else if assignment.status === 'pending'}
										<Clock size="12" strokeWidth={3} />
									{:else}
										<Skull size="12" strokeWidth={3} />
									{/if}
								</div>
								<div>
									<div>{assignment.role.name}</div>
									<p class="text-xs text-muted-foreground">
										{assignment.role.scope.kindName}
									</p>
								</div>
							</div>
						</div>
					{/each}
				</div>
				<div class="mt-r-pad flex w-full gap-2.5 max-sm:flex-col-reverse">
					<Button
						disabled={!eventAssignments.data.assignments.some((a) => a.status === 'pending')}
						onclick={() => {
							activeDecision = 'denied';
							popupOpen = true;
						}}
						class="cursor-pointer border border-foreground bg-background  text-foreground hover:bg-muted sm:flex-1"
						><XCircle size="15" />Deny</Button
					>
					<Button
						disabled={!eventAssignments.data.assignments.some((a) => a.status === 'pending')}
						onclick={() => {
							activeDecision = 'approved';
							popupOpen = true;
						}}
						class="cursor-pointer bg-foreground text-background hover:bg-neutral-700 sm:flex-1"
						><CheckCircle size="15" />Approve</Button
					>
				</div>
			</div>
		</div>
	</div>
{/if}

{#if eventAssignments.state === 'success'}
	<Popup bind:isOpen={popupOpen} {eventId} bind:eventAssignments decision={activeDecision} />
{/if}
