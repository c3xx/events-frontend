<script lang="ts" generics="T extends any[]">
	import { cn } from 'tailwind-variants';
	let {
		name,
		class: className,
		value = $bindable(),
		itemsList,
		optionValue,
		optionName,
		transformName,
		...restProps
	}: {
		name: string;
		class?: string;
		value: number | string | null;
		itemsList: T;
		optionValue?: keyof T[0] | null;
		optionName?: keyof T[0] | null;
		transformName?: (name: string) => string;
	} = $props();
</script>

<select {name} bind:value {...restProps} class={cn('select-button', className)}>
	{#if itemsList.length === 0}
		<option disabled={true}>Empty</option>
	{/if}
	{#each itemsList as item}
		<option value={optionValue ? item[optionValue] : item}
			>{optionName
				? transformName
					? transformName(item[optionName])
					: item[optionName]
				: transformName
					? transformName(item)
					: item}</option
		>
	{/each}
</select>
