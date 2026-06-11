<script lang="ts">
	import { addEventType, loadEventTypes } from '$lib/api/event-types';
	import { loadWorkflowTemplate, loadWorkflowTemplates } from '$lib/api/workflow-templates';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Select from '$lib/components/ui/select/index';
	import * as Sheet from '$lib/components/ui/sheet/index';
	import type { Workflow, EventType, LoadedData } from '$lib/types';
	import { EVENT_TYPE_COLLABORATION_POLICY, EVENT_TYPE_VENUE_POLICY } from '$lib/types';
	import { PlusIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let eventTypes = $state<LoadedData<EventType[]>>({
		state: 'pending',
		message: 'Loading Event Types...'
	});
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
		e.preventDefault();
		if (newTypeName.trim() === '') {
			errorText = 'Enter a valid name';
			return;
		}
	}

	onMount(async () => {
		try {
			eventTypes = {
				state: 'success',
				data: await loadEventTypes()
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
