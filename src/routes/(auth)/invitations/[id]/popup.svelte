<script lang="ts">
	import { respondToInvitation } from '$lib/api/me/invitations';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { authInfo } from '$lib/global/auth.svelte';
	import { type AuthUser, type LoadedData, type PendingInvitationDetailed } from '$lib/types';
	import { Loader } from '@lucide/svelte';

	let {
		isOpen = $bindable(false),
		invitationId,
		invitationDetailed = $bindable(),
		decision,
		decisionMade = $bindable()
	}: {
		isOpen: boolean;
		invitationId: number;
		invitationDetailed: LoadedData<PendingInvitationDetailed>;
		decision: 'accepted' | 'rejected';
		decisionMade: 'accepted' | 'rejected' | null;
	} = $props();

	let errorText = $state('');
	let loading = $state(false);

	async function respondToInvite() {
		if (invitationDetailed.state !== 'success') return;
		if (selectedUserRoleId === null) {
			errorText = 'Select a role from drop-down';
			return;
		}
		errorText = '';
		try {
			loading = true;
			await respondToInvitation(invitationId, selectedUserRoleId, decision);
			decisionMade = decision;
			isOpen = false;
		} catch (err: any) {
			errorText = err.message;
		} finally {
			loading = false;
		}
	}

	let user: AuthUser | null = null;
	let roles: AuthUser['memberships'][0]['roles'] = $state([]);
	let selectedUserRoleId: null | number = $state(null);

	$effect(() => {
		if (invitationDetailed.state !== 'success') return;
		user = authInfo.get();
		if (!user) return;
		roles = user.memberships.find(
			(m) => m.id === invitationDetailed.data.recipientOrganization.id
		)?.roles!;
		if (roles.length === 1) {
			selectedUserRoleId = roles[0].id;
		}
	});
</script>

{#if invitationDetailed.state === 'success'}
	<Dialog.Root bind:open={isOpen}>
		<form>
			<Dialog.Content class="flex flex-col overflow-hidden sm:max-w-xl">
				<p class="border-b bg-muted p-3 italic">Confirm Invite</p>
				<div class="min-w-60 p-3">
					<p class="leading-7">
						I <span
							>{#if roles.length === 1}
								<span class="h-8 border border-muted-foreground bg-primary/10 p-0.5 px-xxs"
									>{roles[0].name}</span
								>
							{:else}
								<select
									bind:value={selectedUserRoleId}
									class="h-8 border border-muted-foreground bg-primary/10 p-0.5 px-xxs"
								>
									{#each roles as role}
										<option value={role.id}>{role.name}</option>
									{/each}
								</select>
							{/if}</span
						>
						of {invitationDetailed.data.recipientOrganization.name},
						<span class={`${decision === 'accepted' ? 'text-green-600' : 'text-red-600'}`}
							>{decision === 'accepted' ? 'accept' : 'reject'}</span
						>
						the invite sent by
						<span class="font-bold">{invitationDetailed.data.sender.organization.name}</span>
						for the role
						<span class="font-bold"
							>{invitationDetailed.data.intendedRole === 'co_host'
								? 'Co-Host'
								: invitationDetailed.data.intendedRole === 'resource_provider'
									? 'Resource Provider'
									: 'Host'}</span
						>
						for the event
						<span class="italic">{invitationDetailed.data.event.title}</span>
					</p>
				</div>
				{#if errorText}
					<p class="px-3 text-xs text-red-500">{errorText}</p>
				{/if}
				<div class="flex w-full justify-end gap-x-sm p-3 text-sm">
					<button
						type="button"
						onclick={() => {
							isOpen = false;
						}}
						class="px-2 py-2 text-muted-foreground">Go Back</button
					>
					<button
						type="button"
						onclick={respondToInvite}
						disabled={loading}
						class="flex items-center bg-muted px-2 py-2 font-bold text-foreground"
						>{#if loading}<Loader size="15" class="animate-spin" />
						{/if} Confirm</button
					>
				</div></Dialog.Content
			>
		</form>
	</Dialog.Root>
{/if}
