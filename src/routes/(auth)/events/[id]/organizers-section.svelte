<script lang="ts">
	import { removeOrganizerInvitation } from '$lib/api/events/organizer-invitations';
	import { addOrganizer, removeOrganizer } from '$lib/api/events/organizers';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import {
		EVENT_ORGANIZER_ROLE,
		type EventOrganizer,
		type EventOrganizerInvitation,
		type EventOrganizerRole,
		type LoadedData,
		type Organization
	} from '$lib/types';
	import { Loader, Redo, X } from '@lucide/svelte';

	let {
		organizers = $bindable(),
		organizerInvitations = $bindable(),
		organizations,
		eventId
	}: {
		organizers: EventOrganizer[];
		organizerInvitations: LoadedData<EventOrganizerInvitation[]>;
		organizations: LoadedData<Organization[]>;
		eventId: string;
	} = $props();

	let errorText = $state('');
	let addLoading = $state(false);
	let newOrganizerOrganizationId: string | null = $state(null);
	let newOrganizerRole: EventOrganizerRole = $state('co_host');

	async function onaddOrganizer() {
		if (newOrganizerOrganizationId == null) {
			errorText = 'Select a valid organization';
			return;
		}
		sendInvitation(newOrganizerOrganizationId, newOrganizerRole);
	}

	async function sendInvitation(organizationId: string, role: EventOrganizerRole) {
		if (organizations.state !== 'success') return;
		if (organizerInvitations.state !== 'success') return;
		errorText = '';
		try {
			addLoading = true;
			const { id } = await addOrganizer(eventId, organizationId, role);
			if (newOrganizerRole === 'resource_provider ') {
				organizers.push({
					id: id.toString(),
					organization: organizations.data.find((o) => o.id === newOrganizerOrganizationId)!,
					role: newOrganizerRole
				});
			} else if (newOrganizerRole === 'co_host') {
				organizerInvitations.data = [
					...organizerInvitations.data,
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
		} catch (err: any) {
			errorText = err.message;
		} finally {
			addLoading = false;
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
		if (organizerInvitations.state !== 'success') return;
		try {
			await removeOrganizerInvitation(eventId, invitationId);
			organizerInvitations.data = organizerInvitations.data.filter(
				(o) => Number(o.id) !== Number(invitationId)
			);
			organizerInvitations = { ...organizerInvitations };
		} catch (err) {
			//
		}
	}
</script>

<div class="flex flex-col gap-y-sm">
	<div class="mt-sm flex flex-col gap-y-xxs">
		<div class="flex max-w-200 items-center justify-between">
			<p>Organizers</p>
		</div>
		<div class="hidden sm:block">
			<table class="w-full max-w-200 border border-muted-foreground text-sm">
				<thead class="border-b border-muted-foreground text-muted-foreground">
					<tr class="bg-muted">
						<th class="p-xs text-left"> Name </th>
						<th class="p-xs text-left">Role</th>
						<th class="w-20 p-xs text-left">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#if organizers.length === 0}
						<tr
							><td class="py-6" colspan="3"
								><p class="w-full text-center text-muted-foreground italic">
									No organizers found
								</p></td
							></tr
						>
					{/if}
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
		<div class="block max-w-200 border border-muted-foreground text-sm sm:hidden">
			{#if organizers.length === 0}
				<p class="w-full py-6 text-center text-muted-foreground italic">No organizers found</p>
			{/if}
			{#each organizers as o}
				<div
					class="flex items-center justify-between gap-xxs border-b border-muted-foreground p-xs last:border-b-0"
				>
					<div class="flex flex-col gap-px">
						<p class="text-lg">{o.organization.name}</p>
						<p class="text-muted-foreground capitalize">{o.role}</p>
					</div>
					<div class="flex h-full rounded border">
						<button
							onclick={() => {
								deleteOrganizer(o.id);
							}}
							class="p-xxs"><X size="15" /></button
						>
					</div>
				</div>
			{/each}
		</div>
	</div>
	<div
		class="flex flex-col gap-y-xxs max-sm:mt-sm sm:border sm:border-muted-foreground sm:bg-muted sm:p-xs"
	>
		<p class="font-bold">Add Organizer</p>
		<p class="text-xs text-muted-foreground">
			Add an organizer by choosing an organization and assigning an appropriate role. The selected
			role determines the organizer's access level and responsibilities for managing the event.
		</p>
		{#if errorText}
			<p class="text-sm text-red-500">{errorText}</p>
		{/if}
		<div class="flex flex-col gap-y-xxs">
			<p class="italic">Organization</p>
			{#if organizations.state === 'pending'}
				<p class="h-9 w-full border border-muted-foreground px-3 py-1">Loading Organizations...</p>
			{:else if organizations.state === 'success'}
				<select
					bind:value={newOrganizerOrganizationId}
					class="flex h-9 w-full max-w-80 min-w-0 rounded-none border border-muted-foreground bg-background px-3 py-1 text-base shadow-xs ring-offset-background transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
				>
					{#each organizations.data as o}
						<option value={o.id}>{o.name}</option>
					{/each}
				</select>
			{/if}
		</div>
		<div class="flex flex-col gap-y-xxs">
			<p class="italic">Role</p>
			<select
				bind:value={newOrganizerRole}
				class="flex h-9 w-full max-w-80 min-w-0 rounded-none border border-muted-foreground bg-background px-3 py-1 text-base shadow-xs ring-offset-background transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
			>
				{#each EVENT_ORGANIZER_ROLE as role}
					{#if role !== 'host'}
						<option value={role}>{role.toUpperCase()}</option>
					{/if}
				{/each}
			</select>
		</div>
		<Button disabled={addLoading} onclick={onaddOrganizer} class="mt-sm w-min"
			>{#if addLoading}
				<Loader class="animate-spin" />
			{/if} Invite/Add</Button
		>
	</div>
	{#if organizerInvitations.state === 'success'}
		<Separator class="sm:hidden" />
		<div class="mt-sm flex flex-col gap-y-xxs">
			<p class="">Invitations</p>
			<div class="hidden sm:block">
				<table class=" w-full max-w-200 border border-foreground text-sm">
					<thead class="border-b border-muted-foreground text-muted-foreground">
						<tr class="bg-muted">
							<th class="p-xs text-left"> Name </th>
							<th class="p-xs text-left">Role</th>
							<th class="w-20 p-xs text-left">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#if organizerInvitations.data.length === 0}
							<tr
								><td class="py-6" colspan="3"
									><p class="w-full text-center text-muted-foreground italic">
										No invitations made yet
									</p></td
								></tr
							>
						{/if}
						{#each organizerInvitations.data.filter((i) => i.status !== 'accepted') as o}
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

			<div class="block max-w-200 border border-muted-foreground text-sm sm:hidden">
				{#if organizerInvitations.data.length === 0}
					<p class="w-full py-6 text-center text-muted-foreground italic">
						No invitations made yet
					</p>
				{/if}
				{#each organizerInvitations.data as o}
					<div
						class="flex items-center justify-between gap-xxs border-b border-muted-foreground p-xs last:border-b-0"
					>
						<div class="flex flex-col gap-px">
							<p class="text-lg">{o.recipientOrganization.name}</p>
							<div class="flex items-center gap-x-xxs">
								<p class="text-muted-foreground capitalize">Co-host</p>
								<div class="w-min bg-muted p-xxs text-xs text-muted-foreground uppercase">
									{o.status}
								</div>
							</div>
						</div>
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
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
