<script lang="ts">
	import { getDaysInMonth } from '$lib/helpers';

	const MONTHS = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];
	const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	let DATE_NOW = new Date(Date.now());
	let CURRENT_YEAR = DATE_NOW.getFullYear();
	let YEARS = Array.from({ length: 21 }, (_, i) => CURRENT_YEAR - 10 + i);

	let activeYear = $state(CURRENT_YEAR);
	let activeMonth = $state(DATE_NOW.toLocaleString('en-IN', { month: 'long' }));
	let activeMonthNumeric = $derived(new Date(`${activeMonth} 1, ${activeYear}`).getMonth() + 1);

	let dayOffset = $derived(new Date(`${activeMonth} 1, ${activeYear}`).getDay());

	let daysInActiveMonthYear = $derived(getDaysInMonth(activeYear, activeMonthNumeric));
	let days = $derived(Array.from({ length: daysInActiveMonthYear }, (_, i) => i + 1));

	$effect(() => {
		console.log(dayOffset);
		console.log(daysInActiveMonthYear);
	});
</script>

<div class="w-full">
	<div class="flex w-full items-center justify-center gap-2.5 p-2.5">
		<select bind:value={activeMonth} class="select-button">
			{#each MONTHS as month}
				<option value={month}>{month} </option>
			{/each}
		</select>
		<select bind:value={activeYear} class="select-button">
			{#each YEARS as year}
				<option value={year}>{year}</option>
			{/each}
		</select>
	</div>
	<div class="grid grid-cols-7">
		{#each WEEK_DAYS as day}
			<div class="w-full p-1 text-center text-xs">
				<span class="uppercase sm:hidden">{day.slice(0, 3)}</span>
				<span class="max-sm:hidden">{day}</span>
			</div>
		{/each}
		{#each Array.from({ length: dayOffset }) as offsetDay}
			<div class="aspect-square w-full border bg-muted p-1 text-center">
				{offsetDay}
			</div>
		{/each}
		{#each days as day}
			<div class="aspect-square w-full border p-1 text-center">
				{day}
			</div>
		{/each}
		{#each Array.from({ length: daysInActiveMonthYear }) as offsetDay}
			<div class="aspect-square w-full border bg-muted p-1 text-center">
				{offsetDay}
			</div>
		{/each}
	</div>
</div>
