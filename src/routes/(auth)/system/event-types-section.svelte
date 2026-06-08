<script lang="ts">
	import {
		createEventType,
		loadEventTypes,
		loadEventTypeChildren,
		addEventTypeChild
	} from '$lib/api/event-types';
	import SelectButton from '$lib/components/app/select-button.svelte';
	import TabButton from '$lib/components/app/tab-button.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import type { EventType, LoadedData } from '$lib/types';
	import { PlusIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let eventTypes = $state<LoadedData<(EventType & { selectedChildId: string })[]>>({
		state: 'pending',
		message: 'Loading event types...'
	});
	let eventTypeChildren = $state<LoadedData<{ id: number; name: string }[]>>({
		state: 'pending',
		message: 'Loading children...'
	});

	let newTypeName: string = $state('');
	let newTypeVenuePolicy: string = $state('optional');
	let newTypeCollabPolicy: string = $state('optional');

	let activeTab: 'Children' = $state('Children');
	let activeEventType: (EventType & { selectedChildId: string }) | null = $state(null);

	async function onSave() {
		if (!newTypeName) return;
		const saveToastId = toast.loading('Saving new event type...');
		try {
			const newType = await createEventType({
				name: newTypeName,
				venuePolicy: newTypeVenuePolicy,
				collaborationPolicy: newTypeCollabPolicy,
				workflowTemplateId: 1
			});
			if (eventTypes.state === 'success') {
				eventTypes.data = [
					...eventTypes.data,
					{
						id: newType.id,
						name: newTypeName,
						isActive: true,
						venuePolicy: newTypeVenuePolicy as EventType['venuePolicy'],
						collaborationPolicy: newTypeCollabPolicy as EventType['collaborationPolicy'],
						selectedChildId: ''
					}
				];
			}
			toast.success('Event Type Saved', { id: saveToastId });
		} catch (err) {
			console.error(err);
			toast.error('Failed to save event type', { id: saveToastId });
		} finally {
			newTypeName = '';
		}
	}

	async function onChildAdd(parentId: number, childId: string) {
		if (!parentId || !childId) return;
		const promise = addEventTypeChild(parentId, parseInt(childId));
		toast.promise(promise, {
			loading: 'Adding child type...',
			success: () => {
				if (eventTypeChildren.state === 'success' && eventTypes.state === 'success') {
					eventTypeChildren.data = [
						...eventTypeChildren.data,
						{
							id: parseInt(childId),
							name: eventTypes.data.find((item) => item.id.toString() === childId)?.name ?? ''
						}
					];
				}
				return 'Child type added';
			},
			error: (err) => {
				console.error(err);
				return 'Failed to add child type';
			}
		});
	}

	async function setActiveTab(tab: string) {
		if (!activeEventType) return;
		if (tab === 'Children') {
			eventTypeChildren = { state: 'pending', message: 'Loading children...' };
			try {
				eventTypeChildren = {
					state: 'success',
					data: await loadEventTypeChildren(activeEventType.id)
				};
			} catch {
				eventTypeChildren = { state: 'failed', message: 'Failed to load children' };
			}
		}
		activeTab = tab as 'Children';
	}

	onMount(async () => {
		try {
			const data = await loadEventTypes();
			eventTypes = {
				state: 'success',
				data: data.map((t) => ({ ...t, selectedChildId: '' }))
			};
		} catch {
			eventTypes = { state: 'failed', message: 'Failed to load event types' };
		}
	});
</script>

<div class="flex w-full max-w-200 flex-col gap-y-sm p-r-pad">
	<h2 class="text-lg">Event Types</h2>
	<p class="text-sm text-muted-foreground">
		Manage event types and their allowed child types. Select an item to manage its children.
	</p>
	<div class="border border-muted-foreground bg-muted">
		{#if eventTypes.state === 'pending'}
			<p class="p-xs">{eventTypes.message}</p>
		{:else if eventTypes.state === 'success'}
			{#each eventTypes.data as et}
				<Button
					onclick={async () => {
						activeEventType = et;
						setActiveTab(activeTab);
					}}
					class="w-full justify-start rounded-none border-b border-b-muted-foreground text-sm text-secondary-foreground"
					variant="link">{et.name}</Button
				>
			{/each}
			<div class="flex w-full flex-col gap-xxs p-xxs">
				<Input
					bind:value={newTypeName}
					onchange={(e) => {
						newTypeName = e.currentTarget.value;
					}}
					name="eventTypeName"
					class="w-full max-w-100 rounded-none border-secondary-foreground"
					type="text"
					placeholder="Event type name"
				/>
				<div class="flex gap-x-xxs">
					<select
						bind:value={newTypeVenuePolicy}
						class="rounded-xs border border-secondary-foreground bg-background px-sm py-xs text-sm"
					>
						<option value="required">Venue: Required</option>
						<option value="optional">Venue: Optional</option>
						<option value="forbidden">Venue: Forbidden</option>
					</select>
					<select
						bind:value={newTypeCollabPolicy}
						class="rounded-xs border border-secondary-foreground bg-background px-sm py-xs text-sm"
					>
						<option value="required">Collab: Required</option>
						<option value="optional">Collab: Optional</option>
						<option value="forbidden">Collab: Forbidden</option>
					</select>
					<Button onclick={onSave} variant="link"><PlusIcon /> Add</Button>
				</div>
			</div>
		{:else}
			<p class="p-xs">Failed to Load: {eventTypes.message}</p>
		{/if}
	</div>
	{#if activeEventType !== null}
		<div class="border border-muted-foreground bg-muted">
			<h3 class="p-xs font-medium">{activeEventType?.name}</h3>
			<div class="flex gap-x-xxs">
				<TabButton onclick={setActiveTab} title="Children" isActive={activeTab === 'Children'} />
			</div>
			<div class="border-t border-muted-foreground">
				{#if activeTab === 'Children'}
					{#if eventTypeChildren.state === 'pending'}
						<p class="p-xs">{eventTypeChildren.message}</p>
					{:else if eventTypeChildren.state === 'success' && eventTypes.state === 'success'}
						{@const selectTrigCont =
							eventTypes.data.find(
								(item) => item.id.toString() === activeEventType?.selectedChildId
							)?.name ?? 'Select a child'}
						{@const selectItems = eventTypes.data
							.filter(
								(item) =>
									item.id !== activeEventType?.id &&
									eventTypeChildren.state === 'success' &&
									eventTypeChildren.data.findIndex(
										(child) => child.id.toString() === item.id.toString()
									) === -1
							)
							.map((item) => ({ value: item.id.toString(), label: item.name }))}
						{#each eventTypeChildren.data as child}
							<Button
								class="w-full justify-start rounded-none border-b border-b-muted-foreground text-sm text-secondary-foreground"
								variant="link">{child.name}</Button
							>
						{/each}
						<div class="flex">
							<SelectButton
								name="EventType"
								label="Event Type"
								bind:value={activeEventType.selectedChildId}
								trigContent={selectTrigCont}
								items={selectItems}
								size="full"
							/>
							<Button
								variant="link"
								onclick={() => {
									onChildAdd(activeEventType!.id, activeEventType!.selectedChildId);
								}}
								class="rounded-none"><PlusIcon />Add</Button
							>
						</div>
					{:else if eventTypeChildren.state === 'failed'}
						<p class="p-xs">Failed to Load: {eventTypeChildren.message}</p>
					{/if}
				{/if}
			</div>
		</div>
	{/if}
</div>
