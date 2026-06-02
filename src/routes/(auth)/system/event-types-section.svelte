<script lang="ts">
	import { addEventType, loadEventTypes } from '$lib/api/event-types';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Select from '$lib/components/ui/select/index';
	import * as Sheet from '$lib/components/ui/sheet/index';
	import type { EventType, LoadedData } from '$lib/types';
	import { EVENT_TYPE_COLLABORATION_POLICY, EVENT_TYPE_VENUE_POLICY } from '$lib/types';
	import { PlusIcon, Workflow } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let eventTypes = $state<LoadedData<EventType[]>>({
		state: 'pending',
		message: 'Loading Event Types...'
	});

	let addEventTypeSheetOpen = $state(false);

	async function onAddClick() {
		addEventTypeSheetOpen = true;
	}

	// Move this to types, once worflow is finalised by backend
	type Workflow = {
		id: string;
		name: string;
		description: string;
		steps: {
			id: string;
			step: string;
			order: number;
			description: string;
		}[];
	};
	let workflows = $state<LoadedData<Workflow[]>>({
		state: 'pending',
		message: 'Loading Workflows...'
	});

	let newTypeName = $state('');
	let newTypeWorkflowId: null | string = $state(null);
	let newTypeCollaborationPolicy = $state('');
	if (EVENT_TYPE_COLLABORATION_POLICY.length > 0) {
		newTypeCollaborationPolicy = EVENT_TYPE_COLLABORATION_POLICY[0];
	}
	let newTypeVenuePolicy = $state('');
	if (EVENT_TYPE_VENUE_POLICY.length > 0) {
		newTypeVenuePolicy = EVENT_TYPE_VENUE_POLICY[0];
	}
	let errorText = $state('');

	async function handleSubmit(e: SubmitEvent) {
		if (newTypeName.trim() === '') {
			errorText = 'Enter a valid name';
			return;
		}
	}

	onMount(async () => {
		try {
			// eventTypes = {
			// 	state: 'success',
			// 	data: await loadEventTypes()
			// };
			eventTypes = {
				state: 'success',
				data: [
					{
						id: '123',
						name: 'Event',
						workflowId: '123',
						collaborationPolicy: 'required',
						venuePolicy: 'forbidden'
					},
					{
						id: '123',
						name: 'Program',
						workflowId: '123',
						collaborationPolicy: 'required',
						venuePolicy: 'forbidden'
					}
				]
			};
			workflows = {
				state: 'success',
				data: [
					{
						id: '123',
						name: 'Normal Flow',
						description: 'Hellp dfdfd fdfdf fdfdd fdfddfdfd',
						steps: [
							{
								id: '1',
								step: 'Senior Advisor',
								order: 1,
								description: 'dsdsd sdsd ddsds'
							},
							{
								id: '2',
								step: 'Head of Department',
								order: 1,
								description: 'dsdsd sdsd ddsds'
							},
							{
								id: '3',
								step: 'Dean',
								order: 1,
								description: 'dsdsd sdsd ddsds'
							},
							{
								id: '4',
								step: 'Principal',
								order: 1,
								description: 'dsdsd sdsd ddsds'
							}
						]
					},
					{
						id: '124',
						name: 'Higher priority',
						description: 'Hellp dfdfd fdfdf fdfdd',
						steps: [
							{
								id: '1',
								step: 'Dean',
								order: 1,
								description: 'dsdsd sdsd ddsds'
							},
							{
								id: '2',
								step: 'Vice Principal',
								order: 1,
								description: 'dsdsd sdsd ddsds'
							},
							{
								id: '3',
								step: 'Principal',
								order: 1,
								description: 'dsdsd sdsd ddsds'
							}
						]
					}
				]
			};
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
	<p class="text-sm text-muted-foreground">Manage Event Types.</p>
	<div class=" border border-muted-foreground bg-muted">
		{#if eventTypes.state === 'pending'}
			<p class="p-xs">{eventTypes.message}</p>
		{:else if eventTypes.state === 'success'}
			{#each eventTypes.data as type}
				<div
					class="flex w-full flex-col justify-start gap-y-xxxs rounded-none border-b border-b-muted-foreground px-sm py-xs text-sm text-secondary-foreground"
				>
					<p class="">{type.name}</p>
					<!-- TODO:show workflow -->
					<div class="grid w-fit grid-cols-2 gap-x-xs gap-y-xxxs text-xs">
						<p class="text-muted-foreground">Collaboration Policy:</p>
						<p class="uppercase">{type.collaborationPolicy}</p>
						<p class="text-muted-foreground">Venue Policy:</p>
						<p class="uppercase">{type.venuePolicy}</p>
					</div>
				</div>
			{/each}
			<div class="flex w-full items-center p-xxs max-sm:flex-col">
				<Button onclick={onAddClick} variant="link"><PlusIcon /> Add</Button>
			</div>
		{:else}
			<p class="p-xs">Failed to Load: {eventTypes.message}</p>
		{/if}
	</div>
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
						<Label for="name" class="text-end">Workflow</Label>
						<Select.Root type="single" bind:value={newTypeWorkflowId!}>
							<Select.Trigger
								class="flex h-fit! w-full min-w-0 items-start rounded-none border border-muted-foreground bg-background px-3 text-base shadow-xs ring-offset-background transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
							>
								<div class="flex flex-col items-start">
									{#if workflows.state === 'pending'}
										<p>Loading workflows...</p>
									{:else if workflows.state === 'success'}
										<p class="font-bold">
											{workflows.data.find((w) => w.id === newTypeWorkflowId)?.name}
										</p>
										<p class="text-muted-foreground">
											{workflows.data.find((w) => w.id === newTypeWorkflowId)?.description}
										</p>
									{/if}
								</div>
							</Select.Trigger>
							<Select.Content class="rounded-none">
								{#if workflows.state === 'pending'}
									<p>Loading Workflows...</p>
								{:else if workflows.state === 'success'}
									{#each workflows.data as workflow}
										<Select.Item
											class="flex flex-col items-start rounded-none border-b last:border-b-0"
											value={workflow.id}
										>
											<p class="font-bold">{workflow.name}</p>
											<p class="text-muted-foreground">{workflow.description}</p>
										</Select.Item>
									{/each}
								{/if}
							</Select.Content>
						</Select.Root>

						{#if newTypeWorkflowId && workflows.state === 'success'}
							<div
								class="flex flex-col gap-y-xs border-2 border-dashed border-muted-foreground p-xs"
							>
								{#each workflows.data.find((w) => w.id === newTypeWorkflowId)?.steps as step}
									<div class="flex items-center gap-x-xs">
										<div class="h-3 w-3 rounded-full bg-muted-foreground/50"></div>
										{step.step}
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
