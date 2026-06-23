<script lang="ts">
	import { createOrg, loadOrgs, loadOrgTypes } from '$lib/api/organizations';
	import DynamicSelectButton from '$lib/components/app/dynamic-select-button.svelte';
	import SideSheet from '$lib/components/app/side-sheet.svelte';
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

<SideSheet
	{errorText}
	title="Add Organization"
	description="Enter the details of the new organization. Click save when you're done"
	bind:sheetOpen={addOrganizationState.sheetOpen}
>
	<form class="flex h-full flex-col gap-y-sm">
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
			<DynamicSelectButton name="parent organization" bind:value={orgValue} loadFn={loadOrgs} />
		</div>
		<Sheet.Footer class="sticky bottom-0 bg-background p-0">
			<Button type="submit">Save changes</Button>
			<Sheet.Close class={buttonVariants({ variant: 'outline' })}>Close</Sheet.Close>
		</Sheet.Footer>
	</form>
</SideSheet>
