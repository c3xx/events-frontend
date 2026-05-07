<script lang="ts">
	import { loadMatchResults } from '$lib/api/users';
	import { Check, ChevronDown, X } from '@lucide/svelte';

	type Item = {
		id: string;
		text: string;
		disabled?: boolean;
	};

	type Props = {
		value?: string;
		selectedId?: string;
		placeholder?: string;
		disabled?: boolean;
		allowCustomValue?: boolean;
		onSelect?: (item: Item) => void;
		onClear?: () => void;
	};

	let {
		value = $bindable(''),
		selectedId = $bindable(undefined),
		placeholder = 'Search...',
		disabled = false,
		allowCustomValue = false,
		onSelect,
		onClear
	}: Props = $props();

	let open = $state(false);
	let highlightedIndex = $state(-1);
	let inputEl = $state<HTMLInputElement | null>(null);
	let listEl = $state<HTMLUListElement | null>(null);
	let containerEl = $state<HTMLDivElement | null>(null);
	let selectedItem = $state<Item | undefined>(undefined);
	let valueBeforeOpen = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	let items: Item[] = $state([]);

	function selectItem(item: Item) {
		if (item.disabled) return;
		selectedItem = item;
		selectedId = item.id;
		value = item.text;
		open = false;
		highlightedIndex = -1;
		onSelect?.(item);
	}

	function clear() {
		selectedItem = undefined;
		selectedId = undefined;
		value = '';
		open = false;
		highlightedIndex = -1;
		onClear?.();
		inputEl?.focus();
	}

	function change(dir: 1 | -1) {
		if (items.length === 0) return;
		let index = highlightedIndex + dir;
		if (index < 0) index = items.length - 1;
		else if (index >= items.length) index = 0;

		let attempts = 0;
		while (items[index].disabled && attempts < items.length) {
			index += dir;
			if (index < 0) index = items.length - 1;
			else if (index >= items.length) index = 0;
			attempts++;
		}
		if (!items[index].disabled) highlightedIndex = index;
	}

	function onKeyDown(e: KeyboardEvent) {
		if (disabled) return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			open = true;
			change(1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			open = true;
			change(-1);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (highlightedIndex >= 0 && items[highlightedIndex]) {
				selectItem(items[highlightedIndex]);
			}
		} else if (e.key === 'Escape') {
			open = false;
			highlightedIndex = -1;
		} else if (e.key === 'Tab') {
			open = false;
		}
	}

	function onInput() {
		open = true;
		highlightedIndex = -1;
		if (!value.length) {
			selectedItem = undefined;
			selectedId = undefined;
		}
	}

	function onBlur(e: FocusEvent) {
		const related = e.relatedTarget as Node | null;
		if (containerEl?.contains(related)) return;
		open = false;
		if (selectedItem) {
			value = selectedItem.text;
		} else if (!allowCustomValue) {
			value = '';
		}
		highlightedIndex = -1;
	}

	// scroll highlighted item into view
	$effect(() => {
		if (highlightedIndex >= 0 && listEl) {
			const el = listEl.children[highlightedIndex] as HTMLElement;
			el?.scrollIntoView({ block: 'nearest' });
		}
	});

	$effect(() => {
		if (value.trim().length === 0) return;
		clearTimeout(searchTimeout);

		searchTimeout = setTimeout(async () => {
			items = (await loadMatchResults(value)).map<Item>((item) => ({
				id: item.id,
				text: item.email
			}));
		}, 500);
	});
</script>

<div bind:this={containerEl} class="relative w-full">
	<!-- Input -->
	<div class="relative flex items-center">
		<input
			bind:this={inputEl}
			bind:value
			type="text"
			role="combobox"
			aria-expanded={open}
			aria-autocomplete="list"
			autocomplete="off"
			{placeholder}
			{disabled}
			oninput={onInput}
			onfocus={() => (open = true)}
			onblur={onBlur}
			onkeydown={onKeyDown}
			class="w-full border bg-background px-xs py-xs pr-xs text-sm outline-none
                   placeholder:text-muted-foreground focus:ring-1 focus:ring-ring
                   disabled:cursor-not-allowed disabled:opacity-50"
		/>
		<div class="absolute right-0 flex items-center pr-1">
			<!-- Clear button -->
			{#if value}
				<button
					type="button"
					tabindex="-1"
					onmousedown={(e) => {
						e.preventDefault();
						clear();
					}}
					class="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground"
					aria-label="Clear"
				>
					<X size="15" />
				</button>
			{/if}
			<!-- Chevron -->
			<button
				type="button"
				tabindex="-1"
				{disabled}
				onmousedown={(e) => {
					e.preventDefault();
					if (!disabled) open = !open;
					inputEl?.focus();
				}}
				class="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-50"
				aria-label={open ? 'Close menu' : 'Open menu'}
			>
				<ChevronDown size="15" />
			</button>
		</div>
	</div>

	<!-- Dropdown -->
	{#if open && value.trim().length !== 0}
		<ul
			bind:this={listEl}
			role="listbox"
			class="absolute z-50 mt-0 max-h-60 w-full overflow-y-auto border border-input bg-background py-1"
		>
			{#each items as item, i (item.id)}
				<li
					role="option"
					aria-selected={selectedId === item.id}
					aria-disabled={item.disabled}
					onmousedown={(e) => {
						e.preventDefault();
						selectItem(item);
					}}
					onmouseenter={() => {
						if (!item.disabled) highlightedIndex = i;
					}}
					class="flex cursor-pointer items-center justify-between px-3 py-2 text-sm
                           {item.disabled ? 'cursor-not-allowed opacity-40' : ''}
                           {highlightedIndex === i ? 'bg-accent text-accent-foreground' : ''}
                           {selectedId === item.id && highlightedIndex !== i ? 'bg-muted' : ''}"
				>
					{item.text}
					{#if selectedId === item.id}
						<Check size="15" />
					{/if}
				</li>
			{:else}
				<li class="px-3 py-2 text-sm text-muted-foreground">No results.</li>
			{/each}
		</ul>
	{/if}
</div>
