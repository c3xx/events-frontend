<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from 'svelte-sonner';
	import { authUser } from '$lib/api/auth';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { canAccessRoute, permissionGrantedSomewhere } from '$lib/helpers';

	let { children } = $props();

	let status: 'authenticated' | 'pending' | 'forbidden' = $state('pending');
	let authLoaded = $state(false);

	onMount(async () => {
		try {
			await authUser();
			authLoaded = true;
		} catch (err) {
			console.error(err);
		}
	});

	$effect(() => {
		if (!authLoaded) return;
		if (page.url.pathname === '/events/new' && !permissionGrantedSomewhere('event:manage')) {
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
	Authenticating...
{:else if status === 'authenticated'}
	{@render children()}
{:else}
	Forbidden. Contact Admin
{/if}
