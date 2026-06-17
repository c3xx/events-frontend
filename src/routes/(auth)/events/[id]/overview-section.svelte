<script lang="ts">
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { formatDate } from '$lib/helpers';
	import type { EventDetail, LoadedData, WorkflowInstance } from '$lib/types';
	import { MapPin, Network, Users } from '@lucide/svelte';

	let { event, workflows }: { event: EventDetail; workflows: LoadedData<WorkflowInstance[]> } =
		$props();
</script>

<div class="flex flex-col gap-sm">
	<div class="flex gap-sm max-sm:flex-col-reverse">
		<div class="flex w-full flex-col">
			<p class="mb-xs">Event Details</p>
			<div class="grid grid-cols-2 flex-col bg-muted p-sm text-xs uppercase max-sm:flex sm:gap-sm">
				<p class="text-muted-foreground">Type</p>
				<p class="text-sm max-sm:mb-sm">{event.type.name}</p>
				<p class="text-muted-foreground">Category</p>
				<p class="text-sm max-sm:mb-sm">{event.category.name}</p>
				<p class="text-muted-foreground">Expected Participants</p>
				<p class="text-sm max-sm:mb-sm">{event.expectedParticipants}</p>
				<p class="text-muted-foreground">Starts At</p>
				<p class="text-sm max-sm:mb-sm">{formatDate(event.startsAt)}</p>
				<p class="text-muted-foreground">Ends At</p>
				<p class="text-sm max-sm:mb-sm">{formatDate(event.endsAt)}</p>
				{#if event.parentEvent}
					<p class="text-muted-foreground">Parent Event</p>
					<a
						href="/events/{event.parentEvent.id}"
						class="text-sm text-primary underline max-sm:mb-sm"
					>
						{event.parentEvent.title}
					</a>
				{/if}
				<p class="text-muted-foreground">Created</p>
				<p class="text-sm max-sm:mb-sm">{formatDate(event.createdAt)}</p>
			</div>
		</div>
		<div class="flex min-w-50 flex-col">
			<p class="mb-xs">Quick Look</p>
			<div class="flex flex-col gap-xs">
				<div class="flex items-center gap-x-xxs p-xxs">
					<div
						class="flex aspect-square h-8 items-center justify-center rounded-full bg-primary/30 text-primary"
					>
						<Users size="15" />
					</div>
					<div class="flex flex-col items-start">
						<p>Organizers</p>
						<p class="text-xs text-muted-foreground">
							{event.organizers.length} assigned {event.organizers.length === 1
								? ` (${event.organizers[0].role})`
								: ''}
						</p>
					</div>
				</div>
				<div class="flex items-center gap-x-xxs p-xxs">
					<div
						class="flex aspect-square h-8 items-center justify-center rounded-full bg-green-700/30 text-green-700"
					>
						<MapPin size="15" />
					</div>
					<div class="flex flex-col items-start">
						<p>Venues</p>
						<p class="text-xs text-muted-foreground">
							{event.venueAllotments.length} alloted venues {event.venueAllotments.length === 1
								? ` (${event.venueAllotments[0].venue})`
								: ''}
						</p>
					</div>
				</div>
				<div class="flex items-center gap-x-xxs p-xxs">
					<div
						class="flex aspect-square h-8 items-center justify-center rounded-full bg-violet-700/30 text-violet-700"
					>
						<Network size="15" />
					</div>
					<div class="flex flex-col items-start">
						<p>Workflows</p>
						<p class="text-xs text-muted-foreground">
							{#if workflows.state === 'pending'}
								Loading...
							{:else if workflows.state === 'success'}
								{workflows.data.length} instance{workflows.data.length > 1 ? 's' : ''}
							{/if}
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="flex flex-col gap-y-xxs">
		<p>Description</p>
		<p class="w-full max-w-200 bg-muted p-xxs text-sm whitespace-pre-wrap">
			{event.requestDetails}
		</p>
	</div>
</div>
