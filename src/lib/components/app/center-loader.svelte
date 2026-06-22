<script lang="ts">
	import type { LoadedData } from '$lib/types';
	import { Loader } from '@lucide/svelte';

	let { message, state }: { message: string; state: LoadedData<string>['state'] } = $props();
</script>

<div class="flex h-screen w-screen items-center justify-center gap-x-xxs">
	<p class={`${state === 'pending' ? 'animate-pulse' : ''}`}>{message}</p>
	{#if state === 'pending'}
		<Loader size="15" class="animate-spin" />
	{/if}
</div>
