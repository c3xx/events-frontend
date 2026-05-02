<script lang="ts">
	import { page } from '$app/state';
	import DataTable from '$lib/components/data-table/data-table.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { onMount } from 'svelte';
	import { columns } from './column';
	import type { LoadedData, OrganizationMember, User } from '$lib/types';
	import { loadUsers } from '$lib/api/users';
	import Button from '$lib/components/ui/button/button.svelte';
	import { CheckIcon, PlusIcon } from '@lucide/svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Combobox from '$lib/components/app/combobox.svelte';
	import { addMemberToOrganization, loadOrganizationMembers } from '$lib/api/organizations';

	let title = $state('');
	let isAdding = $state(false);
	let selectedUserId = $state('');

	let orgMembers = $state<LoadedData<OrganizationMember[]>>({
		state: 'pending',
		message: 'Loading members...'
	});

	let allUsers = $state<LoadedData<User[]>>({
		state: 'pending',
		message: 'Loading users...'
	});

	$effect(() => {
		title = page.params.id!;
		title = 'TKMCE';

		(async () => {
			try {
				orgMembers = {
					state: 'success',
					data: await loadOrganizationMembers(page.params.id!)
				};
			} catch (err) {
				orgMembers = {
					state: 'failed',
					message: 'Failed to load members'
				};
			}

			try {
				allUsers = {
					state: 'success',
					data: await loadUsers()
				};
			} catch (err) {
				allUsers = {
					state: 'failed',
					message: 'Failed to load users'
				};
			}
		})();
	});
	async function handleAddMember() {
	if (!selectedUserId) return;

	try {
		await addMemberToOrganization(page.params.id!, {
			userId: Number(selectedUserId),
			roleId: 2
		});

		isAdding = false;
		selectedUserId = '';

		orgMembers = {
			state: 'success',
			data: await loadOrganizationMembers(page.params.id!)
		};
	} catch (err) {
		console.error(err);
	}
}

</script>

<div class="relative flex">
	<div class="flex w-full max-w-200 flex-col gap-y-xs p-r-pad">
		<div class="flex items-center">
			<h2 class="text-lg">{title}</h2>
			<Badge class="text-xs" variant="secondary">Institution</Badge>
		</div>
		<Separator />
		<div class="flex w-full gap-x-xxs">
			{#if isAdding}
				<div class="w-full">
					<Combobox 
						bind:value={selectedUserId}
						placeholder="Select an email..." 
						emptyMsg="No emails found" 
						listItems={allUsers.state === 'success' ? allUsers.data.map(u => ({ value: u.id.toString(), label: u.email })) : []} 
					/>
				</div>
				<Button variant="outline" onclick={handleAddMember}>
					<CheckIcon />
				</Button>
				<Button variant="outline" onclick={() => isAdding = false}>Cancel</Button>
			{:else}
				<Button variant="default" onclick={() => isAdding = true}><PlusIcon /> Add Member</Button>
			{/if}
		</div>

		<Separator />
		<div class="overflow-auto p-r-pad">
			{#if orgMembers.state === 'pending'}
				<p>{orgMembers.message}</p>
			{:else if orgMembers.state === 'success'}
				<DataTable {columns} data={orgMembers.data} />
			{:else}
				<p>{orgMembers.message}</p>
			{/if}
		</div>
	</div>
</div>
