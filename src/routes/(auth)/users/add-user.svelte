<script lang="ts">
	import { createUser } from '$lib/api/users';
	import SideSheet from '$lib/components/app/side-sheet.svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';

	let { open = $bindable(false) }: { open: boolean } = $props();

	let errorText = $state('');

	async function handleSubmit(e: SubmitEvent) {
		try {
			errorText = '';
			e.preventDefault();
			const formData = new FormData(e.currentTarget as HTMLFormElement);

			const name = formData.get('name') as string;
			const email = formData.get('email') as string;

			if (await createUser(name, email)) {
				console.log('User Added');
				open = false;
			}
		} catch (err: any) {
			errorText = err.message;
		}
	}
</script>

<SideSheet
	title="Add User"
	description="Enter the details of the new user. Click save when you're done"
	{errorText}
	bind:sheetOpen={open}
>
	<form class="flex h-full flex-col gap-y-6" onsubmit={handleSubmit}>
		<div class="grid gap-3">
			<Label for="name" class="text-end">Name</Label>
			<Input class="primary-input" name="name" />
		</div>
		<div class="grid gap-3">
			<Label for="email" class="text-end">Email</Label>
			<Input class="primary-input" name="email" />
		</div>
		<Sheet.Footer class="sticky bottom-0 bg-background p-0">
			<Button type="submit">Save changes</Button>
			<Sheet.Close class={buttonVariants({ variant: 'outline' })}>Close</Sheet.Close>
		</Sheet.Footer>
	</form>
</SideSheet>
