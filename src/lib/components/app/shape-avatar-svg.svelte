<script lang="ts">
	import { Style, Avatar } from '@dicebear/core';
	import shapeGrid from '@dicebear/styles/shape-grid.json' with { type: 'json' };
	import thumbs from '@dicebear/styles/thumbs.json' with { type: 'json' };

	let {
		seed,
		size = 35,
		styleName = 'shape'
	}: { seed: string; size?: number; styleName?: 'shape' | 'thumb' } = $props();

	const style = $derived(new Style(styleName === 'shape' ? shapeGrid : thumbs));

	const avatar = $derived(
		new Avatar(style, {
			seed,
			size: size,
			borderRadius: styleName === 'shape' ? 0 : 50
		}).toDataUri()
	);
</script>

<img src={avatar} alt="Avatar" />
