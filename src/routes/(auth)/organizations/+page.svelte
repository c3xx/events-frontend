<script lang="ts">
	import { PlusIcon } from '@lucide/svelte';
	import type { LoadedData, Organization, OrganizationType, TableProps } from '$lib/types';
	import { onMount } from 'svelte';
	import { loadOrgs, loadOrgTypes } from '$lib/api/organizations';
	import DataTable from '$lib/components/app/data-table.svelte';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import AddOrganization from './add-organization.svelte';
	import { addOrganizationState } from '$lib/global/organization.svelte';

	let orgTypes = $state<LoadedData<OrganizationType[]>>({
		state: 'pending',
		message: 'Loading organizations types...'
	});

	let fetchedOrgs = $state<LoadedData<Organization[]>>({
		state: 'pending',
		message: 'Loading organizations'
	});

	let columns: TableProps<Organization>['columns'] = [
		{
			key: 'name',
			header: 'Name',
			type: 'link',
			href: 'organizations/'
		},
		{
			key: 'organizationTypeId',
			header: 'Type',
			type: 'transformValue',
			transformValue: (org) => {
				if (orgTypes.state === 'pending') {
					return 'Loading';
				} else if (orgTypes.state === 'success') {
					return orgTypes.data.find((type) => type.id === org.organizationTypeId)?.name ?? 'NIL';
				}
				return 'undefined';
			}
		},
		{
			key: 'parentOrganizationId',
			header: 'Parent Organization',
			type: 'transformValue',
			transformValue: (org) => {
				if (fetchedOrgs.state === 'pending') {
					return 'Loading';
				} else if (fetchedOrgs.state === 'success') {
					return fetchedOrgs.data.find((o) => o.id === org.parentOrganizationId)?.name ?? 'NIL';
				}
				return 'undefined';
			}
		}
	];

	let optionsList: TableProps<Organization>['optionsList'] = [
		{
			id: '1',
			name: 'View Details',
			onclick: (org) => {
				goto(`/organizations/${org.id}`);
			}
		}
	];

	onMount(async () => {
		try {
			fetchedOrgs = {
				state: 'success',
				data: await loadOrgs()
			};
			console.log(fetchedOrgs.data);
			try {
				orgTypes = {
					state: 'success',
					data: await loadOrgTypes()
				};
				console.log(orgTypes.data);
			} catch (error) {
				orgTypes = {
					state: 'failed',
					message: 'Failed to load organization types'
				};
			}
		} catch (error) {
			fetchedOrgs = {
				state: 'failed',
				message: 'Failed to load organizations'
			};
		}
	});
</script>

<div class="flex w-full flex-col">
	<div class="border-muted-background flex w-full justify-end border-b p-xxs">
		<Button
			onclick={() => {
				addOrganizationState.sheetOpen = true;
			}}
			variant="default">Add Organization <PlusIcon /></Button
		>
	</div>
	<div class="p-xxs">
		{#if fetchedOrgs.state === 'pending'}
			<p>Loading organizations</p>
		{:else if fetchedOrgs.state === 'success'}
			<DataTable data={fetchedOrgs.data} {columns} selectable={true} {optionsList} />
		{:else}
			<p>Failed to load organizations</p>
		{/if}
	</div>
</div>

<AddOrganization />
