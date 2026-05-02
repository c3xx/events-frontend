<script lang="ts" generics="T extends {id: string}">
	import type { TableProps } from '$lib/types';
	import DataTableActions from './data-table-actions.svelte';

	let {
		columns,
		data,
		selectable = false,
		onSelectionChange,
		optionsList
	}: TableProps<T> = $props();

	type RowWithSelection<T> = T & { rowSelected: boolean };

	let internalData = $state<RowWithSelection<T>[]>(
		data.map((row) => ({ ...row, rowSelected: false }))
	);

	function toggleAll(checked: boolean) {
		internalData = internalData.map((row) => ({ ...row, rowSelected: checked }));
	}

	function toggleRow(id: string, checked: boolean) {
		internalData = internalData.map((row) =>
			row.id === id ? { ...row, rowSelected: checked } : row
		);
	}

	let selectedRows = $derived(internalData.filter((data) => data.rowSelected === true));

	$effect(() => {
		onSelectionChange?.(selectedRows);
	});

	const allSelected = $derived(
		selectedRows.length === internalData.length && selectedRows.length > 0
	);
	const someSelected = $derived(
		selectedRows.length < internalData.length && selectedRows.length > 0
	);
</script>

<div class="overflow-x-auto border bg-background bg-clip-border">
	<div class="relative w-full">
		<table class="w-full text-sm">
			<thead class="border-b bg-sidebar-accent">
				<tr class="">
					{#if selectable}
						<th class="px-xs py-xxs text-start">
							<input
								type="checkbox"
								checked={allSelected}
								indeterminate={someSelected}
								onchange={(e) => toggleAll(e.currentTarget.checked)}
							/>
						</th>
					{/if}
					{#each columns as column (column.key)}
						<th class="px-xs py-xxs text-start font-normal">
							{column.header ?? ''}
						</th>
					{/each}
					{#if optionsList && optionsList?.length > 0}
						<th class="px-xs py-xxs"></th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each internalData as row, i (i)}
					<tr class="border-b last:border-0">
						{#if selectable}
							<td class="px-xs py-xxs">
								<input
									type="checkbox"
									checked={row.rowSelected}
									onchange={(e) => toggleRow(row.id, e.currentTarget.checked)}
								/>
							</td>
						{/if}
						{#each columns as col (col.key)}
							{#if col.type === 'link'}
								<td class="px-xs py-xxs">
									<a href={col.href ? `${col.href}${row.id ?? ''}` : '#'}>{row[col.key] ?? '-'}</a>
								</td>
							{:else}
								<td class="px-xs py-xxs">
									{row[col.key] ?? '-'}
								</td>
							{/if}
						{/each}
						{#if optionsList && optionsList.length > 0}
							<td class="px-xs py-xxs text-end"
								><DataTableActions selectedItem={row} actions={optionsList} /></td
							>
						{/if}
					</tr>
				{/each}
				{#if data.length === 0}
					<tr>
						<td
							colspan={columns.length + (selectable ? 1 : 0)}
							class="py-lg px-xs text-center text-muted-foreground"
						>
							No results.
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
