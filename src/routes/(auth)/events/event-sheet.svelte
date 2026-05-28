<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';

	let {
		open = $bindable(false),
		onadd
	}: {
		open?: boolean;
		onadd?: (eventData: {
			title: string;
			category: string;
			startsAt: string;
		}) => void;
	} = $props();

	let title = $state('');
	let category = $state('');
	let startsAt = $state('');

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		onadd?.({
			title,
			category,
			startsAt
		});

		title = '';
		category = '';
		startsAt = '';

		open = false;
	}
</script>
<Sheet.Root bind:open>
	<Sheet.Content class="w-full sm:min-w-100" side="right">
		<form onsubmit={handleSubmit} class="flex h-full flex-col">
			<div class="overflow-auto flex-1">
				<Sheet.Header class="mb-xs border-b border-muted-foreground">
					<div class="flex flex-col">
						<h2 class="text-lg font-bold">Add Event</h2>

						<h3 class="text-sm">
							Enter the details of the new event. Click create when you're done.
						</h3>
					</div>
				</Sheet.Header>

				<div class="grid flex-1 auto-rows-min gap-6 px-4 py-4">
					<div class="grid gap-3">
						<Label for="title" class="text-end">
							Title
						</Label>

						<Input
							class="primary-input"
							name="title"
							bind:value={title}
							required
						/>
					</div>

					<div class="grid gap-3">
						<Label for="category" class="text-end">
							Category
						</Label>

						<Input
							class="primary-input"
							name="category"
							bind:value={category}
						/>
					</div>

					<div class="grid gap-3">
						<Label for="startsAt" class="text-end">
							Starts At
						</Label>

						<Input
							class="primary-input"
							name="startsAt"
							type="datetime-local"
							bind:value={startsAt}
						/>
					</div>
				</div>
			</div>

			<Sheet.Footer>
				<Button type="submit">
					Create Event
				</Button>

				<Sheet.Close class={buttonVariants({ variant: 'outline' })}>
					Cancel
				</Sheet.Close>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>