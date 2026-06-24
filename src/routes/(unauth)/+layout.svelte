<script lang="ts">
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div class="flex h-screen w-screen justify-center p-r-pad">
	<div class="flex h-full w-full flex-col overflow-auto md:w-lg md:border md:p-r-pad">
		<div class="my-auto flex flex-col space-y-6">
			{@render children()}
		</div>
	</div>
</div>
