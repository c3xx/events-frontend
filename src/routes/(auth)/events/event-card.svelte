<script lang="ts">
	import { formatDate } from '$lib/helpers';
	import type { Event } from '$lib/types';
	import { Calendar, SquareUser } from '@lucide/svelte';

	const statusColors: Record<Event['status'], string> = {
		draft: 'bg-yellow-400/50',
		pending: 'bg-blue-400/50',
		approved: 'bg-green-400/50',
		cancelled: 'bg-red-400/50',
		overridden: 'bg-purple-400/50'
	};

	const statusTextColors: Record<Event['status'], string> = {
		draft: 'text-yellow-700',
		pending: 'text-blue-700',
		approved: 'text-green-700',
		cancelled: 'text-red-700',
		overridden: 'text-purple-700'
	};

	let { event, cardType }: { event: Event; cardType: 'tile' | 'list-tile' } = $props();
</script>

{#if cardType === 'tile'}
	<a href="/events/{event.id}" class="no-underline">
		<div class={`flex min-w-56 flex-col border border-neutral-400 bg-background`}>
			<div class={`h-1 w-full ${statusColors[event.status]}`}></div>

			<div class="flex flex-col p-xs">
				<div class="flex w-full justify-end">
					<p
						class={`w-fit border border-muted-foreground px-xxs py-px text-start text-xs font-semibold text-muted-foreground`}
					>
						{event.organizers.find((o) => o.role === 'host')?.organization.name}
					</p>
				</div>
				<p class="text-xl">{event.title}</p>
				<div class="flex items-center gap-x-xxs">
					<p class="w-min text-xs text-foreground">{event.type.name}</p>
					<p class="text-xs text-muted-foreground">|</p>
					<p class="w-min text-xs text-muted-foreground">{event.category.name}</p>
				</div>
				<div class="mt-6 flex items-center gap-xxs text-muted-foreground">
					<Calendar size="15" />
					<p class="text-xs">{formatDate(event.startsAt)}</p>
				</div>
			</div>
		</div>
	</a>
{:else}
	<a href="/events/{event.id}" class="border-b border-neutral-400 no-underline last:border-b-0">
		<div class={`flex min-w-56 flex-col bg-background`}>
			<div class="flex flex-col p-xs">
				<div class="flex items-start justify-between">
					<div class="flex flex-col">
						<p class="text-xl">{event.title}</p>
						<div class="flex items-center gap-x-xxs">
							<p class="w-min text-xs text-foreground">{event.type.name}</p>
							<p class="text-xs text-muted-foreground">|</p>
							<p class="w-min text-xs text-muted-foreground">{event.category.name}</p>
						</div>
					</div>
					<p
						class={`w-min px-2 py-1 text-start text-xs font-semibold uppercase ${statusTextColors[event.status]} ${statusColors[event.status]}`}
					>
						{event.status}
					</p>
				</div>
				<div class="mt-6 flex items-center gap-xxs text-muted-foreground">
					<SquareUser size="15" />
					<p class={`w-fit text-start text-xs font-semibold text-muted-foreground`}>
						{event.organizers.find((o) => o.role === 'host')?.organization.name}
					</p>
				</div>
				<div class="mt-xxs flex items-center gap-xxs text-muted-foreground">
					<Calendar size="15" />
					<p class="text-xs">{formatDate(event.startsAt)}</p>
				</div>
			</div>
		</div>
	</a>
{/if}
