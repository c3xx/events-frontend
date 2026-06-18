<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { onMount, type Snippet } from 'svelte';

	let container: HTMLDivElement;

	let canScrollLeft = $state(false);
	let canScrollRight = $state(false);

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
		observer = new ResizeObserver(() => {
			updateScrollState();
		});
		if (container) observer.observe(container);
		return () => observer?.disconnect();
	});

	let { children, title }: { children: Snippet<[]>; title: string } = $props();
</script>

<div class="relative flex w-full flex-col gap-y-xs sm:bg-muted/50 sm:p-sm">
	<h2 class="text-sm font-semibold uppercase">
		{title}
	</h2>
	<div class="relative w-full">
		<button
			onclick={scrollLeftFn}
			class={`${!canScrollLeft ? 'hidden' : ''} absolute left-0 z-10 my-0 h-full border border-muted-foreground bg-white/90 p-1 hover:border hover:bg-muted hover:text-foreground max-sm:hidden`}
		>
			<ChevronLeft class="h-5 w-5" />
		</button>
		<button
			onclick={scrollRightFn}
			class={`${!canScrollRight ? 'hidden' : ''} absolute right-0 z-10 my-0 h-full border border-muted-foreground bg-white/90 p-1 hover:border hover:bg-muted hover:text-foreground max-sm:hidden`}
		>
			<ChevronRight class="h-5 w-5" />
		</button>
		<div
			bind:this={container}
			onscroll={updateScrollState}
			class="no-scrollbar relative flex w-full items-start gap-x-xs overflow-x-auto scroll-smooth"
		>
			{@render children()}
		</div>
	</div>
</div>
