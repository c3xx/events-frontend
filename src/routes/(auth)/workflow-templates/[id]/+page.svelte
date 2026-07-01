<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { loadOrgTypes, loadRolesOrgType } from '$lib/api/organizations';
	import { loadRolesVenueType } from '$lib/api/venue';
	import { loadVenueTypes } from '$lib/api/venues';
	import {
		addWorkflowTemplate,
		addWorkflowTemplateStep,
		addWorkflowTemplateStepRole,
		deleteWorkflowTemplateStepRole,
		loadWorkflowTemplates,
		loadWorkflowTemplatesStepsRoles,
		loadWorkflowTemplateSteps
	} from '$lib/api/workflow-templates';
	import SelectButton from '$lib/components/app/select-button.svelte';
	import SideSheet from '$lib/components/app/side-sheet.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index';
	import {
		ENTITIES,
		WORKFLOW_TARGET_GROUP_APPROVAL_CRITERIA,
		type EntityType,
		type LoadedData,
		type Organization,
		type OrganizationType,
		type Role,
		type Venue,
		type VenueType,
		type WorkflowTemplate,
		type WorkflowTargetGroupApprovalCriteriaType
	} from '$lib/types';
	import { Loader, Network, Plus, X } from '@lucide/svelte';
	import { error } from '@sveltejs/kit';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { nav } from '../../header.svelte';

	const workflowId = $derived(Number(page.params.id));
	let isValidId: 'pending' | 'true' | 'false' = $state('pending');
	let workflowTitle: string | undefined = $state('Loading...');

	let entityTypes: LoadedData<OrganizationType[] | VenueType[]> = $state({
		state: 'pending',
		message: 'Loading entity types...'
	});

	let workflowList: LoadedData<WorkflowTemplate[]> = $state({
		state: 'pending',
		message: 'Loading workflows...'
	});

	let roles: LoadedData<Role[]> = $state({
		state: 'pending',
		message: 'Loading roles...'
	});

	let steps: LoadedData<WorkflowTemplate['steps']> = $state({
		state: 'pending',
		message: 'Loading steps...'
	});
	let worflowCriteria: WorkflowTargetGroupApprovalCriteriaType | null = $state(null);
	let activeStepId: number | null | -1 = $state(null);

	let addStepLoading = $state(false);
	let addStepRoleLoading = $state(false);

	let sheetOpen = $state(false);
	let errorText = $state('');
	let newRoleEntity: null | EntityType = $state(null);
	let newRoleEntityTypeId: null | Organization['id'] | Venue['id'] = $state(null);
	let newRoleId: null | number = $state(null);

	function onAddNodeClick(index: number, prevId: number, nextId: number | null) {
		if (steps.state !== 'success') return;
		let tempStep: WorkflowTemplate['steps'][0] = {
			id: -1,
			name: '',
			nextStepId: nextId,
			roles: []
		};
		steps.data.splice(index, 0, tempStep);
		activeStepId = -1;
		steps = { ...steps };
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (steps.state !== 'success') return;
		if (newRoleId === null) {
			errorText = 'Please select a valid role';
			return;
		}
		errorText = '';
		try {
			addStepRoleLoading = true;
			await addWorkflowTemplateStepRole(workflowId!, activeStepId!, newRoleId, worflowCriteria!);
			sheetOpen = false;
			steps.data.map((s) =>
				s.id === activeStepId && roles.state === 'success' && entityTypes.state === 'success'
					? s.roles.push({
							role: {
								id: newRoleId!,
								name: roles.data.find((r) => r.id === newRoleId)?.name!,
								scope: {
									type: newRoleEntity!,
									kindId: newRoleEntityTypeId!,
									kindName: entityTypes.data.find((e) => e.id === newRoleEntityTypeId)?.name!
								}
							},
							targetGroupApprovalCriteria: worflowCriteria!
						})
					: s
			);
			steps = { ...steps };
			activeStepId = null;
		} catch (err: any) {
			errorText = err.message;
		} finally {
			addStepRoleLoading = false;
		}
	}

	async function deleteStepRole(stepId: number, roleId: number, index: number) {
		if (steps.state !== 'success') return;
		try {
			await deleteWorkflowTemplateStepRole(workflowId!, stepId, roleId);
			steps.data.map((s) =>
				s.id === stepId && roles.state === 'success' ? s.roles.splice(index, 1) : s
			);
			steps = { ...steps };
		} catch (err: any) {
			console.error(err.message);
		}
	}

	onMount(async () => {
		nav.set([{ title: 'Workflow Templates', url: '/workflow-templates' }]);

		try {
			workflowList = {
				state: 'success',
				data: await loadWorkflowTemplates()
			};
		} catch (err) {
			workflowList = {
				state: 'failed',
				message: 'Failed to load workflows'
			};
		}
	});

	$effect(() => {
		isValidId = 'pending';
		if (!workflowId) {
			isValidId = 'false';
		}

		(async () => {
			if (workflowList.state !== 'success') return;
			const workflow = workflowList.data.find((w) => Number(w.id) === Number(workflowId));
			if (!workflow || workflow === undefined) {
				isValidId = 'false';
			}
			workflowTitle = workflow!.name;

			steps = {
				state: 'pending',
				message: 'Loading steps...'
			};
			try {
				steps = {
					state: 'success',
					data: await loadWorkflowTemplateSteps(workflowId!)
				};
				isValidId = 'true';
				if (steps.data.length === 0) {
					let tempStep: WorkflowTemplate['steps'][0] = {
						id: -1,
						name: '',
						nextStepId: null,
						roles: []
					};
					steps.data.splice(0, 0, tempStep);
					activeStepId = -1;
					steps = { ...steps };
					return;
				}

				steps.data.forEach(async (step, index) => {
					try {
						const roles = await loadWorkflowTemplatesStepsRoles(workflow!.id, step.id);

						if (steps.state !== 'success') return;

						steps.data[index].roles = roles;
						steps = { ...steps };
					} catch (err) {
						console.error(`Failed: ${step.id}`);
					}
				});
			} catch {
				steps = {
					state: 'failed',
					message: 'Failed to load steps'
				};
			}
		})();
	});

	$effect(() => {
		if (!sheetOpen) {
			newRoleEntity = null;
			activeStepId = null;
		}
	});

	$effect(() => {
		(async () => {
			if (newRoleEntity !== null) {
				entityTypes = {
					state: 'pending',
					message: 'Loading entities types...'
				};
				try {
					if (newRoleEntity === 'organization') {
						entityTypes = {
							state: 'success',
							data: await loadOrgTypes()
						};
					} else {
						entityTypes = {
							state: 'success',
							data: await loadVenueTypes()
						};
					}
				} catch (err) {
					entityTypes = {
						state: 'failed',
						message: 'Failed to load entities'
					};
				}
			}
			newRoleEntityTypeId = null;
			newRoleId = null;
		})();
	});

	$effect(() => {
		(async () => {
			if (newRoleEntityTypeId !== null) {
				roles = {
					state: 'pending',
					message: 'Loading roles...'
				};
				try {
					if (newRoleEntity === 'organization') {
						roles = {
							state: 'success',
							data: await loadRolesOrgType(newRoleEntityTypeId)
						};
					} else {
						roles = {
							state: 'success',
							data: await loadRolesVenueType(newRoleEntityTypeId)
						};
					}
					worflowCriteria = 'any';
				} catch (err) {
					roles = {
						state: 'failed',
						message: 'Failed to load roles'
					};
				}
			}
			newRoleId = null;
		})();
	});

	async function addStep(name: string, index: number) {
		if (steps.state !== 'success') return;
		try {
			addStepLoading = true;
			const prevStepIndex = index - 1;
			const prevStepId = prevStepIndex < 0 ? null : steps.data[prevStepIndex].id;
			const { id, nextStepId } = await addWorkflowTemplateStep(
				workflowId!,
				name.trim(),
				prevStepId
			);
			steps.data.splice(index, 1, { id: id, name: name.trim(), nextStepId: nextStepId, roles: [] });
			steps = { ...steps };
			activeStepId = null;
		} catch (err) {
			console.error('Something went wrong');
		} finally {
			addStepLoading = false;
		}
	}
