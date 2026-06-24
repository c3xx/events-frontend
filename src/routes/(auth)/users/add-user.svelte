<script lang="ts">
	import { createUser } from '$lib/api/users';
	import SideSheet from '$lib/components/app/side-sheet.svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import type { LoadedData, User } from '$lib/types';
	import { Loader } from '@lucide/svelte';

	let form: HTMLFormElement;
	let {
		open = $bindable(false),
		users = $bindable()
	}: { open: boolean; users: LoadedData<User[]> } = $props();

	let errorText = $state('');
	let addLoading = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (users.state !== 'success') return;
		try {
			addLoading = true;
			const formData = new FormData(e.currentTarget as HTMLFormElement);

			const name = formData.get('name')?.toString().trim();
			const email = formData.get('email') as string;

			if (!name || name.length === 0) {
				errorText = 'Enter a valid name';
				return;
			}
			if (!email || email.length === 0) {
				errorText = 'Enter a valid name';
				return;
			}
			errorText = '';
			const { id } = await createUser(name, email);
			users = {
				state: 'success',
				data: [
					...users.data,
					{ id: id, email: email, fullName: name, isActive: false, roles: [], type: 'end_user' }
				]
			};
			form.reset();
			open = false;
		} catch (err: any) {
			errorText = err.message;
		} finally {
			addLoading = false;
		}
	}
</script>

<SideSheet
	title="Add User"
	description="Enter the details of the new user. Click save when you're done"
	{errorText}
	bind:sheetOpen={open}
>
	<form bind:this={form} class="flex h-full flex-col gap-y-6" onsubmit={handleSubmit}>
		<div class="grid gap-3">
			<Label for="name" class="text-end">Name</Label>
			<Input class="primary-input" name="name" />
		</div>
		<div class="grid gap-3">
			<Label for="email" class="text-end">Email</Label>
			<Input class="primary-input" name="email" />
		</div>
		<Sheet.Footer class="sticky bottom-0 bg-background p-0">
			<Button disabled={addLoading} type="submit"
				>{#if addLoading}
					<Loader size="15" class="animate-spin" />
				{/if} Save changes</Button
			>
			<Sheet.Close class={buttonVariants({ variant: 'outline' })}>Close</Sheet.Close>
		</Sheet.Footer>
	</form>
</SideSheet>
