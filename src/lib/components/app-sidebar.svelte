<script lang="ts">
	import {
		BuildingIcon,
		CalendarIcon,
		CircleCheck,
		CirclePileIcon,
		Home,
		LogOut,
		MonitorCogIcon,
		NetworkIcon,
		UsersIcon
	} from '@lucide/svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { authInfo } from '$lib/global/auth.svelte';
	import { page } from '$app/state';
	import { logout } from '$lib/api/auth';
	import { canAccessRoute } from '$lib/helpers';

	let activeUrl = $derived(page.url.pathname.split('/')[1]);
	// Menu items.
	let items = $derived.by(() => {
		const user = authInfo.get();
		if (user === null) return [];
		return user.type === 'admin'
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
					{
						title: 'Home',
						url: '/',
						icon: Home
					},
					{
						title: 'Approvals',
						url: '/approvals',
						icon: CircleCheck
					},
					...(canAccessRoute('/users')
						? [
								{
									title: 'Users',
									url: '/users',
									icon: UsersIcon
								}
							]
						: []),
					...(canAccessRoute('/events')
						? [
								{
									title: 'Events',
									url: '/events',
									icon: CalendarIcon
								}
							]
						: []),
					...(canAccessRoute('/venues')
						? [
								{
									title: 'Venues',
									url: '/venues',
									icon: BuildingIcon
								}
							]
						: []),
					...(canAccessRoute('/organizations')
						? [
								{
									title: 'Organizations',
									url: '/organizations',
									icon: CirclePileIcon
								}
							]
						: [])
				];
	});

	const sidebar = Sidebar.useSidebar();
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={item.url.split('/')[1] == activeUrl}>
								<a
									href={item.url}
									onclick={() => {
										if (sidebar.isMobile) {
											sidebar.toggle();
										}
									}}
									class="flex w-full items-center gap-x-xxs"
								>
									<item.icon size="15" />
									<p>{item.title}</p>
								</a>
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer>
		<Sidebar.MenuItem class="bg-red-100 max-sm:hidden">
			<Sidebar.MenuButton>
				<a
					href={'/login'}
					onclick={async () => {
						if (sidebar.isMobile) {
							sidebar.toggle();
						}
						await logout();
					}}
					class="flex w-full items-center gap-x-xxs text-red-600"
				>
					<LogOut size="15" />
					<p>Logout</p>
				</a>
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>
	</Sidebar.Footer>
</Sidebar.Root>
