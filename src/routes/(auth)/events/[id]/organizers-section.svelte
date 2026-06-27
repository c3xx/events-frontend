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
	import { Blend, History, Link, Loader, Redo, User, X } from '@lucide/svelte';
	import OrganizerInvitePopup from './organizer-invite-popup.svelte';
	import SelectButton from '$lib/components/app/select-button.svelte';
	import OrganizerDeletePopup from './organizer-delete-popup.svelte';
	import {
		eventOrganizerInvitationStatusColors,
		eventOrganizerInvitationStatusTextColors
	} from '$lib/constants';
	import ShapeAvatarSvg from '$lib/components/app/shape-avatar-svg.svelte';
	import * as Popover from '$lib/components/ui/popover/index';
	import OrganizerSelectionPopup from './organizer-selection-popup.svelte';
	import OrganizerHistory from './organizer-history.svelte';

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

	let newOrganizerOrganizationId: number | null = $state(null);
	let newOrganizerRole: EventOrganizerRole = $state('co_host');

	let errorText = $state('');

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

	let orgSelectionPopupOpen = $state(false);
	let orgInviteConfirmPopupOpen = $state(false);
	let deletePopupOpen = $state(false);
	let invitationHistoryPopupOpen = $state(false);
	let deleteInvitationId: null | number = $state(null);
	let popupOrgId: number | null = $state(null);
	let popupRole: EventOrganizerRole | null = $state(null);
</script>

<div class="flex flex-col gap-sm">
	<div class="flex items-center justify-between">
		<p class="text-base font-semibold uppercase">Organizers</p>
	</div>
	<div class="flex grid-cols-2 flex-col gap-xs text-sm sm:grid sm:gap-sm">
		{#each organizers as o}
			<div class="flex items-center gap-xs bg-background sm:border sm:p-xs">
				<ShapeAvatarSvg size={25} seed={o.organization.name} />
				<div class="flex w-full items-center gap-x-xxs">
					<p class="text-lg">{o.organization.name}</p>
					<p class="text-muted-foreground capitalize">({o.role})</p>
				</div>
				{#if o.role !== 'host'}
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
				{/if}
			</div>
		{/each}
		{#if organizerInvitations.state === 'success'}
			{#each organizerInvitations.data.filter((o) => o.status === 'pending') as org}
				<div class="flex items-center gap-xs bg-background sm:border sm:p-xs">
					<ShapeAvatarSvg size={25} seed={org.recipientOrganization.name} />
					<div class="flex w-full flex-col">
						<div class="flex w-full items-center gap-x-xxs">
							<p class="text-lg">{org.recipientOrganization.name}</p>
							<p class="text-muted-foreground capitalize">(Co-Host)</p>
						</div>
						<p class="text-xs text-muted-foreground uppercase">PENDING</p>
					</div>
					<button
						onclick={() => {
							deleteInvitationId = org.id;
							deletePopupOpen = true;
						}}
						class="p-xxs"><X size="15" /></button
					>
				</div>
			{/each}
		{/if}
	</div>
	<div class="flex gap-sm">
		<Popover.Root>
			<Popover.Trigger class={`${buttonVariants({ variant: 'link' })} has-[>svg]:p-0 sm:w-min`}
				><Link />Invite</Popover.Trigger
			>
			<Popover.Content class="w-min rounded-none p-0">
				<div class="flex flex-col">
					<Popover.Close
						class={`w-full justify-start ${buttonVariants({ variant: 'outline' })}`}
						onclick={() => {
							popupRole = 'co_host';
							orgSelectionPopupOpen = true;
						}}
						><User size="15" />
						<p>Invite Co-Host</p></Popover.Close
					>
					<Popover.Close
						class={`w-full justify-start ${buttonVariants({ variant: 'outline' })}`}
						onclick={() => {
							popupRole = 'resource_provider';
							orgSelectionPopupOpen = true;
						}}
						><Blend size="15" />
						<p>Add Resource Provider</p></Popover.Close
					>
				</div>
			</Popover.Content>
		</Popover.Root>
		<Button
			variant="link"
			class="has-[>svg]:p-0 sm:w-min"
			onclick={() => {
				invitationHistoryPopupOpen = true;
			}}><History /> View All</Button
		>
	</div>
	<!-- {#if organizerInvitations.state === 'success'}
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
	{/if} -->
</div>

{#if orgInviteConfirmPopupOpen && organizations.state === 'success'}
	<OrganizerInvitePopup
		bind:isOpen={orgInviteConfirmPopupOpen}
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

{#if orgSelectionPopupOpen && organizations.state === 'success'}
	<OrganizerSelectionPopup
		bind:isOpen={orgSelectionPopupOpen}
		bind:isConfirmPopupOpen={orgInviteConfirmPopupOpen}
		{eventId}
		{eventName}
		bind:organizerInvitations
		bind:organizers
		role={popupRole!}
		bind:selectedOrgId={popupOrgId}
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

{#if invitationHistoryPopupOpen}
	<OrganizerHistory bind:isOpen={invitationHistoryPopupOpen} {organizerInvitations} />
{/if}
