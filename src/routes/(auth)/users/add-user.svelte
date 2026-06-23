<script lang="ts">
	import { createUser } from '$lib/api/users';
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

<Sheet.Root bind:open>
	<Sheet.Content class="w-full sm:min-w-100" side="right">
		<form onsubmit={handleSubmit}>
			<div class="overflow-auto">
				<Sheet.Header class="mb-xs border-b border-muted-foreground">
					<div class="flex flex-col">
						<h2 class="text-lg font-bold">Add User</h2>
						<h3 class="text-sm">Enter the details of the new user. Click save when you're done.</h3>
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
						<Label for="email" class="text-end">Email</Label>
						<Input class="primary-input" name="email" />
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
