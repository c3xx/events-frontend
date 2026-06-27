<script lang="ts">
	import { loadApprovalEvents } from '$lib/api/me/approval-assignments';
	import { loadPendingInvitations } from '$lib/api/me/invitations';
	import ShapeAvatarSvg from '$lib/components/app/shape-avatar-svg.svelte';
	import { formatDate, formatDateDayAndMonth } from '$lib/helpers';
	import type { LoadedData, PendingInvitation } from '$lib/types';
	import { onMount } from 'svelte';

	let pendingInvitations = $state<LoadedData<PendingInvitation[]>>({
		state: 'pending',
		message: 'Loading pending approvals...'
	});

	onMount(async () => {
		try {
			pendingInvitations = {
				state: 'success',
				data: await loadPendingInvitations()
			};
		} catch (err: any) {
			pendingInvitations = {
				state: 'failed',
				message: err.message ?? 'Failed to load pending approvals'
			};
		}
	});
</script>

<div class="flex h-full w-full max-w-200 flex-col">
	<div class="sticky top-12 z-40 flex flex-col gap-xs bg-background p-r-pad">
		<div class="flex w-full items-center justify-between">
			<h1 class="text-2xl leading-none">Invitations</h1>
		</div>
	</div>

	<div class="flex h-full flex-col gap-y-8 p-r-pad">
		{#if pendingInvitations.state === 'pending' || pendingInvitations.state === 'failed'}
			<p>{pendingInvitations.message}</p>
		{:else}
			<div class="flex h-full flex-col gap-y-xs">
				{#if pendingInvitations.data.length === 0}
					<div class="flex h-full max-h-100 w-full items-center justify-center border">
						<p class="">No invitations</p>
					</div>
				{/if}
				{#each pendingInvitations.data as invitation}
					<a href={`/invitations/${invitation.id}`} class="no-underline">
						<div class="flex min-w-56 flex-col gap-0.5 border border-neutral-400 bg-muted p-xs">
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
								<ShapeAvatarSvg size={30} seed={invitation.sender.organization.name} />
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
