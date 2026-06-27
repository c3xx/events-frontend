<script lang="ts">
	let container: HTMLDivElement;
	type TabType = 'overview' | 'organizers' | 'venues' | 'workflows';

	function scrollToSection(section: TabType) {
		activeTab = section;
		const width = container.clientWidth / 2;
		const map: Record<TabType, number> = {
			overview: 0,
			organizers: 1,
			venues: 2,
			workflows: 3
		};

		container.scrollTo({
			left: map[section] * width,
			behavior: 'smooth'
		});
	}

	let { activeTab = $bindable() }: { activeTab: TabType } = $props();

	$effect(() => {
		if (activeTab) {
			scrollToSection(activeTab);
		}
	});
</script>

<div
	bind:this={container}
	class="sticky bottom-0 flex h-12 w-screen snap-x snap-mandatory overflow-x-auto
	       scroll-smooth border-t border-foreground bg-background shadow-xs"
>
	<div class="w-[25vw] flex-none snap-center"></div>

	<button
		onclick={() => {
			scrollToSection('overview');
		}}
		class="w-[50vw] flex-none snap-center">Overview</button
	>
	<button
		onclick={() => {
			scrollToSection('organizers');
		}}
		class="w-[50vw] flex-none snap-center">Organizers</button
	>
	<button
		onclick={() => {
			scrollToSection('venues');
		}}
		class="w-[50vw] flex-none snap-center">Venues</button
	>
	<button
		onclick={() => {
			scrollToSection('workflows');
		}}
		class="w-[50vw] flex-none snap-center">Workflows</button
	>
	<div class="w-[25vw] flex-none snap-center"></div>
</div>
