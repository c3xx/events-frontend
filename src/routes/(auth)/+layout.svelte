<script lang="ts">
	import { goto } from '$app/navigation';
	import { logout } from '$lib/api/auth';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { LogOut } from '@lucide/svelte';

	let { children } = $props();
</script>

<Sidebar.Provider class="flex w-screen">
	<AppSidebar />
	<main class="min-w-0 flex-1">
		<div
			class="border-muted-background sticky top-0 z-50 flex h-12 w-full items-center border-b bg-background p-xxxs"
		>
			<Sidebar.Trigger class="absolute left-xs z-50" />
			<h2 class="absolute inset-0 flex w-full items-center justify-center text-center">CHW</h2>
			<button
				onclick={async () => {
					await logout();
					await goto('/login');
				}}
				class="absolute right-xs z-50 p-xxs text-red-700 sm:hidden"><LogOut size="15" /></button
			>
		</div>
		{@render children?.()}
	</main>
</Sidebar.Provider>
