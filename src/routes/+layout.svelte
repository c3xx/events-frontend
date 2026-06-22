<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from 'svelte-sonner';
	import { authUser } from '$lib/api/auth';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { canAccessRoute, permissionGrantedSomewhere } from '$lib/helpers';
	import { Loader } from '@lucide/svelte';
	import CenterLoader from '$lib/components/app/center-loader.svelte';

	let { children } = $props();

	let status: 'authenticated' | 'pending' | 'forbidden' = $state('pending');
	let authLoaded = $state(false);

	onMount(async () => {
		try {
			await authUser();
			authLoaded = true;
		} catch (err) {
			console.error(err);
			status = 'forbidden';
		}
	});

	$effect(() => {
		status = 'pending';
		if (!authLoaded) return;
		const pathname = page.url.pathname;
		if (pathname === '/events/new' && !permissionGrantedSomewhere('event:manage')) {
			status = 'forbidden';
			return;
		}
		const route = '/' + page.url.pathname.split('/')[1];
		if (!canAccessRoute(route)) {
			status = 'forbidden';
			return;
		}
		status = 'authenticated';
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<Toaster />

{#if status === 'pending'}
	<CenterLoader state={status} message="Authenticating..." />
{:else if status === 'authenticated'}
	{@render children()}
{:else}
	<div class="flex h-screen w-screen items-center justify-center">
		<p>Forbidden. Contact Admin</p>
	</div>
{/if}
