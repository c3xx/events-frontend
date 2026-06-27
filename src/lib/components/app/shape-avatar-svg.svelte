<script lang="ts">
	import { Style, Avatar } from '@dicebear/core';
	import shapeGrid from '@dicebear/styles/shape-grid.json' with { type: 'json' };

	const style = new Style(shapeGrid);

	let { seed, size = 35 }: { seed: string; size?: number } = $props();

	const avatar = $derived(
		new Avatar(style, {
			seed,
			size: size
		}).toDataUri()
	);
</script>

<img src={avatar} alt="Avatar" />
