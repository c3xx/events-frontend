<script lang="ts">
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { getLocalTimeZone } from '@internationalized/date';
	import type { CalendarDate } from '@internationalized/date';

	let {
		id,
		dateLabel,
		timeLabel,
		dateValue = $bindable(),
		timeValue = $bindable()
	}: {
		id: string;
		dateLabel: string;
		timeLabel: string;
		dateValue: CalendarDate | undefined;
		timeValue: string;
	} = $props();

	let open = $state(false);
</script>

<div class="flex w-full max-w-80 gap-sm">
	<div class="flex flex-1 flex-col gap-y-xxs">
		<p class="italic">{dateLabel}</p>
		<Popover.Root bind:open>
			<Popover.Trigger id="{id}-date">
				{#snippet child({ props })}
					<Button
						{...props}
						variant="outline"
						class="w-full justify-between rounded-none border border-muted-foreground font-normal"
					>
						{dateValue ? dateValue.toDate(getLocalTimeZone()).toLocaleDateString() : 'Select date'}
						<ChevronDownIcon />
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-auto overflow-hidden p-0" align="start">
				<Calendar
					type="single"
					bind:value={dateValue}
					onValueChange={() => {
						open = false;
					}}
					captionLayout="dropdown"
				/>
			</Popover.Content>
		</Popover.Root>
	</div>
	<div class="flex flex-1 flex-col gap-y-xxs">
		<p class="italic">{timeLabel}</p>
		<Input
			type="time"
			id="{id}-time"
			step="1"
			bind:value={timeValue}
			class="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
		/>
	</div>
</div>
