<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import { CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';

	import type { Event } from '$lib/types';

	export let event: Event;

	const formatDate = (date: string) =>
		new Date(date).toLocaleDateString('en-IN', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});

</script>
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