<script lang="ts">
	import { page } from '$app/state';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { ChevronRight } from '@lucide/svelte';
	import { nav } from './header.svelte';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';

	let { children } = $props();

	const isMobile = new IsMobile();
</script>

<Sidebar.Provider class="flex h-screen w-screen">
	<AppSidebar />
	<Sidebar.Inset class="flex-1">
		<main class="h-screen min-w-0 overflow-y-auto">
			<header
				class="sticky top-0 z-50 flex h-12 w-full items-center gap-2 border-b bg-background/50 px-3 backdrop-blur-lg"
			>
				<Sidebar.Trigger />

				<div class="flex place-items-center gap-1 text-sm font-medium text-muted-foreground">
					{#if !isMobile.current}
						{#each nav.value.slice(0, -1) as crumb}
							<a href={crumb.url}>{crumb.title}</a>
							<ChevronRight size="16" />
						{/each}
					{/if}

					<div class="text-foreground">
						{nav.value[nav.value.length - 1].title}
					</div>
				</div>
				<!-- <div>{page.data.title ?? 'Events'}</div> -->
			</header>
			{@render children?.()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
