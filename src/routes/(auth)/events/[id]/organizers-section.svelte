<script lang="ts">
	import {
		loadOrganizerInvitations,
		removeOrganizerInvitation
	} from '$lib/api/events/organizer-invitations';
	import { addOrganizer, removeOrganizer } from '$lib/api/events/organizers';
	import { loadOrgs } from '$lib/api/organizations';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index';
	import {
		EVENT_ORGANIZER_ROLE,
		type EventOrganizer,
		type EventOrganizerInvitation,
		type EventOrganizerRole,
		type LoadedData,
		type Organization
	} from '$lib/types';
	import { Redo, X } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let organizerInvitaions = $state<LoadedData<EventOrganizerInvitation[]>>({
		state: 'pending',
		message: 'Loading organization invitations...'
	});
	let organizations = $state<LoadedData<Organization[]>>({
		state: 'pending',
		message: 'Loading organizations...'
	});

	let { organizers, eventId }: { organizers: EventOrganizer[]; eventId: string } = $props();

	let sheetOpen = $state(false);
	let errorText = $state('');
	let newOrganizerOrganizationId: string | null = $state(null);
	let newOrganizerRole: EventOrganizerRole = $state('co_host');

	async function handleSubmit(e: SubmitEvent) {
		if (newOrganizerOrganizationId == null) {
			errorText = 'Select a valid organization';
			return;
		}
		sendInvitation(newOrganizerOrganizationId, newOrganizerRole);
	}

	async function sendInvitation(organizationId: string, role: EventOrganizerRole) {
		if (organizations.state !== 'success') return;
		if (organizerInvitaions.state !== 'success') return;
		try {
			const { id } = await addOrganizer(eventId, organizationId, role);
			if (newOrganizerRole === 'resource_provider ') {
				organizers.push({
					id: id.toString(),
					organization: organizations.data.find((o) => o.id === newOrganizerOrganizationId)!,
					role: newOrganizerRole
				});
			} else if (newOrganizerRole === 'co_host') {
				organizerInvitaions.data = [
					...organizerInvitaions.data,
					{
						id: id.toString(),
						closedAt: null,
						invitedAt: '',
						invitedByUser: { id: '', user: { id: '', fullName: '' } },
						recipientOrganization: {
							id: '',
							name: organizations.data.find((o) => o.id === newOrganizerOrganizationId)?.name!
						},
						senderOrganization: { id: '', name: '' },
						status: 'pending'
					}
				];
			}
			sheetOpen = false;
		} catch (err: any) {
			errorText = err.message;
		}
	}

	async function deleteOrganizer(organizerId: string) {
		try {
			await removeOrganizer(eventId, organizerId);
			organizers = organizers.filter((o) => Number(o.id) !== Number(organizerId));
			organizers = { ...organizers };
		} catch (err) {
			//
		}
	}

	async function deleteOrganizerInvitation(invitationId: string) {
		if (organizerInvitaions.state !== 'success') return;
		try {
			await removeOrganizerInvitation(eventId, invitationId);
			organizerInvitaions.data = organizerInvitaions.data.filter(
				(o) => Number(o.id) !== Number(invitationId)
			);
			organizerInvitaions = { ...organizerInvitaions };
		} catch (err) {
			//
		}
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

	onMount(async () => {
		try {
			organizations = {
				state: 'success',
				data: await loadOrgs()
			};
		} catch (err: any) {
			organizations = {
				state: 'failed',
				message: err.message ?? 'Failed to load organizations'
			};
		}
	});
</script>

<div class="flex flex-col gap-y-sm">
	<!-- <DataTable {columns} {optionsList} data={organizers} /> -->
	<div class="mt-sm flex flex-col gap-y-xxs">
		<div class="flex max-w-200 items-center justify-between">
			<p>Organizers</p>
			<Button
				onclick={() => {
					sheetOpen = true;
				}}
				class="w-min">Add Organizer</Button
			>
		</div>
		<table class="max-w-200 border border-muted-foreground text-sm">
			<thead class="border-b border-muted-foreground text-muted-foreground">
				<tr class="bg-muted">
					<th class="p-xs text-left"> Name </th>
					<th class="p-xs text-left">Role</th>
					<th class="w-20 p-xs text-left">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each organizers as o}
					<tr>
						<td class="px-xs py-xxs text-left">{o.organization.name}</td>
						<td class="px-xs py-xxs text-left capitalize">{o.role}</td>
						<td class="flex items-center justify-start px-xs py-xxs text-center">
							<div class="flex h-full rounded border">
								<button
									onclick={() => {
										deleteOrganizer(o.id);
									}}
									class="p-xxs"><X size="15" /></button
								>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if organizerInvitaions.state === 'success'}
		<div class="mt-sm flex flex-col gap-y-xxs">
			<p class="">Invitations</p>

			<table class="max-w-200 border border-foreground text-sm">
				<thead class="border-b border-muted-foreground text-muted-foreground">
					<tr class="bg-muted">
						<th class="p-xs text-left"> Name </th>
						<th class="p-xs text-left">Role</th>
						<th class="w-20 p-xs text-left">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each organizerInvitaions.data.filter((i) => i.status !== 'accepted') as o}
						<tr>
							<td class="flex items-center gap-x-xxs px-xs py-xxs text-left"
								>{o.recipientOrganization.name}
								<div class="w-min bg-muted p-xxs text-xs text-muted-foreground uppercase">
									{o.status}
								</div></td
							>
							<td class="px-xs py-xxs text-left">Co-host</td>
							<td class="flex items-center justify-start px-xs py-xxs text-left">
								<div class="flex h-full rounded border">
									{#if o.status === 'pending'}
										<button
											onclick={() => {
												deleteOrganizerInvitation(o.id);
											}}
											title="Revoke Invitation"
											class="p-xxs"><X size="15" /></button
										>
										<div class="my-0 w-[0.5px] bg-border"></div>
									{/if}
									{#if o.status !== 'pending'}
										<button
											onclick={() => {
												sendInvitation(o.recipientOrganization.id, 'co_host');
											}}
											title="Resend Invitation"
											class="p-xxs"><Redo size="15" /></button
										>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<Sheet.Root bind:open={sheetOpen}>
	<Sheet.Content class="flex w-full flex-col sm:min-w-100" side="right">
		<form class="flex h-full flex-col overflow-auto" onsubmit={handleSubmit}>
			<Sheet.Header class="mb-xs border-b border-muted-foreground">
				<div class="flex flex-col">
					<h2 class="text-lg font-bold">Add Organizer</h2>
					<h3 class="text-sm">////</h3>
				</div>
			</Sheet.Header>
			<div class="grid flex-1 auto-rows-min gap-6 px-4">
				{#if errorText}
					<p class="text-sm text-red-500">{errorText}</p>
				{/if}
				<div class="grid gap-2">
					<Label for="name" class="text-end">Organization</Label>
					{#if organizations.state === 'pending'}
						<p class="h-9 w-full border border-muted-foreground px-3 py-1">
							Loading Organizations...
						</p>
					{:else if organizations.state === 'success'}
						<select
							bind:value={newOrganizerOrganizationId}
							class="flex h-9 w-full min-w-0 rounded-none border border-muted-foreground bg-background px-3 py-1 text-base shadow-xs ring-offset-background transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
						>
							{#each organizations.data as o}
								<option value={o.id}>{o.name}</option>
							{/each}
						</select>
					{/if}
				</div>
				<div class="grid gap-2">
					<Label for="name" class="text-end">Role</Label>
					<select
						bind:value={newOrganizerRole}
						class="flex h-9 w-full min-w-0 rounded-none border border-muted-foreground bg-background px-3 py-1 text-base shadow-xs ring-offset-background transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
					>
						{#each EVENT_ORGANIZER_ROLE as role}
							<option value={role}>{role.toUpperCase()}</option>
						{/each}
					</select>
				</div>
			</div>
			<Sheet.Footer class="sticky bottom-0">
				<Button type="submit">Save changes</Button>
				<Sheet.Close class={buttonVariants({ variant: 'outline' })}>Close</Sheet.Close>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
