<script lang="ts">
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	let { children } = $props();
</script>

<Sidebar.Provider class="flex h-screen w-screen">
	<AppSidebar />
	<Sidebar.Inset class="flex-1">
		<main class="h-screen min-w-0 overflow-y-auto">
			<div
				class="sticky top-0 z-50 flex h-12 w-full items-center gap-2 border-b bg-background/50 px-3 backdrop-blur-lg"
			>
				<Sidebar.Trigger />
				<div>Events</div>
			</div>
			{@render children?.()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
