<script lang="ts">
	import { page } from '$app/state';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import type { LoadedData, EntityMember, Role, TableProps, Venue } from '$lib/types';
	import Button from '$lib/components/ui/button/button.svelte';
	import DataTable from '$lib/components/app/data-table.svelte';
	import { getVenueById, loadVenueMembers } from '$lib/api/venue';
	import { loadRolesVenueType } from '$lib/api/venues';
	import AddMember from './add-member.svelte';
	import { permissionGrantedSomewhere } from '$lib/helpers';

	let addSheetOpen = $state(false);

	let title = $state('Loading...');

	let venue = $state<LoadedData<Venue>>({
		state: 'pending',
		message: 'Loading venue details...'
	});

	let venueMembers = $state<LoadedData<EntityMember[]>>({
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
			id: 1,
			name: 'Edit Role(s)',
			onclick: (row) => {
				selectedMember = row;
				addSheetOpen = true;
			}
		}
	];

	let selectedMember: null | EntityMember = $state(null);
	let venueId = $derived(Number(page.params.id));

	$effect(() => {
		(async () => {
			try {
				venue = {
					state: 'success',
					data: await getVenueById(venueId)
				};
				title = venue.data.name;
				console.log(venue.data);
			} catch (err) {
				venue = {
					state: 'failed',
					message: 'Failed to load venue details'
				};
			}
			try {
				venueMembers = {
					state: 'success',
					data: await loadVenueMembers(venueId)
				};
				console.log(venueMembers.data);
			} catch (err) {
				venueMembers = {
					state: 'failed',
					message: 'Failed to load members'
				};
			}
			try {
				if (venue.state === 'success') {
					roles = {
						state: 'success',
						data: await loadRolesVenueType(venue.data.venueTypeId)
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

	let canAddMember = $derived(permissionGrantedSomewhere('venue:add_member'));
</script>

<div class="relative mx-auto flex max-w-prose">
	<div class="flex w-full flex-col gap-y-xs p-r-pad">
		<div class="flex items-center">
			<h2 class="text-lg">{title}</h2>
		</div>
		<Separator />
		{#if canAddMember}
			<div class="flex w-full justify-end gap-x-xxs">
				<Button variant="default" onclick={() => (addSheetOpen = true)}>Manage Members</Button>
			</div>
		{/if}

		<Separator />
		<div class="overflow-auto">
			{#if venueMembers.state === 'pending'}
				{console.log('waiting...')}
				<p>{venueMembers.message}</p>
			{:else if venueMembers.state === 'success'}
				{console.log('hi: ', venueMembers.data)}
				<DataTable {columns} data={venueMembers.data} {optionsList} />
			{:else}
				<p>{venueMembers.message}</p>
			{/if}
		</div>
	</div>
</div>

{#if venueMembers.state === 'success' && roles.state === 'success'}
	<AddMember
		bind:member={selectedMember}
		id={venueId}
		roles={roles.data}
		bind:open={addSheetOpen}
	/>
{/if}
