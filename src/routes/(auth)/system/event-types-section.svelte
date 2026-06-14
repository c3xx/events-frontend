<script lang="ts">
	import {
		createEventType,
		loadEventTypes,
		loadEventTypeChildren,
		addEventTypeChild
	} from '$lib/api/event-types';
	import SelectButton from '$lib/components/app/select-button.svelte';
	import TabButton from '$lib/components/app/tab-button.svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
  import type { Workflow, EventType, LoadedData } from '$lib/types';
	import { PlusIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
  import { addEventType, loadEventTypes } from '$lib/api/event-types';
  import { loadWorkflowTemplate, loadWorkflowTemplates } from '$lib/api/workflow-templates';
  import { EVENT_TYPE_COLLABORATION_POLICY, EVENT_TYPE_VENUE_POLICY } from '$lib/types';

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
  if (EVENT_TYPE_COLLABORATION_POLICY.length > 0) {
		newTypeCollaborationPolicy = EVENT_TYPE_COLLABORATION_POLICY[0];
	}
	let newTypeVenuePolicy = $state('');
	if (EVENT_TYPE_VENUE_POLICY.length > 0) {
		newTypeVenuePolicy = EVENT_TYPE_VENUE_POLICY[0];
	}
	let errorText = $state('');

	let activeTab: 'Children' = $state('Children');
	let activeEventType: (EventType & { selectedChildId: string }) | null = $state(null);
  
  let workflows = $state<LoadedData<Workflow[]>>({
		state: 'pending',
		message: 'Loading Workflows...'
	});

	let addEventTypeSheetOpen = $state(false);
	const selectedWorkflow = $derived(
		workflows.state === 'success'
			? workflows.data.find((w) => String(w.id) === String(newTypeWorkflowId))
			: undefined
	);

	async function onAddClick() {
		addEventTypeSheetOpen = true;
	}

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
  
	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (newTypeName.trim() === '') {
			errorText = 'Enter a valid name';
			return;
		}
	}

	onMount(async () => {
		try {
			const data = await loadEventTypes();
			eventTypes = {
				state: 'success',
				data: data.map((t) => ({ ...t, selectedChildId: '' }))
			};
      
      const workflowList = await loadWorkflowTemplates();

			workflows = {
				state: 'success',
				data: workflowList
			};

			workflowList.forEach(async (workflow, index) => {
				try {
					const fullWorkflow = await loadWorkflowTemplate(workflow.id);

					if (workflows.state !== 'success') return;

					workflows.data[index] = fullWorkflow;
					workflows = { ...workflows };
				} catch (err) {
					console.error(`Failed: ${workflow.id}`);
				}
			});
			if (workflows.data.length > 0) {
				newTypeWorkflowId = workflows.data[0].id;
			}
		} catch (error) {
			eventTypes = {
				state: 'failed',
				message: 'Failed to load event types'
			};
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

<Sheet.Root bind:open={addEventTypeSheetOpen}>
	<Sheet.Content class="w-full sm:min-w-100" side="right">
		<form onsubmit={handleSubmit}>
			<div class="overflow-auto">
				<Sheet.Header class="mb-xs border-b border-muted-foreground">
					<div class="flex flex-col">
						<h2 class="text-lg font-bold">Add Event Type</h2>
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
							bind:value={newTypeName}
							onchange={(e) => (newTypeName = e.currentTarget.value)}
							name="name"
						/>
					</div>
					<div class="grid gap-2">
						<Label for="name" class="text-end">Workflow Template</Label>
						{#if workflows.state === 'pending'}
							<p>Loading Workflows...</p>
						{:else if workflows.state === 'success'}
							<select
								bind:value={newTypeWorkflowId}
								class="flex h-9 w-full min-w-0 rounded-none border border-muted-foreground bg-background px-3 py-1 text-base shadow-xs ring-offset-background transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
							>
								{#each workflows.data as workflow}
									<option value={workflow.id}>{workflow.name}</option>
								{/each}
							</select>
						{/if}

						{#if selectedWorkflow}
							<div class="flex flex-col bg-muted p-xxs">
								<p class="mb-xs text-xs text-muted-foreground">Template Preview</p>
								{#if selectedWorkflow.steps.length === 0}
									<p class="italic">No steps found</p>
								{/if}
								{#each selectedWorkflow.steps as step, index}
									<div class="flex flex-col">
										{#if index !== 0}
											<div class="flex w-5 justify-center">
												<div class="h-3 w-px bg-muted-foreground"></div>
											</div>
										{/if}
										<div class="flex h-5 items-center">
											<div class="flex h-5 w-5 flex-col items-center">
												<div
													class={`w-px flex-1 bg-muted-foreground
													${index === 0 ? 'invisible' : ''}`}
												></div>
												<div class="h-3 w-3 rounded-full border border-muted-foreground"></div>
												<div
													class={`w-px flex-1 bg-muted-foreground
													${workflows.state === 'success' && index === workflows.data.find((w) => w.id === newTypeWorkflowId!)!.steps.length - 1 ? 'invisible' : ''}`}
												></div>
											</div>
											<p class="ml-xxs">{step.name}</p>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
					<div class="grid gap-2">
						<Label for="name" class="text-end">Collaboration Policy</Label>
						<!-- TODO: Make this select button reusable. Use this instead of shadcn -->
						<select
							bind:value={newTypeCollaborationPolicy}
							class="flex h-9 w-full min-w-0 rounded-none border border-muted-foreground bg-background px-3 py-1 text-base shadow-xs ring-offset-background transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
						>
							{#each EVENT_TYPE_COLLABORATION_POLICY as policy}
								<option value={policy}>{policy.toUpperCase()}</option>
							{/each}
						</select>
					</div>
					<div class="grid gap-2">
						<Label for="name" class="text-end">Venue Policy</Label>
						<select
							bind:value={newTypeVenuePolicy}
							class="flex h-9 w-full min-w-0 rounded-none border border-muted-foreground bg-background px-3 py-1 text-base shadow-xs ring-offset-background transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
						>
							{#each EVENT_TYPE_VENUE_POLICY as policy}
								<option value={policy}>{policy.toUpperCase()}</option>
							{/each}
						</select>
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
