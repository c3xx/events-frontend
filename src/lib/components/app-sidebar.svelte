<script lang="ts">
	import {
		BuildingIcon,
		CalendarIcon,
		CirclePileIcon,
		MonitorCogIcon,
		NetworkIcon,
		UsersIcon
	} from '@lucide/svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { authInfo } from '$lib/global/auth.svelte';

	let activeTitle = $state('Users');
	// Menu items.
	let items = $derived.by(() =>
		authInfo.get()?.type === 'admin'
			? [
					{
						title: 'Users',
						url: '/users',
						icon: UsersIcon
					},
					{
						title: 'Venues',
						url: '/venues',
						icon: BuildingIcon
					},
					{
						title: 'Organizations',
						url: '/organizations',
						icon: CirclePileIcon
					},
					{
						title: 'Workflow Templates',
						url: '/workflow-templates',
						icon: NetworkIcon
					},
					{
						title: 'System',
						url: '/system',
						icon: MonitorCogIcon
					}
				]
			: [
					...(authInfo.get()?.type === 'admin'
						? [
								{
									title: 'Users',
									url: '/users',
									icon: UsersIcon
								}
							]
						: []),
					...(authInfo.get()?.type === 'end_user'
						? [
								{
									title: 'Events',
									url: '/events',
									icon: CalendarIcon
								}
							]
						: []),
					...(authInfo.get()?.type === 'admin'
						? [
								{
									title: 'Venues',
									url: '/venues',
									icon: BuildingIcon
								},
								{
									title: 'Organizations',
									url: '/organizations',
									icon: CirclePileIcon
								},
								{
									title: 'Workflow Templates',
									url: '/workflow-templates',
									icon: NetworkIcon
								},
								{
									title: 'System',
									url: '/system',
									icon: MonitorCogIcon
								}
							]
						: [])
				]
	);

	const sidebar = Sidebar.useSidebar();
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								onclick={() => {
									activeTitle = item.title;
									if (sidebar.isMobile) {
										sidebar.toggle();
									}
								}}
								isActive={activeTitle === item.title}
							>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
</Sidebar.Root>
