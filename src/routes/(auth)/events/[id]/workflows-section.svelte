<script lang="ts">
	import { loadEventWorkflow } from '$lib/api/events/workflow-instances';
	import Button from '$lib/components/ui/button/button.svelte';
	import { workflowStatusColors, workflowStatusTextColors } from '$lib/constants';
	import { formatDate } from '$lib/helpers';
	import type { LoadedData, WorkflowInstance } from '$lib/types';
	import { ArrowRight, Check, ChevronDown, ChevronUp, X } from '@lucide/svelte';
	import { slide } from 'svelte/transition';

	let {
		eventId,
		activeWorkflow
	}: {
		eventId: number;
		activeWorkflow: null | LoadedData<WorkflowInstance>;
	} = $props();

	function isStepPending(step: WorkflowInstance['steps'][0]) {
		return step.roles.some((role) =>
			role.targetGroups.some((group) =>
				group.assignments.some((assignment) => assignment.status === 'pending')
			)
		);
	}

	$effect(() => {
		if (activeWorkflow === null) return;
		if (activeWorkflow.state !== 'success') return;

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
</script>

<div class="flex grid-cols-2 flex-col gap-sm sm:grid">
	<div class="flex flex-col gap-sm">
		<p class="text-base font-semibold uppercase">Active Workflow</p>
		{#if activeWorkflow !== null}
			{#if activeWorkflow.state === 'pending'}
				<p class="italic">Loading workflow...</p>
			{:else if activeWorkflow.state === 'failed'}
				<p class="text-red-400 italic">Failed to load workflow</p>
			{:else if activeWorkflow.state === 'success'}
				<div class="flex max-w-100 flex-col border border-muted-foreground p-xs">
					<div class="flex flex-col items-start justify-between gap-x-xs">
						<div class="flex w-full items-start justify-between">
							<p class="text-2xl italic">#{activeWorkflow.data.id}</p>

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
						<p class="text-xs text-muted-foreground">
							Created on: {formatDate(activeWorkflow.data.createdAt)}
						</p>
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
			<div class="flex max-w-100 justify-end">
				<a
					href={`/events/${eventId}/workflows`}
					class="flex items-center gap-xxs text-sm text-primary hover:underline"
					>See all workflows <ArrowRight size="15" /></a
				>
			</div>
		{:else}
			<div
				class="flex w-full max-w-100 flex-col items-center justify-center gap-y-0.5 bg-muted p-xs py-10"
			>
				<p class="italic">No active workflow</p>
				<p class="text-xs text-muted-foreground">Submit the event to start a workflow</p>
			</div>
		{/if}
	</div>
</div>
