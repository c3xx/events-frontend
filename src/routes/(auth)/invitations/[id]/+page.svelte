<script lang="ts">
	import { page } from '$app/state';
	import CenterLoader from '$lib/components/app/center-loader.svelte';
	import { formatDate } from '$lib/helpers';
	import type { LoadedData, PendingInvitationDetailed } from '$lib/types';
	import { onMount } from 'svelte';
	import Popup from './popup.svelte';
	import { Calendar, Check, X } from '@lucide/svelte';
	import AvatarCircle from '$lib/components/app/avatar-circle.svelte';

	let invitationId: number | null = $derived(Number(page.params.id) ?? null);

	let invitationEvent = $state<LoadedData<PendingInvitationDetailed>>({
		state: 'pending',
		message: 'Loading invitation...'
	});
	let decisionMade: 'accepted' | 'rejected' | null = $state(null);

	onMount(() => {
		(async () => {
			if (!invitationId) return null;
			try {
				invitationEvent = {
					state: 'success',
					data: {
						id: 20,
						intendedRole: 'co_host',
						invitedAt: '2026-06-24 00:17:56.38514+00',
						event: {
							id: 9,
							title: 'Test Event',
							requestDetails: 'test',
							expectedParticipants: 5,
							startsAt: '2026-06-19 00:00:00+00',
							endsAt: '2026-06-20 00:00:00+00',
							parentEvent: null,
							type: { id: 4, name: 'Ideathon' },
							category: { id: 2, name: 'Educational' },
							organizers: [{ id: 10, role: 'host', organization: { id: 1, name: 'Coding Club' } }]
						},
						sender: {
							id: 13,
							fullName: 'Farhaan Nizam',
							role: { id: 5, name: 'Chairman' },
							organization: { id: 1, name: 'Coding Club', type: { id: 3, name: 'Technical Club' } }
						},
						recipientOrganization: {
							id: 52,
							name: 'CSI TKMCE',
							type: { id: 3, name: 'Technical Club' }
						}
					}
					// data: await loadPendingInvitation(Number(invitationId))
				};
			} catch (err: any) {
				invitationEvent = {
					state: 'failed',
					message: err.message ?? 'Failed to load invitation'
				};
			}
		})();
	});

	let popupOpen = $state(false);
	let activeDecision: 'accepted' | 'rejected' | null = $state(null);
</script>

{#if invitationEvent.state === 'pending' || invitationEvent.state === 'failed'}
	<CenterLoader state={invitationEvent.state} message={invitationEvent.message} />
{:else}
	<div class="flex w-full max-w-200 flex-col">
		<div class="flex items-center gap-x-xs border-b p-r-pad">
			<AvatarCircle size={30} text={invitationEvent.data.sender.fullName} />
			<div class="flex flex-col">
				<p class="text-sm font-semibold">
					{invitationEvent.data.sender.fullName}
					<span class="text-xs font-normal text-muted-foreground">invited you</span>
				</p>
				<p class="text-xs text-primary">
					{invitationEvent.data.sender.organization.name}
				</p>
			</div>
		</div>
		<div class="sticky top-12 z-40 flex flex-col gap-xs bg-background p-r-pad">
			<div class="flex w-full flex-col items-start justify-between gap-xxs">
				<h1 class="text-2xl leading-none">
					{invitationEvent.data.event.title}
				</h1>
				<div class="flex gap-x-sm text-xs">
					<p class="">{invitationEvent.data.event.type.name}</p>
					<p>|</p>
					<p class=" text-muted-foreground">
						{invitationEvent.data.event.category.name}
					</p>
				</div>
			</div>
		</div>

		<div class="flex flex-1 flex-col gap-xs">
			<div class="flex flex-col gap-sm px-r-pad pb-r-pad">
				{#if invitationEvent.data.event.parentEvent}
					<div class="flex flex-col">
						<p class="text-xs text-muted-foreground">Parent Event</p>
						<p class="text-sm font-bold">{invitationEvent.data.event.parentEvent}</p>
					</div>
				{/if}
				<div class="flex items-center gap-x-xs text-xs text-muted-foreground">
					<Calendar size="15" />
					<p>
						{formatDate(invitationEvent.data.event.startsAt)} - {formatDate(
							invitationEvent.data.event.endsAt
						)}
					</p>
				</div>
				<p class="w-full text-sm">
					{invitationEvent.data.event.requestDetails}
				</p>
				<div class="flex flex-col gap-y-xxs">
					<p class="text-sm text-muted-foreground">Organizers</p>
					<div class="flex flex-col">
						{#each invitationEvent.data.event.organizers as organizer}
							<div class="flex items-center gap-x-xs">
								<AvatarCircle size={30} text={organizer.organization.name} />
								<div class="flex flex-col">
									<p class="text-sm font-semibold">{organizer.organization.name}</p>
									<p class="text-xs">
										{organizer.role.split('_').join(' ')}
									</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
			<div class="flex gap-sm p-r-pad max-sm:sticky max-sm:bottom-0 max-sm:flex-col-reverse">
				{#if decisionMade === null}
					<button
						onclick={() => {
							activeDecision = 'rejected';
							popupOpen = true;
						}}
						class="flex items-center justify-center gap-xxs border px-6 py-2 text-sm max-sm:w-full"
						><X size="15" />Deny</button
					>
					<button
						onclick={() => {
							activeDecision = 'accepted';
							popupOpen = true;
						}}
						class="flex items-center justify-center gap-xxs bg-primary px-6 py-2 text-sm text-white max-sm:w-full"
						><Check size="15" />Approve</button
					>
				{:else}
					<p class="w-full bg-muted p-sm text-sm text-muted-foreground">
						{decisionMade.charAt(0).toUpperCase() + decisionMade.slice(1)} the invitation
					</p>
				{/if}
			</div>
		</div>
	</div>
{/if}

{#if invitationEvent.state === 'success'}
	<Popup
		bind:isOpen={popupOpen}
		{invitationId}
		bind:invitationDetailed={invitationEvent}
		decision={activeDecision!}
		bind:decisionMade
	/>
{/if}
