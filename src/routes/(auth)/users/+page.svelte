<script lang="ts">
	import { PlusIcon } from '@lucide/svelte';
	import type { LoadedData, Organization, Role, TableProps, User } from '$lib/types';
	import { loadUsers } from '$lib/api/users.js';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import AddUser from './add-user.svelte';
	import DataTable from '$lib/components/app/data-table.svelte';
	import { loadOrgs } from '$lib/api/organizations';
	import { permissionGrantedSomewhere } from '$lib/helpers';

	let users = $state<LoadedData<User[]>>({
		state: 'pending',
		message: 'Loading users...'
	});

	let organizations = $state<LoadedData<Organization[]>>({
		state: 'pending',
		message: 'Loading Organizations...'
	});

	function getUniqueOrgs(roles: User['roles']): Set<string> {
		if (roles) {
			return new Set(roles.map((roleEnt) => roleEnt.managedEntityId));
		}
		return new Set();
	}

	let columns: TableProps<User>['columns'] = [
		{ key: 'fullName', header: 'Name', type: 'text' },
		{ key: 'email', header: 'Email', type: 'text' },
		{ key: 'isActive', header: 'Status', type: 'text' }
	];

	let optionsList: TableProps<User>['optionsList'] = [
		{
			id: 1,
			name: 'Copy Email',
			onclick: (user) => {
				navigator.clipboard.writeText(user.email);
			}
		}
	];

	let sheetOpen = $state(false);

	onMount(async () => {
		try {
			users = {
				state: 'success',
				data: await loadUsers()
			};
			try {
				organizations = {
					state: 'success',
					data: await loadOrgs()
				};
			} catch (error) {
				organizations = {
					state: 'failed',
					message: 'Failed to load organizations'
				};
			}
		} catch (error) {
			users = {
				state: 'failed',
				message: 'Failed to load users'
			};
		}
	});

	let addUser = $derived(permissionGrantedSomewhere('user:create'));
</script>

<div class="flex w-full max-w-200 flex-col">
	<div class="border-muted-background flex w-full items-center justify-between border-b py-xs">
		<h1 class="px-2 text-xl">Users</h1>
	</div>
	{#if addUser}
		<div class="border-muted-background flex w-full justify-end border-b p-xxs">
			<Button
				onclick={() => {
					sheetOpen = true;
				}}>Add User <PlusIcon /></Button
			>
		</div>
	{/if}
	<div class="p-xxs">
		{#if users.state === 'pending'}
			<p>Loading users</p>
		{:else if users.state === 'success'}
			<DataTable data={users.data} {columns} selectable={true} expandable={true} {optionsList}>
				{#snippet expandedContent(user)}
					{@const userOrgs = getUniqueOrgs(user.roles)}
					<div class="flex flex-col gap-y-xs px-xs py-xxs">
						<p class="text-sm text-muted-foreground">User Roles</p>
						{#if organizations.state === 'success'}
							<div class="flex gap-x-xs">
								{#each user.roles as roleEnt}
									<div class="bg-accent p-xs">
										<p>{roleEnt.roleId}({roleEnt.managedEntityId})</p>
									</div>
								{/each}
								{#if userOrgs.size === 0}
									<p class="text-xs text-secondary">Nothing to show here</p>
								{/if}
							</div>
						{/if}
					</div>
				{/snippet}
			</DataTable>
		{:else}
			<p>Failed to load users</p>
		{/if}
	</div>
</div>

<AddUser bind:open={sheetOpen} />
