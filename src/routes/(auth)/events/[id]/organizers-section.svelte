<script lang="ts">
	import { loadOrganizerInvitations } from '$lib/api/events/organizer-invitations';
	import DataTable from '$lib/components/app/data-table.svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index';
	import type {
		EventOrganizer,
		EventOrganizerInvitation,
		LoadedData,
		TableProps
	} from '$lib/types';
	import { Redo, X } from '@lucide/svelte';

	const columns: TableProps<EventOrganizer>['columns'] = [
		{
			key: 'organization',
			header: 'Organizer',
			type: 'transformValue',
			transformValue: (organizer) => {
				return organizer.organization.name;
			}
		},
		{
			key: 'role',
			header: 'Role',
			type: 'transformValue',
			transformValue: (organizer) => {
				return organizer.role.toUpperCase();
			}
		}
	];

	const optionsList: TableProps<EventOrganizer>['optionsList'] = [
		{ id: '1', name: 'Delete Member', onclick: (organizer) => {} },
		{ id: '2', name: 'Resend Invitation', onclick: (organizer) => {} },
		{ id: '3', name: 'Revoke Invitation', onclick: (organizer) => {} }
	];

	let organizerInvitaions = $state<LoadedData<EventOrganizerInvitation[]>>({
		state: 'pending',
		message: 'Loading organization invitations...'
	});

	let { organizers, eventId }: { organizers: EventOrganizer[]; eventId: string } = $props();

	let sheetOpen = $state(false);
	let errorText = $state('');
	let newOrganizerEmailValue = $state('');
	async function handleSubmit(e: SubmitEvent) {
		//
	}

	$effect(() => {
		(async () => {
			try {
				organizerInvitaions = {
					state: 'success',
					data: await loadOrganizerInvitations(eventId)
				};
			} catch (err) {
				organizerInvitaions = {
					state: 'failed',
					message: 'Failed to load invitations'
				};
			}
		})();
	});
</script>

<div class="flex flex-col gap-y-sm">
	<!-- <DataTable {columns} {optionsList} data={organizers} /> -->
	<table class="border text-sm">
		<thead class="border-b text-muted-foreground">
			<tr>
				<th class="p-xs text-left"> Name </th>
				<th class="p-xs text-left">Role</th>
				<th class="w-20 p-xs text-left">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each organizers as o}
				<tr>
					<td class="p-xs text-left">{o.organization.name}</td>
					<td class="p-xs text-left">{o.role}</td>
					<td class="flex items-center p-xs text-left">
						<div class="flex h-full rounded border">
							<button class="p-xxs"><X /></button>
						</div>
					</td>
				</tr>
			{/each}
			<tr>
				<td class="bg-muted py-xxs text-center text-xs text-muted-foreground uppercase" colspan="3"
					>Pending Invitations</td
				>
			</tr>
			{#if organizerInvitaions.state === 'success'}
				{#each organizerInvitaions.data as o}
					<tr>
						<td class="p-xs text-left">{o.recipientOrganization.name}</td>
						<td class="p-xs text-left">{o.status}</td>
						<td class="flex items-center p-xs text-left">
							<div class="flex h-full rounded border">
								<button class="p-xxs"><X /></button>
								<div class="my-0 w-[0.5px] bg-border"></div>
								<button class="p-xxs"><Redo /></button>
							</div>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
	<Button
		onclick={() => {
			sheetOpen = true;
		}}
		class="w-min">Add Organizer</Button
	>
</div>

<Sheet.Root bind:open={sheetOpen}>
	<Sheet.Content class="w-full sm:min-w-100" side="right">
		<form onsubmit={handleSubmit}>
			<div class="overflow-auto">
				<Sheet.Header class="mb-xs border-b border-muted-foreground">
					<div class="flex flex-col">
						<h2 class="text-lg font-bold">Add Organizer</h2>
						<h3 class="text-sm">
							Enter the details of the new event type. Click save when you're done.
						</h3>
					</div>
				</Sheet.Header>
				<div class="grid flex-1 auto-rows-min gap-6 px-4">
					{#if errorText}
						<p class="text-sm text-red-500">{errorText}</p>
					{/if}
					<div class="grid gap-2">
						<Label for="name" class="text-end">Name</Label>
						<Input
							class="primary-input"
							bind:value={newOrganizerEmailValue}
							onchange={(e) => (newOrganizerEmailValue = e.currentTarget.value)}
							name="name"
						/>
					</div>
				</div>
			</div>
			<Sheet.Footer>
				<Button type="submit">Save changes</Button>
				<Sheet.Close class={buttonVariants({ variant: 'outline' })}>Close</Sheet.Close>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
