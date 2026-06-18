<script lang="ts">
	import { page } from '$app/state';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import type { LoadedData, Organization, EntityMember, Role, TableProps, User } from '$lib/types';
	import Button from '$lib/components/ui/button/button.svelte';
	import { getOrgById, loadOrganizationMembers, loadRolesOrgType } from '$lib/api/organizations';
	import DataTable from '$lib/components/app/data-table.svelte';
	import AddMember from './add-member.svelte';

	let addSheetOpen = $state(false);

	let title = $state('Loading...');

	let org = $state<LoadedData<Organization>>({
		state: 'pending',
		message: 'Loading organization details...'
	});

	let orgMembers = $state<LoadedData<EntityMember[]>>({
		state: 'pending',
		message: 'Loading members...'
	});

	let roles = $state<LoadedData<Role[]>>({
		state: 'pending',
		message: 'Loading roles...'
	});

	let columns: TableProps<EntityMember>['columns'] = [
		{
			key: 'fullName',
			header: 'Name',
			type: 'button',
			onclick: (row) => {
				selectedMember = row;
				addSheetOpen = true;
			}
		},
		{
			key: 'email',
			header: 'Email',
			type: 'text'
		},
		{
			key: 'roles',
			header: 'Role(s)',
			type: 'transformValue',
			transformValue: (member) => {
				if (roles.state === 'pending') {
					return 'Loading';
				} else if (roles.state === 'success') {
					return member.roles.reduce((acc: string, role, i) => {
						if (roles.state === 'success') {
							const name = roles.data.find((_role) => _role.id === role.roleId)?.name ?? '';
							return acc ? acc + ', ' + name : acc + name;
						}
						return acc;
					}, '');
				}
				return 'undefined';
			}
		}
	];

	const optionsList: TableProps<EntityMember>['optionsList'] = [
		{
			id: '1',
			name: 'Edit Role(s)',
			onclick: (row) => {
				selectedMember = row;
				addSheetOpen = true;
			}
		}
	];

	let selectedMember: null | EntityMember = $state(null);

	$effect(() => {
		(async () => {
			try {
				org = {
					state: 'success',
					data: await getOrgById(page.params.id!)
				};
				title = org.data.name;
				console.log(org.data);
			} catch (err) {
				org = {
					state: 'failed',
					message: 'Failed to organization details'
				};
			}
			try {
				orgMembers = {
					state: 'success',
					data: await loadOrganizationMembers(page.params.id!)
				};
				console.log(orgMembers.data);
			} catch (err) {
				orgMembers = {
					state: 'failed',
					message: 'Failed to load members'
				};
			}
			try {
				if (org.state === 'success') {
					roles = {
						state: 'success',
						data: await loadRolesOrgType(org.data.organizationTypeId)
					};
					console.log(roles.data);
				}
			} catch (err) {
				roles = {
					state: 'failed',
					message: 'Failed to load roles'
				};
			}
		})();
	});
</script>

<div class="relative flex max-w-200">
	<div class="flex w-full flex-col gap-y-xs p-r-pad">
		<div class="flex items-center">
			<h2 class="text-lg">{title}</h2>
		</div>
		<Separator />
		<div class="flex w-full justify-end gap-x-xxs">
			<Button variant="default" onclick={() => (addSheetOpen = true)}>Manage Members</Button>
		</div>

		<Separator />
		<div class="overflow-auto">
			{#if orgMembers.state === 'pending'}
				{console.log('waiting...')}
				<p>{orgMembers.message}</p>
			{:else if orgMembers.state === 'success'}
				{console.log('hi: ', orgMembers.data)}
				<DataTable {columns} data={orgMembers.data} {optionsList} />
			{:else}
				<p>{orgMembers.message}</p>
			{/if}
		</div>
	</div>
</div>

{#if orgMembers.state === 'success' && roles.state === 'success'}
	<AddMember
		bind:member={selectedMember}
		id={page.params.id!}
		roles={roles.data}
		bind:open={addSheetOpen}
	/>
{/if}
