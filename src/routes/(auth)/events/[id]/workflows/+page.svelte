<script lang="ts">
	import { page } from '$app/state';
	import { loadEventWorkflow, loadEventWorkflows } from '$lib/api/events/workflow-instances';
	import { workflowStatusColors, workflowStatusTextColors } from '$lib/constants';
	import { formatDate } from '$lib/helpers';
	import type { LoadedData, WorkflowInstance } from '$lib/types';
	import { Check, ChevronDown, ChevronUp, X } from '@lucide/svelte';
	import { slide } from 'svelte/transition';

	let workflows = $state<LoadedData<WorkflowInstance[]>>({
		state: 'pending',
		message: 'Loading workflows...'
	});

	let activeWorkflow = $state<LoadedData<WorkflowInstance>>({
		state: 'pending',
		message: 'Loading workflow...'
	});

	let activeWorkflowId: number | null = $state(null);
	let eventId = $derived(Number(page.params.id));

	function isStepPending(step: WorkflowInstance['steps'][0]) {
		return step.roles.some((role) =>
			role.targetGroups.some((group) =>
				group.assignments.some((assignment) => assignment.status === 'pending')
			)
		);
	}

	$effect(() => {
		(async () => {
			try {
				workflows = {
					state: 'success',
					data: await loadEventWorkflows(eventId)
				};
				if (workflows.data.length > 0) {
					try {
						activeWorkflow = {
							state: 'success',
							data: await loadEventWorkflow(eventId, workflows.data[0].id)
						};
					} catch (err: any) {
						activeWorkflow = {
							state: 'failed',
							message: 'Failed to load workflow'
						};
					}
				}
			} catch (err: any) {
				workflows = {
					state: 'failed',
					message: 'Failed to load workflows'
				};
			}
		})();
	});

	$effect(() => {
		if (activeWorkflow.state !== 'success') return;
		activeWorkflowId = activeWorkflow.data.id;

		let firstPendingFound = false;

		for (const step of activeWorkflow.data.steps) {
			if (!firstPendingFound && isStepPending(step)) {
				step.stepOpen = true;
				firstPendingFound = true;
			} else {
				step.stepOpen = false;
			}
		}
	});

	async function loadWorkflow(id: number) {
		activeWorkflow = {
			state: 'pending',
			message: 'Loading workflow...'
		};
		try {
			activeWorkflow = {
				state: 'success',
				data: await loadEventWorkflow(eventId, id)
			};
		} catch (err: any) {
			activeWorkflow = {
				state: 'failed',
				message: 'Failed to load workflow'
			};
		}
	}
</script>

