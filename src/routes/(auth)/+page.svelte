<script lang="ts">
	import { loadApprovalEvents, loadEventAssignments } from '$lib/api/me/approval-assignments';
	import { loadPendingInvitations } from '$lib/api/me/invitations';
	import ShapeAvatarSvg from '$lib/components/app/shape-avatar-svg.svelte';
	import { eventStatusColors, eventStatusTextColors } from '$lib/constants';
	import { formatDate, formatDateDayAndMonth } from '$lib/helpers';
	import type { LoadedData, PendingApprovalEvent, PendingInvitation } from '$lib/types';
	import { Inbox } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let approvalEvents = $state<LoadedData<PendingApprovalEvent[]>>({
		state: 'pending',
		message: 'Loading pending approvals...'
	});
	let pendingInvitations = $state<LoadedData<PendingInvitation[]>>({
		state: 'pending',
		message: 'Loading invitations...'
	});

	onMount(async () => {
		try {
			approvalEvents = {
				state: 'success',
				data: await loadApprovalEvents()
			};
		} catch (err: any) {
			approvalEvents = {
				state: 'failed',
				message: err.message ?? 'Failed to load pending approvals'
			};
		}
		try {
			pendingInvitations = {
				state: 'success',
				data: await loadPendingInvitations()
			};
		} catch (err: any) {
			pendingInvitations = {
				state: 'failed',
				message: err.message ?? 'Failed to load invitations'
			};
		}
	});

	let allEmpty = $derived.by(() => {
		if (approvalEvents.state !== 'success') return false;
		if (pendingInvitations.state !== 'success') return false;
		return approvalEvents.data.length === 0 && pendingInvitations.data.length === 0;
	});
</script>

<div class="mx-auto flex h-full max-w-prose flex-col">
	<div class="sticky top-12 z-40 flex flex-col gap-xs bg-background p-r-pad">
		<div class="flex w-full items-center justify-between">
			<h1 class="text-2xl leading-none">Inbox</h1>
		</div>
	</div>

	<div class="flex h-full flex-col gap-y-8 p-r-pad">
		{#if allEmpty}
			<div class="flex h-full w-full flex-col items-center justify-center">
				<div class="flex flex-col items-center bg-muted px-10 py-20">
					<Inbox />
					<p>You have no messages</p>
					<p class="text-xs text-muted-foreground">Find your important messages here</p>
				</div>
			</div>
		{/if}
		{#if approvalEvents.state === 'pending' || approvalEvents.state === 'failed'}
			<p>{approvalEvents.message}</p>
		{:else if approvalEvents.data.length > 0}
			<div class="flex flex-col gap-y-xs">
				<p class="text-xs text-muted-foreground uppercase">Pending Approvals</p>
				{#each approvalEvents.data as event}
					<a href={`/approvals/${event.id}`} class="no-underline">
						<div class="flex min-w-56 flex-col gap-0.5 border border-neutral-400 bg-muted p-xs">
							<div class="flex items-start justify-between gap-x-0.5">
								<p class="font-bold">
									{event.title}
									{#if event.parentEvent}
										<span class="italic">({event.parentEvent.title})</span>
									{/if}
								</p>
								<p class="text-xs text-muted-foreground">
									{formatDateDayAndMonth(event.createdAt)}
								</p>
								<!-- change this to createdAt -->
							</div>
							<div class="flex items-center gap-x-xxs text-xs text-muted-foreground">
								<p>
									{formatDateDayAndMonth(event.startsAt)}
								</p>
								{#if formatDateDayAndMonth(event.startsAt) === formatDateDayAndMonth(event.endsAt)}
									<p>-</p>
									<p>
										{formatDateDayAndMonth(event.endsAt)}
									</p>
								{/if}
							</div>
							<div class="mt-xxs flex items-center gap-x-xxs">
								<ShapeAvatarSvg
									size={20}
									seed={event.organizers.find((o) => o.role === 'host')?.organization.name!}
								/>
								<p class={`text-xs`}>
									{event.organizers.find((o) => o.role === 'host')?.organization.name!}
								</p>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}
		{#if pendingInvitations.state === 'pending' || pendingInvitations.state === 'failed'}
			<p>{pendingInvitations.message}</p>
		{:else if pendingInvitations.data.length > 0}
			<div class="flex flex-col gap-y-xs">
				<p class="text-xs text-muted-foreground uppercase">Invitations</p>
				{#each pendingInvitations.data as invitation}
					<a href={`/invitations/${invitation.id}`} class="no-underline">
						<div
							class="flex min-w-56 flex-col gap-0.5 border border-neutral-400 bg-background bg-muted p-xs"
						>
							<div class="flex items-start justify-between gap-x-0.5">
								<div class="flex items-center gap-x-1">
									<p class={`text-xs`}>
										{invitation.recipientOrganization.name}
									</p>
								</div>
								<p class="text-xs text-muted-foreground">
									{formatDateDayAndMonth(invitation.invitedAt)}
								</p>
							</div>
							<div class="mt-xxs flex items-center gap-x-xxs">
								<ShapeAvatarSvg seed={invitation.sender.organization.name} />
								<div class="flex flex-col">
									<p class="text-sm font-bold text-foreground">
										{invitation.event.title}
									</p>
									<p class={`text-sm text-muted-foreground`}>
										{invitation.sender.organization.name}
									</p>
								</div>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
