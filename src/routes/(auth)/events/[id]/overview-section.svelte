<script lang="ts">
	import { formatDateDayAndMonthAndYear, formatDateOnlyTime } from '$lib/helpers';
	import type { EventDetail } from '$lib/types';
	import { Ellipsis } from '@lucide/svelte';

	let { event }: { event: EventDetail } = $props();
</script>

<div class="flex flex-col gap-6">
	<div class="flex w-full flex-col">
		<p>{event.requestDetails}</p>
	</div>
	<div class="flex gap-sm max-sm:flex-col">
		<div class="flex w-full flex-col">
			<p class="text-xs text-muted-foreground">Expected Participants</p>
			<p class="text-lg leading-tight">{event.expectedParticipants}</p>
		</div>
		<div class="flex w-full items-center justify-between">
			<div class="flex w-full flex-col">
				<p class="text-xs text-muted-foreground">Starts At</p>
				<p class="text-left text-lg leading-tight">
					{formatDateDayAndMonthAndYear(event.startsAt)}
				</p>
				<p class="text-lg leading-tight">{formatDateOnlyTime(event.startsAt)}</p>
			</div>
			<Ellipsis />
			<div class="flex w-full flex-col items-end">
				<p class="text-xs text-muted-foreground">Ends At</p>
				<p class="text-right text-lg leading-tight">{formatDateDayAndMonthAndYear(event.endsAt)}</p>
				<p class="text-lg leading-tight">{formatDateOnlyTime(event.endsAt)}</p>
			</div>
		</div>
	</div>
</div>