<div class="flex w-full max-w-200 flex-col gap-y-sm p-r-pad">
	{#if workflows.state === 'success'}
		{#if workflows.data.length > 0}
			{#if activeWorkflow.state === 'pending'}
				<p class="italic">Loading workflow...</p>
			{:else if activeWorkflow.state === 'failed'}
				<p class="text-red-400 italic">Failed to load workflow</p>
			{:else if activeWorkflow.state === 'success'}
				<div class="flex max-w-100 flex-col p-xs">
					<div class="flex items-start justify-between gap-x-xs">
						<div class="flex flex-col">
							<p class="text-2xl italic">WORKFLOW #{activeWorkflowId}</p>
							<p class="text-xs text-muted-foreground">
								Created on: {formatDate(activeWorkflow.data.createdAt)}
							</p>
						</div>
						<div
							class={`flex items-center gap-x-xxs px-xs py-px capitalize ${workflowStatusTextColors[activeWorkflow.data.status]}`}
						>
							{#if activeWorkflow.data.status === 'completed'}
								<Check size="15" />
							{:else if activeWorkflow.data.status === 'aborted' || activeWorkflow.data.status === 'denied'}
								<X size="15" />
							{/if}
							{activeWorkflow.data.status}
						</div>
					</div>
					<div class="mt-5 flex flex-col">
						{#if activeWorkflow.data.steps !== undefined}
							{#each activeWorkflow.data.steps as step, index}
								<div class="flex flex-col">
									<div class="flex flex-col">
										{#if index !== 0}
											<div class="flex w-5 justify-center">
												<div class="h-3 w-px bg-muted-foreground"></div>
											</div>
										{/if}
										<div class="flex h-auto items-center">
											<div class="flex h-5 w-5 flex-col items-center">
												<div
													class={`w-px flex-1 bg-muted-foreground
								${index === 0 ? 'invisible' : ''}`}
												></div>
												<div
													class={`flex h-5 w-5 items-center justify-center rounded-full
											border border-muted-foreground p-0.5 ${step.status === 'completed' || step.status === 'skipped' ? 'bg-primary text-background' : ''}`}
												>
													{#if step.status === 'completed' || step.status === 'skipped'}
														<Check size="12" />
													{:else if activeWorkflow.data.status === 'denied' || activeWorkflow.data.status === 'aborted'}
														<X size="12" />
													{/if}
												</div>
												<div
													class={`w-px flex-1 bg-muted-foreground
								${index === activeWorkflow.data.steps.length - 1 ? 'invisible' : ''}`}
												></div>
											</div>
											<div class="ml-sm flex w-full justify-between">
												<button
													onclick={() => {
														step.stepOpen = !step.stepOpen;
													}}
													class={`cursor-pointer text-xl leading-none ${
														step.status === 'pending' ? 'text-muted-foreground' : ''
													}`}
												>
													{step.name}
												</button>
												{#if step.roles.some( (s) => s.targetGroups.some((g) => g.assignments.length > 0) )}
													<button
														onclick={() => {
															step.stepOpen = !step.stepOpen;
														}}
														>{#if step.stepOpen}
															<ChevronUp />
														{:else}
															<ChevronDown />
														{/if}</button
													>
												{/if}
											</div>
										</div>
									</div>
								</div>
								{#if step.stepOpen}
									<div
										transition:slide
										class={`flex ${step.status === 'pending' ? 'text-muted-foreground' : ''}`}
									>
										<div class="flex w-5 justify-center">
											<div class="h-full w-px bg-muted-foreground"></div>
										</div>
										<div class="ml-sm flex flex-col gap-y-sm py-sm">
											{#each step.roles as role}
												{#each role.targetGroups as group}
													{#each group.assignments as assignment}
														<div class="flex items-start leading-none">
															<div class="flex w-6 justify-start p-px">
																{#if assignment.status === 'approved' || assignment.status === 'skipped'}
																	<Check size="15" />
																{:else if assignment.status === 'denied'}
																	<X size="15" />
																{/if}
															</div>
															<div class="flex flex-col gap-y-0.5">
																<p>{assignment.userRole.user.fullName}</p>
																<p
																	class={`text-xs uppercase
														${step.status === 'pending' ? 'text-muted-foreground' : 'text-primary'}`}
																>
																	{role.role.name}
																</p>
																<p
																	class={`text-xs ${
																		assignment.status === 'denied'
																			? 'text-red-600'
																			: assignment.status === 'approved'
																				? 'text-green-600'
																				: 'text-muted-foreground'
																	} `}
																>
																	{#if assignment.status === 'pending'}
																		Waiting for approval
																	{:else}
																		<span class="capitalize">{assignment.status} the request</span>
																	{/if}
																</p>
															</div>
														</div>
													{/each}
												{/each}
											{/each}
										</div>
									</div>
								{/if}
							{/each}
						{:else}
							<p class="italic">Loading steps</p>
						{/if}
					</div>
				</div>
			{/if}
		{/if}
		<div class="flex flex-col gap-y-xs">
			<p class="italic">Workflows</p>
			<div class="hidden sm:block">
				<table class="w-full max-w-200 border border-muted-foreground text-sm">
					<thead class="border-b border-muted-foreground text-muted-foreground">
						<tr class="bg-muted">
							<th class="p-xs text-left">ID</th>
							<th class="w-48 p-xs text-left">Status</th>
							<th class="w-48 p-xs text-left">Created on</th>
							<th class="w-48 p-xs text-left">Completed on</th>
						</tr>
					</thead>
					<tbody>
						{#if workflows.data.length === 0}
							<tr
								><td class="py-6" colspan="4"
									><p class="w-full text-center text-muted-foreground italic">
										No workflows initiated
									</p></td
								></tr
							>
						{/if}
						{#each workflows.data as workflow}
							<tr
								class={`${workflow.id === activeWorkflowId && workflows.data.length > 1 ? 'bg-primary/5' : ''}`}
							>
								<td class="px-xs py-xxs text-left"
									><button
										onclick={() => {
											if (workflow.id === activeWorkflowId) return;
											loadWorkflow(workflow.id);
										}}
										disabled={workflow.id === activeWorkflowId}
										class="cursor-pointer text-primary underline">#{workflow.id}</button
									></td
								>
								<td class="px-xs py-xxs text-left"
									><p
										class={`w-min px-xxs py-0.5 ${workflowStatusColors[workflow.status]} ${workflowStatusTextColors[workflow.status]}`}
									>
										{workflow.status}
									</p></td
								>
								<td class="px-xs py-xxs text-left">{formatDate(workflow.createdAt)}</td>
								<td class="px-xs py-xxs text-left"
									>{workflow.completedAt ? formatDate(workflow.completedAt) : 'NIL'}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div class="block max-w-200 border border-muted-foreground text-sm sm:hidden">
				{#if workflows.data.length === 0}
					<p class="w-full py-6 text-center text-muted-foreground italic">No workflows initiated</p>
				{/if}
				{#each workflows.data as workflow}
					<div
						class="flex flex-col items-start gap-y-xxs border-b border-muted-foreground bg-muted p-xs last:border-b-0"
					>
						<button
							onclick={() => {
								if (workflow.id === activeWorkflowId) return;
								loadWorkflow(workflow.id);
							}}
							disabled={workflow.id === activeWorkflowId}
							class="w-min cursor-pointer text-lg text-primary underline">#{workflow.id}</button
						>
						<p
							class={`w-min px-xxs py-0.5 ${workflowStatusColors[workflow.status]} ${workflowStatusTextColors[workflow.status]}`}
						>
							{workflow.status}
						</p>
						<div class="flex flex-col">
							<p class="text-xs text-muted-foreground">Created on</p>
							<p class="text-left">{formatDate(workflow.createdAt)}</p>
						</div>
						<div class="flex flex-col">
							<p class="text-xs text-muted-foreground">Completed on</p>
							<p class="text-left">
								{workflow.completedAt ? formatDate(workflow.completedAt) : 'NIL'}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
