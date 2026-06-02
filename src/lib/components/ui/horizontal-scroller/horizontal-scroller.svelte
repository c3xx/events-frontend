<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { onMount, afterUpdate, tick } from 'svelte';

	let container: HTMLDivElement;

	export let title = '';
	export let gap = 16;

	let canScrollLeft = false;
	let canScrollRight = false;

	function updateScrollState() {
		if (!container) return;

		const { scrollLeft, scrollWidth, clientWidth } = container;

		canScrollLeft = scrollLeft > 5;
		canScrollRight = scrollLeft + clientWidth < scrollWidth - 5;
	}

	function scrollLeftFn() {
		container.scrollBy({ left: -320, behavior: 'smooth' });
	}

	function scrollRightFn() {
		container.scrollBy({ left: 320, behavior: 'smooth' });
	}

	let observer: ResizeObserver;

	onMount(() => {
		(async () => {
			await tick();
			updateScrollState();
		})();

		observer = new ResizeObserver(() => {
			updateScrollState();
		});

		if (container) observer.observe(container);

		return () => observer?.disconnect();
	});

	afterUpdate(() => {
		updateScrollState();
	});
</script>

<!-- WRAPPER -->
<div class="relative w-full space-y-2">
	<!-- Title -->
	<h2 class="px-1 text-sm font-semibold text-muted-foreground">
		{title}
	</h2>

	<!-- LEFT BUTTON -->
	<button
		onclick={scrollLeftFn}
		class="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-white/90 p-2 shadow transition hover:bg-white"
		class:hidden={!canScrollLeft}
	>
		<ChevronLeft class="h-5 w-5" />
	</button>

	<!-- RIGHT BUTTON -->
	<button
		onclick={scrollRightFn}
		class="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-white/90 p-2 shadow transition hover:bg-white"
		class:hidden={!canScrollRight}
	>
		<ChevronRight class="h-5 w-5" />
	</button>

	<!-- SCROLL AREA -->
	<div
		bind:this={container}
		onscroll={updateScrollState}
		class="flex overflow-x-auto scroll-smooth px-1 py-3 scrollbar-hide items-start"
		style="gap: {gap}px;"
	>
		<slot />
	</div>
</div>