<script lang="ts">
	import { eventStatusColors, eventStatusTextColors } from '$lib/constants';
	import { formatDate } from '$lib/helpers';
	import type { Event } from '$lib/types';
	import { Calendar, SquareUser } from '@lucide/svelte';

	let { event, cardType }: { event: Event; cardType: 'tile' | 'list-tile' } = $props();
</script>

{#if cardType === 'tile'}
	<a href="/events/{event.id}" class="no-underline">
		<div class={`flex min-w-56 flex-col border border-neutral-400 bg-background`}>
			<div class={`h-1 w-full ${eventStatusColors[event.status]}`}></div>

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
						class={`w-min rounded px-1 py-0.5 text-start text-[10px] font-semibold uppercase ${eventStatusTextColors[event.status]} ${eventStatusColors[event.status]}`}
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
