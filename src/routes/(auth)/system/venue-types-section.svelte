<script lang="ts">
	import { addVenueTypeRole } from '$lib/api/venue';
	import {
		addChildVenueType,
		addVenueType,
		loadChildrenVenueType,
		loadRolesVenueType,
		loadVenueTypes
	} from '$lib/api/venues';
	import RolePermissionSheet from '$lib/components/app/role-permission-sheet.svelte';
	import SelectButton from '$lib/components/app/select-button.svelte';
	import TabButton from '$lib/components/app/tab-button.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import type { ChildType, LoadedData, OrganizationType, RoleType, VenueType } from '$lib/types';
	import { PencilIcon, PlusIcon, TrashIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let venueTypes = $state<LoadedData<VenueType[]>>({
		state: 'pending',
		message: 'Loading venue types...'
	});
	let venueTypeChildren = $state<LoadedData<ChildType[]>>({
		state: 'pending',
		message: 'Loading children...'
	});
	let venueTypeRoles = $state<LoadedData<RoleType[]>>({
		state: 'pending',
		message: 'Loading roles...'
	});
	let newVenueTypeValue: string = $state('');
	let newRoleValue: string = $state('');
	let venueTypeActiveTab: 'Children' | 'Roles' = $state('Roles');
	let activeVenueType: OrganizationType | null = $state(null);
	let selectedRole: RoleType | null = $state(null);

	let roleSheetOpen = $state(false);

	async function onSave() {
		if (!newVenueTypeValue) return;
		const saveToastId = toast.loading('Saving new venue type...');
		try {
			const newType = await addVenueType(newVenueTypeValue);
			if (venueTypes.state === 'success') {
				venueTypes.data = [
					...venueTypes.data,
					{
						id: newType.id,
						name: newVenueTypeValue,
						children: [],
						selectedChildId: '',
						selectedRoleId: ''
					} //TODO: change selectedId type form string to ??(null)
				];
			}
			toast.success('Venue Type Saved', { id: saveToastId });
		} catch (err) {
			console.error(err);
			toast.error('Failed to save type', { id: saveToastId });
		} finally {
			newVenueTypeValue = '';
		}
	}

	async function onChildAdd(parentId: string, childId: string) {
		if (!parentId || !childId) return;
		const promise = addChildVenueType(parentId, childId);
		toast.promise(promise, {
			loading: 'Adding Child type...',
			success: (res) => {
				console.log('Added child');
				if (venueTypeChildren.state === 'success' && venueTypes.state === 'success') {
					venueTypeChildren.data = [
						...venueTypeChildren.data,
						{
							id: childId,
							name:
								venueTypes.data.find((item) => item.id === activeVenueType?.selectedChildId)
									?.name ?? ''
						}
					];
				}
				return 'Saved successfully';
			},
			error: (err) => {
				console.error(err);
				return 'Failed add type';
			},
			finally: () => {
				newVenueTypeValue = '';
			}
		});
	}

	async function onRoleSave() {
		if (!newRoleValue || !activeVenueType) return;
		const promise = addVenueTypeRole(activeVenueType?.id, newRoleValue);
		toast.promise(promise, {
			loading: 'Saving new role...',
			success: (newType) => {
				if (venueTypeRoles.state === 'success') {
					venueTypeRoles.data = [...venueTypeRoles.data, { id: newType.id, name: newRoleValue }];
				}
				return 'Role Saved';
			},
			error: (err) => {
				console.error(err);
				return 'Failed to save role';
			},
			finally: () => {
				newRoleValue = '';
			}
		});
	}

	async function setActiveTab(tab: 'Children' | 'Roles') {
		if (!activeVenueType) return;
		if (tab === 'Children') {
			venueTypeChildren = {
				state: 'pending',
				message: 'Loading Children...'
			};
			venueTypeChildren = {
				state: 'success',
				data: await loadChildrenVenueType(activeVenueType.id)
			};
		} else {
			venueTypeRoles = {
				state: 'pending',
				message: 'Loading Roles...'
			};
			venueTypeRoles = {
				state: 'success',
				data: await loadRolesVenueType(activeVenueType.id)
			};
		}
		venueTypeActiveTab = tab;
	}
	onMount(async () => {
		try {
			venueTypes = {
				state: 'success',
				data: await loadVenueTypes()
			};
		} catch (error) {
			venueTypes = {
				state: 'failed',
				message: 'Failed to load users'
			};
		}
	});
</script>

<div class="flex w-full max-w-200 flex-col gap-y-sm p-r-pad">
	<h2 class="text-lg">Venue Types</h2>
	<p class="text-sm text-muted-foreground">
		Manage children and roles associated with each venue type here. Select an item to manage its
		entities
	</p>
	<div class=" border border-muted-foreground bg-muted">
		{#if venueTypes.state === 'pending'}
			<p class="p-xs">{venueTypes.message}</p>
		{:else if venueTypes.state === 'success'}
			{#each venueTypes.data as org}
				<Button
					onclick={async () => {
						activeVenueType = org;
						setActiveTab(venueTypeActiveTab);
					}}
					class="w-full justify-start rounded-none border-b border-b-muted-foreground text-sm text-secondary-foreground"
					variant="link">{org.name}</Button
				>
			{/each}
			<div class="flex w-full items-center p-xxs max-sm:flex-col">
				<Input
					bind:value={newVenueTypeValue}
					onchange={(e) => {
						newVenueTypeValue = e.currentTarget.value;
					}}
					name="orgName"
					class="w-full max-w-100 rounded-none border-secondary-foreground"
					type="text"
				/>
				<Button onclick={onSave} variant="link"><PlusIcon /> Add</Button>
			</div>
		{:else}
			<p class="p-xs">Failed to Load: {venueTypes.message}</p>
		{/if}
	</div>
	{#if activeVenueType !== null}
		<div class="border border-muted-foreground bg-muted">
			<h3 class="text- p-xs font-medium">{activeVenueType?.name}</h3>
			<div class="flex gap-x-xxs">
				<!-- todo: check if venue-types have children -->
				<!-- <TabButton
					onclick={setActiveTab}
					title="Children"
					isActive={venueTypeActiveTab === 'Children'}
				/> -->
				<TabButton onclick={setActiveTab} title="Roles" isActive={venueTypeActiveTab === 'Roles'} />
			</div>
			<div class="border-t border-muted-foreground">
				{#if venueTypeActiveTab === 'Children'}
					{#if venueTypeChildren.state === 'pending'}
						<p class="p-xs">{venueTypeChildren.message}</p>
					{:else if venueTypeChildren.state === 'success' && venueTypes.state === 'success'}
						{@const selectTrigCont =
							venueTypes.data.find((item) => item.id === activeVenueType?.selectedChildId)?.name ??
							'Select a child'}
						{@const selectItems = venueTypes.data
							.filter(
								(item) =>
									item.id !== activeVenueType?.id &&
									venueTypeChildren.state === 'success' &&
									venueTypeChildren.data.findIndex((child) => child.id === item.id) === -1
							)
							.map((item) => ({ value: item.id, label: item.name }))}
						{#each venueTypeChildren.data as child}
							<Button
								class="w-full justify-start rounded-none border-b border-b-muted-foreground text-sm text-secondary-foreground"
								variant="link">{child.name}</Button
							>
						{/each}
						<div class="flex">
							<SelectButton
								name="Organization"
								label="Organization"
								bind:value={activeVenueType.selectedChildId}
								trigContent={selectTrigCont}
								items={selectItems}
								size="full"
							/>
							<Button
								variant="link"
								onclick={() => {
									onChildAdd(activeVenueType!.id, activeVenueType!.selectedChildId);
								}}
								class="rounded-none"><PlusIcon />Add</Button
							>
						</div>
						<!-- <Button variant="link"><PlusIcon /> Add new Child</Button> -->
					{:else if venueTypeChildren.state === 'failed'}
						<p class="p-xs">Failed to Load: {venueTypeChildren.message}</p>
					{/if}
				{:else if venueTypeActiveTab === 'Roles'}
					{#if venueTypeRoles.state === 'pending'}
						<p class="p-xs">{venueTypeRoles.message}</p>
					{:else if venueTypeRoles.state === 'success'}
						{#each venueTypeRoles.data as role}
							<div
								class="flex w-full items-center justify-start rounded-none border-b border-b-muted-foreground px-sm text-sm text-secondary-foreground"
							>
								<p class="w-full">{role.name}</p>
								<Button
									onclick={() => {
										selectedRole = role;
										roleSheetOpen = true;
									}}
									size="icon"
									variant="ghost"><PencilIcon /></Button
								>
								<Button class="text-red-400" size="icon" variant="ghost"><TrashIcon /></Button>
							</div>
						{/each}
						<div class="flex w-full items-center p-xxs max-sm:flex-col">
							<Input
								bind:value={newRoleValue}
								onchange={(e) => {
									newRoleValue = e.currentTarget.value;
								}}
								name="orgName"
								class="w-full max-w-100 rounded-none border-secondary-foreground "
								type="text"
							/>
							<Button onclick={onRoleSave} variant="link"><PlusIcon /> Add</Button>
						</div>
						<!-- <Button variant="link"><PlusIcon /> Add</Button> -->
					{:else}
						<p class="p-xs">Failed to Load: {venueTypeRoles.message}</p>
					{/if}
				{/if}
			</div>
		</div>
	{/if}
</div>

{#if activeVenueType && selectedRole}
	<RolePermissionSheet
		title={'Institution'}
		org={activeVenueType!}
		role={selectedRole!}
		bind:open={roleSheetOpen}
	/>
{/if}
