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
	import OrganizerInvitePopup from './organizer-invite-popup.svelte';
	import SelectButton from '$lib/components/app/select-button.svelte';
	import OrganizerDeletePopup from './organizer-delete-popup.svelte';
	import {
		eventOrganizerInvitationStatusColors,
		eventOrganizerInvitationStatusTextColors
	} from '$lib/constants';

	let {
		organizers = $bindable(),
		organizerInvitations = $bindable(),
		organizations,
		eventId,
		eventName
	}: {
		organizers: EventOrganizer[];
		organizerInvitations: LoadedData<EventOrganizerInvitation[]>;
		organizations: LoadedData<Organization[]>;
		eventId: number;
		eventName: string;
	} = $props();

	let errorText = $state('');
	let newOrganizerOrganizationId: number | null = $state(null);
	let newOrganizerRole: EventOrganizerRole = $state('co_host');

	async function onaddOrganizer() {
		if (newOrganizerOrganizationId == null) {
			errorText = 'Select a valid organization';
			return;
		}
		popupOrgId = newOrganizerOrganizationId;
		popupRole = newOrganizerRole;
		popupOpen = true;
	}

	let deletingOrganizerId: null | number = $state(null);
	async function deleteOrganizer(organizerId: number) {
		try {
			deletingOrganizerId = organizerId;
			await removeOrganizer(eventId, organizerId);
			organizers = organizers.filter((o) => o.id !== organizerId);
			organizers = [...organizers];
		} catch (err: any) {
			errorText = err.message ?? 'Failed to delete organizer';
		} finally {
			deletingOrganizerId = null;
		}
	}

	let popupOpen = $state(false);
	let deletePopupOpen = $state(false);
	let deleteInvitationId: null | number = $state(null);
	let popupOrgId: number | null = $state(null);
	let popupRole: EventOrganizerRole | null = $state(null);
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
								{#if o.role !== 'host'}
									<div class="flex h-full rounded border">
										<button
											disabled={deletingOrganizerId === o.id}
											onclick={() => {
												deletingOrganizerId = o.id;
												deleteOrganizer(o.id);
											}}
											class="p-xxs"
											>{#if deletingOrganizerId === o.id}
												<Loader size="15" class="animate-spin" />{:else}
												<X size="15" />
											{/if}</button
										>
									</div>
								{/if}
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
					{#if o.role !== 'host'}
						<div class="flex h-full rounded border">
							<button
								disabled={deletingOrganizerId === o.id}
								onclick={() => {
									deletingOrganizerId = o.id;
									deleteOrganizer(o.id);
								}}
								class="p-xxs"
								>{#if deletingOrganizerId === o.id}
									<Loader size="15" class="animate-spin" />{:else}
									<X size="15" />
								{/if}</button
							>
						</div>
					{/if}
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
				<SelectButton
					name="organizations"
					itemsList={organizations.data.filter(
						(o) => !organizers.map((org) => org.organization.id).includes(o.id)
					)}
					class="w-full max-w-80"
					optionName="name"
					optionValue="id"
					bind:value={newOrganizerOrganizationId}
				/>
			{/if}
		</div>
		<div class="flex flex-col gap-y-xxs">
			<p class="italic">Role</p>
			<SelectButton
				name="organizations"
				itemsList={[...EVENT_ORGANIZER_ROLE].filter((r) => r !== 'host')}
				class="w-full max-w-80"
				bind:value={newOrganizerRole}
				transformName={(value) => value.split('_').join(' ')}
			/>
		</div>
		<Button onclick={onaddOrganizer} class="mt-sm w-min">Invite/Add</Button>
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
									<div
										class={`w-min ${eventOrganizerInvitationStatusColors[o.status]} ${eventOrganizerInvitationStatusTextColors[o.status]} p-xxs text-xs uppercase`}
									>
										{o.status}
									</div></td
								>
								<td class="px-xs py-xxs text-left">Co-host</td>
								<td class="flex items-center justify-start px-xs py-xxs text-left">
									{#if o.status === 'pending' || !organizers.find((org) => org.organization.id === o.recipientOrganization.id)}
										<div class="flex h-full rounded border">
											{#if o.status === 'pending'}
												<button
													onclick={() => {
														deleteInvitationId = o.id;
														deletePopupOpen = true;
													}}
													title="Revoke Invitation"
													class="p-xxs"><X size="15" /></button
												>
												<div class="my-0 w-[0.5px] bg-border"></div>
											{/if}
											{#if o.status !== 'pending' && !organizers.find((org) => org.organization.id === o.recipientOrganization.id) && !organizerInvitations.data.find((org) => org.recipientOrganization.id === o.recipientOrganization.id && org.status === 'pending')}
												<button
													onclick={() => {
														popupOrgId = o.recipientOrganization.id;
														popupRole = 'co_host';
														popupOpen = true;
													}}
													title="Resend Invitation"
													class="p-xxs"><Redo size="15" /></button
												>
											{/if}
										</div>
									{/if}
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
								<div
									class={`w-min ${eventOrganizerInvitationStatusColors[o.status]} ${eventOrganizerInvitationStatusTextColors[o.status]} p-xxs text-xs uppercase`}
								>
									{o.status}
								</div>
							</div>
						</div>
						{#if o.status === 'pending' || !organizers.find((org) => org.organization.id === o.recipientOrganization.id)}
							<div class="flex h-full rounded border">
								{#if o.status === 'pending'}
									<button
										onclick={() => {
											deleteInvitationId = o.id;
											deletePopupOpen = true;
										}}
										title="Revoke Invitation"
										class="p-xxs"><X size="15" /></button
									>
									<div class="my-0 w-[0.5px] bg-border"></div>
								{/if}
								{#if o.status !== 'pending' && !organizers.find((org) => org.organization.id === o.recipientOrganization.id) && !organizerInvitations.data.find((org) => org.recipientOrganization.id === o.recipientOrganization.id && org.status === 'pending')}
									<button
										onclick={() => {
											popupOrgId = o.recipientOrganization.id;
											popupRole = 'co_host';
											popupOpen = true;
										}}
										title="Resend Invitation"
										class="p-xxs"><Redo size="15" /></button
									>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

{#if popupOpen && organizations.state === 'success'}
	<OrganizerInvitePopup
		bind:isOpen={popupOpen}
		{eventId}
		{eventName}
		{organizations}
		bind:organizerInvitations
		bind:organizers
		organizationId={popupOrgId!}
		organizationName={organizations.data.find((o) => o.id === popupOrgId)?.name ?? ''}
		role={popupRole!}
	/>
{/if}

{#if deletePopupOpen && organizations.state === 'success'}
	<OrganizerDeletePopup
		bind:isOpen={deletePopupOpen}
		{eventId}
		invitationId={deleteInvitationId!}
		{eventName}
		{organizations}
		bind:organizerInvitations
		bind:organizers
		organizationId={popupOrgId!}
		organizationName={organizations.data.find((o) => o.id === popupOrgId)?.name ?? ''}
	/>
{/if}