</script>

<div class="mx-auto flex w-full max-w-prose flex-col px-r-pad">
	{#if isValidId === 'true'}
		<div class="border-muted-background flex w-full max-w-200 flex-col justify-center py-xs">
			<h1 class="px-2 text-3xl italic">{workflowTitle}</h1>
			<p class="mt-xs px-2 text-xs text-muted-foreground">
				Add the steps involved in the process. For each step, assign the roles responsible for
				reviewing or approving requests and choose how approvals should be evaluated
			</p>
		</div>
		<div class="flex w-full max-w-200 flex-col gap-y-xxs p-xxs">
			{#if steps.state === 'pending'}
				<p>{steps.message}</p>
			{:else if steps.state === 'success'}
				{#each steps.data as step, index}
					{#if index === 0}
						<div class="flex items-center">
							<div class="h-px w-full flex-1 bg-muted"></div>
							<button
								onclick={() => {
									onAddNodeClick(0, step.id, step.nextStepId);
								}}
								disabled={activeStepId !== null}
								class={`flex h-5 w-5 items-center justify-center rounded-full p-0 text-white ${activeStepId !== null ? 'bg-muted' : 'bg-green-500'}`}
								><Plus /></button
							>
							<div class="h-px w-full flex-1 bg-muted"></div>
						</div>
					{/if}
					{#if step.id !== -1}
						<div
							class={`flex w-full flex-col overflow-hidden rounded border ${activeStepId !== null && activeStepId !== step.id ? 'text-muted-foreground' : 'border-foreground'}`}
						>
							<div
								class={`flex items-center p-xs ${activeStepId !== null && activeStepId !== step.id ? 'bg-muted/50' : 'bg-muted'}`}
							>
								<div class="mr-auto flex flex-col">
									<p class="text-xs">Step {index + 1}</p>
									<p class="text-sm font-bold uppercase">{step.name}</p>
								</div>
								<Button variant="ghost" class="cursor-pointer rounded px-xxs text-red-400"
									>Delete</Button
								>
							</div>
							<div class="mt-xs flex flex-col p-xs">
								{#if !(activeStepId === step.id && step.roles.length <= 0)}
									<p class="text-xs">Roles</p>
								{/if}
								<div class="w-full bg-muted/50">
									{#if step.roles !== undefined}
										{#each step.roles as role, roleIndex}
											<div
												transition:slide
												class="flex w-full items-center border-b p-xs last:border-b-0"
											>
												<div class="mr-auto flex flex-col">
													<p>
														{role.role.name}
														<span class="italic">({role.role.scope.kindName})</span>
													</p>
													<p class="text-xs text-muted-foreground">
														Target Group Approval Criteria: {role.targetGroupApprovalCriteria.toUpperCase()}
													</p>
												</div>
												<button
													onclick={() => {
														deleteStepRole(step.id, role.role.id, roleIndex);
													}}
													class="cursor-pointer"><X size="18" /></button
												>
											</div>
										{/each}
										<Button
											class={`${activeStepId !== null && activeStepId !== step.id ? 'text-muted-foreground' : ''}`}
											onclick={() => {
												errorText = '';
												activeStepId = step.id;
												sheetOpen = true;
											}}
											disabled={activeStepId !== null && activeStepId !== step.id}
											variant="link">Add Role <Plus /></Button
										>
									{:else}
										<p class="p-xxs text-xs italic">Loading roles...</p>
									{/if}
								</div>
							</div>
						</div>
					{:else}
						<div class="flex w-full flex-col overflow-hidden rounded border border-foreground">
							<div class="flex flex-col gap-y-xxs bg-muted p-xs">
								<p class="text-xs">Step Name</p>
								<Input bind:value={step.name} />
							</div>
							<div class="flex justify-start">
								<Button
									onclick={() => {
										addStep(step.name, index);
									}}
									disabled={step.name.length === 0 || addStepLoading}
									variant="link"
									>{#if addStepLoading}
										<Loader class="animate-spin" />
									{/if} Add</Button
								>
								<Button
									onclick={() => {
										if (steps.state !== 'success') return;
										steps.data.splice(index, 1);
										steps = { ...steps };
										activeStepId = null;
									}}
									disabled={addStepLoading}
									variant="ghost">Discard</Button
								>
							</div>
						</div>
					{/if}
					<div class="flex items-center">
						<div class="h-px w-full flex-1 bg-muted"></div>
						<button
							onclick={() => {
								onAddNodeClick(index + 1, step.id, step.nextStepId);
							}}
							disabled={activeStepId !== null}
							class={`flex h-5 w-5 items-center justify-center rounded-full p-0 text-white ${activeStepId !== null ? 'bg-muted' : 'bg-green-500'}`}
							><Plus /></button
						>
						<div class="h-px w-full flex-1 bg-muted"></div>
					</div>
				{/each}
			{:else}
				<p>{steps.message}</p>
			{/if}
		</div>
	{:else if isValidId === 'pending'}
		<p class="py-r-pad">Loading...</p>
	{:else}
		<div class="flex w-full flex-col items-center justify-center p-4 text-center">
			<div class="text-3xl font-bold">404</div>
			<div class="font-serif">Not Found</div>
		</div>
	{/if}
</div>

<SideSheet
	title="Add Role"
	description={`Select the options below to add a role to step: ${
		steps.state === 'success' && steps.data.find((s) => s.id === activeStepId)?.name
	}`}
	{errorText}
	bind:sheetOpen
>
	<form onsubmit={handleSubmit} class="flex h-full flex-col gap-y-6">
		{#if errorText}
			<p class="text-sm text-red-500">{errorText}</p>
		{/if}
		<div class="grid gap-2">
			<Label for="name" class="text-end">ENTITY TYPE</Label>
			<SelectButton
				name="entity type"
				class="w-full"
				itemsList={[...ENTITIES]}
				bind:value={newRoleEntity}
				transformName={(value) => value.toUpperCase()}
			/>
		</div>
		{#if newRoleEntity !== null}
			{#if entityTypes.state === 'success'}
				<div class="grid gap-2">
					<Label for="name" class="text-end">{newRoleEntity!.toUpperCase()} TYPE</Label>
					<SelectButton
						name="entity type value"
						class="w-full"
						itemsList={entityTypes.data}
						optionName="name"
						optionValue="id"
						bind:value={newRoleEntityTypeId}
					/>
				</div>
			{:else}
				<p class="border border-muted-foreground bg-background px-3 py-1 text-base italic">
					{entityTypes.message}
				</p>
			{/if}
		{/if}
		{#if newRoleEntityTypeId !== null}
			{#if roles.state === 'success'}
				<div class="grid gap-2">
					<Label for="name" class="text-end">ROLE</Label>
					<SelectButton
						name="roles"
						class="w-full"
						itemsList={roles.data}
						optionName="name"
						optionValue="id"
						bind:value={newRoleId}
					/>
				</div>
				<Separator />
				<div class="grid gap-2">
					<Label for="name" class="text-end">TARGET GROUP APPROVAL CRITERIA</Label>
					{#each WORKFLOW_TARGET_GROUP_APPROVAL_CRITERIA as criteria}
						<div class="flex items-center gap-x-2">
							<input bind:group={worflowCriteria} value={criteria} type="radio" />
							<p class="uppercase">{criteria}</p>
						</div>
					{/each}
				</div>
			{:else}
				<p class="border border-muted-foreground bg-background px-3 py-1 text-base italic">
					{roles.message}
				</p>
			{/if}
		{/if}
		<Sheet.Footer class="sticky bottom-0 bg-background p-0">
			<Button disabled={addStepRoleLoading} type="submit"
				>{#if addStepRoleLoading}
					<Loader class="animate-spin" />
				{/if} Add</Button
			>
			<Sheet.Close class={buttonVariants({ variant: 'outline' })}>Close</Sheet.Close>
		</Sheet.Footer>
	</form>
</SideSheet>
