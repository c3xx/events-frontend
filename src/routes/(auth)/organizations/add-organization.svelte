<script lang="ts">
	import { createOrg, loadOrgs, loadOrgTypes } from '$lib/api/organizations';
	import DynamicSelectButton from '$lib/components/app/dynamic-select-button.svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index';
	import { addOrganizationState } from '$lib/global/organization.svelte';
	import type { OrganizationType, Organization } from '$lib/types';

	let errorText = $state('');

	let orgValue = $state('');
	let typeValue = $state('');

	async function handleSubmit(e: SubmitEvent) {
		try {
			errorText = '';
			e.preventDefault();
			const formData = new FormData(e.currentTarget as HTMLFormElement);

			const name = formData.get('name') as string;
			const organizationTypeId = Number(formData.get('type')) as number;
			const parentOrganizationId = Number(formData.get('org')) as number;

			if (await createOrg(name, organizationTypeId, parentOrganizationId)) {
				console.log('Organization Created');
				addOrganizationState.sheetOpen = false;
			}
		} catch (err: any) {
			errorText = err.message;
		}
	}
</script>

<Sheet.Root bind:open={addOrganizationState.sheetOpen}>
	<Sheet.Content class="w-full sm:min-w-100" side="right">
		<form onsubmit={handleSubmit}>
			<div class="overflow-auto">
				<Sheet.Header class="mb-xs border-b border-muted-foreground">
					<div class="flex flex-col">
						<h2 class="text-lg font-bold">Add Organization</h2>
						<h3 class="text-sm">
							Enter the details of the new organization. Click save when you're done.
						</h3>
					</div>
				</Sheet.Header>
				<div class="grid flex-1 auto-rows-min gap-6 px-4">
					{#if errorText}
						<p class="text-sm text-red-500">{errorText}</p>
					{/if}
					<div class="grid gap-3">
						<Label for="name" class="text-end">Name</Label>
						<Input class="primary-input" name="name" />
					</div>
					<div class="grid gap-3">
						<Label for="email" class="text-end">Type</Label>
						<DynamicSelectButton name="type" bind:value={typeValue} loadFn={loadOrgTypes} />
					</div>
					<div class="grid gap-3">
						<Label for="org" class="text-end">Parent Organization</Label>
						<DynamicSelectButton
							name="parent organization"
							bind:value={orgValue}
							loadFn={loadOrgs}
						/>
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
