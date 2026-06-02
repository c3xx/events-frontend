<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import { CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { Event } from '$lib/types';

	export let event: Event;
</script>

<Card>
	<CardHeader>
		<CardTitle>{event.title}</CardTitle>

		{#if event.type && event.category}
			<p class="text-xs text-muted-foreground">
				{event.type.name} • {event.category.name}
			</p>
		{/if}
	</CardHeader>

	<CardContent>
		<p>
			<span class="font-medium">Status:</span> {event.status}
		</p>
	</CardContent>
</Card>