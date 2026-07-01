<script lang="ts">
	import { loadApprovalEvents } from '$lib/api/me/approval-assignments';
	import ShapeAvatarSvg from '$lib/components/app/shape-avatar-svg.svelte';
	import { formatDate, formatDateDayAndMonth } from '$lib/helpers';
	import type { LoadedData, PendingApprovalEvent } from '$lib/types';
	import { onMount } from 'svelte';
	import { nav } from '../header.svelte';
	import { Calendar } from '@lucide/svelte';

	let approvalEvents = $state<LoadedData<PendingApprovalEvent[]>>({
		state: 'pending',
		message: 'Loading pending approvals...'
	});

	onMount(async () => {
		nav.set([{ title: 'Approvals', url: '/approvals' }]);

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

<div class="mx-auto flex w-full max-w-prose flex-col">
	<div class="flex flex-col gap-y-8 p-r-pad">
		{#if approvalEvents.state === 'pending' || approvalEvents.state === 'failed'}
			<p>{approvalEvents.message}</p>
		{:else}
			<div class="flex flex-col gap-y-xs">
				{#if approvalEvents.data.length === 0}
					<div class="flex h-full max-h-100 w-full items-center justify-center border">
						<p class="">No pending approvals</p>
					</div>
				{/if}
				{#each approvalEvents.data as event}
					<a href={`/approvals/${event.id}`} class="no-underline">
						<div
							class="flex min-w-56 flex-col gap-0.5 rounded border bg-background p-xs hover:bg-muted"
						>
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
							</div>
							<div class="mt-3 flex items-center gap-xxs text-muted-foreground">
								<ShapeAvatarSvg
									size={15}
									seed={event.organizers.find((o) => o.role === 'host')?.organization.name!}
								/>
								<p class={`w-fit text-start text-xs font-semibold text-muted-foreground`}>
									{event.organizers.find((o) => o.role === 'host')?.organization.name}
								</p>
							</div>
							<div class="mt-xxs flex items-center gap-xxs text-muted-foreground">
								<Calendar size="15" />
								<p class="text-xs">{formatDate(event.startsAt)}</p>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
