<script lang="ts">
	import { respondEventAssignments } from '$lib/api/me/approval-assignments';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { EventAssignmentsAndDetails, LoadedData } from '$lib/types';
	import { Loader } from '@lucide/svelte';

	let {
		isOpen = $bindable(false),
		eventId,
		ids,
		userRoleName,
		userScopeKindName,
		decision,
		kindName,
		eventName,
		eventAssignments = $bindable()
	}: {
		isOpen: boolean;
		eventId: number;
		ids: number[];
		userRoleName: string;
		userScopeKindName: string;
		decision: 'approved' | 'denied';
		kindName: string;
		eventName: string;
		eventAssignments: LoadedData<EventAssignmentsAndDetails>;
	} = $props();

	let remarks: string = $state('');
	let errorText = $state('');
	let loading = $state(false);

	async function respondToRequest(ids: number[], decision: 'approved' | 'denied') {
		if (decision === 'denied' && remarks.trim().length === 0) {
			errorText = 'Remarks required';
			return;
		}
		errorText = '';
		try {
			loading = true;
			await respondEventAssignments(eventId!, ids, decision, remarks);
			if (eventAssignments.state === 'success') {
				eventAssignments = {
					...eventAssignments,
					data: {
						...eventAssignments.data,
						assignments: eventAssignments.data.assignments.map((a) =>
							ids.includes(a.id) ? { ...a, status: decision, remarks: remarks.trim() } : a
						)
					}
				};
			}
			isOpen = false;
		} catch (err: any) {
			errorText = err.message ?? 'Something went wrong';
			console.error(errorText);
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open={isOpen}>
	<form>
		<Dialog.Content class="flex flex-col overflow-hidden sm:max-w-xl">
			<p class="border-b bg-muted p-3 italic">Confirm Approval</p>
			<div class="min-w-60 p-3">
				<p class="leading-7">
					I <span class="border border-muted-foreground p-0.5 px-xxs"
						><span class="font-bold">{userRoleName}</span>(<span class="italic"
							>{userScopeKindName}</span
						>)</span
					>
					,
					<span class={`${decision === 'approved' ? 'text-green-600' : 'text-red-600'}`}
						>{decision === 'approved' ? 'approve' : 'deny'}</span
					>
					the request to conduct event "<span class="bg-muted p-px font-bold">{eventName}</span>" by
					<span class="border border-muted-foreground p-0.5 px-xxs font-bold">{kindName}</span>
				</p>
			</div>
			{#if errorText}
				<p class="px-3 text-xs text-red-500">{errorText}</p>
			{/if}
			<div class="w-full p-3">
				<p class={`text-xs text-muted-foreground `}>Remarks</p>
				<textarea
					bind:value={remarks}
					class={`min-h-20 w-full bg-muted p-xxs ${errorText ? 'border border-red-400' : ''}}`}
				></textarea>
			</div>
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
					onclick={() => {
						respondToRequest(ids, decision);
					}}
					disabled={loading}
					class="flex items-center bg-muted px-2 py-2 font-bold text-foreground"
					>{#if loading}<Loader size="15" class="animate-spin" />
					{/if} Confirm</button
				>
			</div>
		</Dialog.Content>
	</form>
</Dialog.Root>
