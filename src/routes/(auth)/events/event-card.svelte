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

<a href="/events/{event.id}" class="block no-underline">
<Card class="h-[180px] w-full rounded-none flex flex-col">
	<CardHeader class="pb-3 ">
		<div class="flex items-start justify-between">
			<CardTitle class="line-clamp-1 text-xl font-medium">
				{event.title}
			</CardTitle>

			<span class="text-muted-foreground">⋯</span>
		</div>
	</CardHeader>

	<CardContent class="flex flex-1 flex-col justify-between">
		{#if event.organizers.length}
			<div>
				<span class="bg-muted px-2 py-1 text-xs">
					{event.organizers[0].organization.name}
				</span>
			</div>
		{/if}

		<div class="mt-auto text-sm">
			<div class="text-muted-foreground">Start:</div>
			<div>{formatDate(event.startsAt)}</div>
		</div>
	</CardContent>
</Card>
</a>
