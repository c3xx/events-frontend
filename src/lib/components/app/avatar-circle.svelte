<script lang="ts">
	import { stringToColor } from '$lib/helpers';

	let { text, size = 40 }: { text: string; size?: number } = $props();

	let colors = $derived(stringToColor(text));

	let fontSize = $derived(Math.max(size * 0.55, 10));
</script>

<div
	style:height={`${size}px`}
	style:width={`${size}px`}
	style:background-color={colors.bg}
	style:color={colors.fg}
	class="flex items-center justify-center rounded-full"
>
	<p style:font-size={`${fontSize}px`} class="leading-none font-bold">
		{text[0]?.toUpperCase()}
	</p>
</div>
