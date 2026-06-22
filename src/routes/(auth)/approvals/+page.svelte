<script lang="ts">
	import { loadApprovalEvents } from '$lib/api/me/approval-assignments';
	import { formatDate } from '$lib/helpers';
	import type { LoadedData, PendingApprovalEvent } from '$lib/types';
	import { onMount } from 'svelte';

	let approvalEvents = $state<LoadedData<PendingApprovalEvent[]>>({
		state: 'pending',
		message: 'Loading pending approvals...'
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
	});
</script>

<div class="flex w-full max-w-200 flex-col">
	<div class="sticky top-12 z-40 flex flex-col gap-xs bg-background p-r-pad">
		<div class="flex w-full items-center justify-between">
			<h1 class="text-2xl leading-none">Pending Approvals</h1>
		</div>
	</div>

	<div class="flex flex-col gap-y-8 p-r-pad">
		{#if approvalEvents.state === 'pending' || approvalEvents.state === 'failed'}
			<p>{approvalEvents.message}</p>
		{:else if approvalEvents.data.length > 0}
			<div class="flex flex-col gap-y-xs">
				{#if approvalEvents.data.length === 0}
					<p class="flex w-full items-center justify-center border py-6">No pending approvals</p>
				{/if}
				{#each approvalEvents.data as event}
					<a href={`/approvals/${event.id}`} class="no-underline">
						<div class="flex min-w-56 flex-col border border-neutral-400 bg-background p-xs">
							<p>{event.title}</p>
							<p class="text-xs text-muted-foreground">{formatDate(event.startsAt)}</p>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
