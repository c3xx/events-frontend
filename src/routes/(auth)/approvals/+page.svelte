<script lang="ts">
	import { loadApprovalEvents } from '$lib/api/me/approval-assignments';
	import ShapeAvatarSvg from '$lib/components/app/shape-avatar-svg.svelte';
	import { formatDateDayAndMonth } from '$lib/helpers';
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

<div class="mx-auto flex w-full max-w-prose flex-col">
	<div class="sticky top-12 z-40 flex flex-col gap-xs bg-background p-r-pad">
		<div class="flex w-full items-center justify-between">
			<h1 class="text-2xl leading-none">Pending Approvals</h1>
		</div>
	</div>

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
						<div class="flex min-w-56 flex-col gap-0.5 border border-neutral-400 bg-muted p-xs">
							<div class="flex items-start justify-between gap-x-0.5">
								<p class="font-bold">
									{event.title}
									{#if event.parentEvent}
										<span class="italic">({event.parentEvent.title})</span>
									{/if}
								</p>
								<p class="text-xs text-muted-foreground">{formatDateDayAndMonth(event.startsAt)}</p>
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
	</div>
</div>
