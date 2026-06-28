<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		addWorkflowTemplate,
		loadWorkflowTemplate,
		loadWorkflowTemplates
	} from '$lib/api/workflow-templates';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import type { LoadedData, WorkflowTemplate } from '$lib/types';
	import { Loader, Network, PlusIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let workflows: LoadedData<WorkflowTemplate[]> = $state({
		state: 'pending',
		message: 'Loading workflows...'
	});

	let newTemplateTitle = $state('');
	let createTemplateLoading = $state(false);

	let errorText = $state('');

	async function createTemplate() {
		if (newTemplateTitle.trim().length === 0) {
			errorText = 'Please enter a valid name';
			return;
		}
		errorText = '';
		try {
			createTemplateLoading = true;
			const res = await addWorkflowTemplate(newTemplateTitle.trim());
			if (workflows.state === 'success') {
				workflows.data.push({
					id: res.id,
					name: newTemplateTitle.trim(),
					steps: []
				});

				workflows = { ...workflows };
			}
			await goto(`/workflow-templates/${res.id}`);
		} catch (err: any) {
			errorText = err.message;
			console.error(err.message);
		} finally {
			createTemplateLoading = false;
		}
	}

	onMount(async () => {
		try {
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
		} catch (err) {
			workflows = {
				state: 'failed',
				message: 'Failed to load workflow templates'
			};
		}
	});
</script>

<div class="mx-auto flex w-full max-w-prose flex-col px-r-pad">
	<div class="border-muted-background flex w-full items-center justify-between border-b py-xs">
		<h1 class="px-2 text-xl">Workflow Templates</h1>
	</div>
	<div class="flex max-w-200 flex-col gap-y-xs border border-muted-foreground p-r-pad">
		<p>Create Template</p>
		<div class="flex rounded bg-muted py-r-pad">
			<div
				class="mx-4 flex aspect-square h-8 items-center justify-center rounded-full bg-neutral-300 p-xs"
			>
				<Network size="15" />
			</div>
			<p class="mr-r-pad text-xs text-muted-foreground">
				Start by creating a workflow name, then add the steps involved in the process. For each
				step, assign the roles responsible for reviewing or approving requests and choose how
				approvals should be evaluated.
			</p>
		</div>
		<div class="flex flex-col gap-y-xxs">
			<p class="text-xs">Template Name</p>
			<Input bind:value={newTemplateTitle} />
		</div>
		<Separator />
		<Button
			class="w-min"
			disabled={newTemplateTitle.trim().length === 0 || createTemplateLoading}
			onclick={createTemplate}
			>{#if createTemplateLoading}
				<Loader class="animate-spin" />
			{/if}Create</Button
		>
		{#if errorText}
			<div class="bg-red-100 px-r-pad py-xs">
				<p class="text-sm text-red-500">{errorText}</p>
			</div>
		{/if}
	</div>
	<Separator class="my-r-pad" />
	<div class="flex flex-col gap-y-xs">
		{#if workflows.state === 'pending'}
			<p>{workflows.message}</p>
		{:else if workflows.state === 'success'}
			{#each workflows.data as workflow}
				<div class="flex flex-col p-xs">
					<div class="flex items-center gap-x-xs">
						<a
							class="text-2xl text-primary italic hover:underline"
							href={`/workflow-templates/${workflow.id}`}>{workflow.name}</a
						>
					</div>
					<div class="mt-xxs flex flex-col text-muted-foreground">
						{#if workflow.steps !== undefined}
							{#if workflow.steps.length === 0}
								<p>No steps added</p>
							{/if}
							{#each workflow.steps as step, index}
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
												${index === workflow.steps.length - 1 ? 'invisible' : ''}`}
											></div>
										</div>
										<p class="ml-xxs">{step.name}</p>
									</div>
								</div>
							{/each}
						{:else}
							<p class="italic">Loading steps</p>
						{/if}
					</div>
				</div>
			{/each}
		{:else}
			<p>{workflows.message}</p>
		{/if}
	</div>
</div>
