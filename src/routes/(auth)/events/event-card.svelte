<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import { CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Calendar, Users, Building2, GitBranch } from '@lucide/svelte';

	import type { Event } from '$lib/types';

	export let event: Event;

	const formatDate = (date: string) =>
		new Date(date).toLocaleDateString('en-IN', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});

	function statusClasses(status: string) {
		switch (status) {
			case 'approved':
				return 'bg-green-100 text-green-700';
			case 'pending':
				return 'bg-yellow-100 text-yellow-700';
			case 'draft':
				return 'bg-slate-100 text-slate-700';
			case 'cancelled':
				return 'bg-red-100 text-red-700';
			default:
				return 'bg-blue-100 text-blue-700';
		}
	}
</script>

<Card
	class="h-[260px] sm:h-[280px] flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
>
	<CardHeader class="space-y-3 pb-3">
		<div class="flex items-start justify-between gap-3">
			<CardTitle class="min-h-[3.5rem] line-clamp-2 text-lg leading-tight">
				{event.title}
			</CardTitle>

			<span
				class={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${statusClasses(event.status)}`}
			>
				{event.status}
			</span>
		</div>

		<div class="flex flex-wrap gap-2">
			<span class="rounded-md bg-muted px-2 py-1 text-xs">
				{event.type.name}
			</span>

			<span class="rounded-md bg-muted px-2 py-1 text-xs">
				{event.category.name}
			</span>
		</div>
	</CardHeader>

	<CardContent class="flex flex-1 flex-col">
		<div class="space-y-2 text-sm text-muted-foreground">
			<div class="flex items-center gap-2">
				<Calendar class="h-4 w-4 shrink-0" />
				<span>{formatDate(event.startsAt)}</span>
			</div>

			<div class="flex items-center gap-2">
				<Users class="h-4 w-4 shrink-0" />
				<span>{event.expectedParticipants} participants</span>
			</div>

			<div class="flex items-center gap-2">
				<Building2 class="h-4 w-4 shrink-0" />
				<span>
					{event.organizers.length}
					organizer{event.organizers.length !== 1 ? 's' : ''}
				</span>
			</div>

			<!-- reserve space -->
			<div class="h-5">
				{#if event.parentEvent}
					<div class="flex items-center gap-2">
						<GitBranch class="h-4 w-4 shrink-0" />
						<span class="truncate">
							Part of {event.parentEvent.title}
						</span>
					</div>
				{/if}
			</div>
		</div>

		<div class="mt-auto border-t pt-3">
			<p class="min-h-[2.5rem] line-clamp-2 text-sm text-muted-foreground">
				{event.requestDetails}
			</p>
		</div>
	</CardContent>
</Card>