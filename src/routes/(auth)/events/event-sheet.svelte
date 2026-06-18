<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import type { CreateEventData, EventCategory, EventType, Organization, ParentableEvent } from '$lib/types';

	import { onMount } from 'svelte';
	import { loadOrgs } from '$lib/api/organizations';

	import DynamicSelectButton from '$lib/components/app/dynamic-select-button.svelte';
	import { loadEventTypes } from '$lib/api/event-types';
	import { loadEventCategories } from '$lib/api/event-categories';
	import { loadParentableEvents } from '$lib/api/events';

	let {
		open = $bindable(false),
		onadd
	}: {
		open?: boolean;
		onadd?: (eventData: CreateEventData) => void;
	} = $props();

	let organizationId = $state<string>('');
	let title = $state('');
	let typeId = $state<string>('');
	let categoryId = $state<string>('');
	let expectedParticipants = $state<number>(0);
	let requestDetails = $state('');
	let startsAt = $state('');
	let endsAt = $state('');
	let parentEventId = $state<number | null>(null);

	let orgs = $state<{ id: string; name: string }[]>([]);
	let eventTypes = $state<EventType[]>([]);
	let eventCategories = $state<EventCategory[]>([]);

	onMount(async () => {
		try {
			const [loadedOrgs, loadedTypes, loadedCats] = await Promise.all([
				loadOrgs(),
				loadEventTypes(),
				loadEventCategories()
			]);

			orgs = loadedOrgs;
			eventTypes = loadedTypes;
			eventCategories = loadedCats;

			if (orgs.length) organizationId = orgs[0].id;
			if (eventTypes.length) typeId = eventTypes[0].id.toString();
			if (eventCategories.length) categoryId = eventCategories[0].id.toString();
		} catch (err) {
			console.error('Failed to load dropdown data:', err);
		}
	});

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		onadd?.({
			organizationId: Number(organizationId),
			title,
			typeId: Number(typeId),
			categoryId: Number(categoryId),
			expectedParticipants,
			requestDetails,
			startsAt,
			endsAt,
			parentEventId
		});

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
							Enter the details of the new event. Click save when you're done.
						</h3>
					</div>
				</Sheet.Header>

				<div class="grid flex-1 auto-rows-min gap-6 px-4 py-4">

					<!-- Organization -->
					<div class="grid gap-3">
						<Label>Organization</Label>

						<DynamicSelectButton
							name="organizationId"
							initialText="Select Organization"
							size="full"
							bind:value={organizationId}
							loadFn={loadOrgs}
							mapOption={(org:Organization) => ({
								value: org.id.toString(),
								label: org.name
							})}
							
						/>
					</div>

					<!-- Title -->
					<div class="grid gap-3">
						<Label>Title</Label>
						<Input bind:value={title} required />
					</div>

					<!-- Event Type -->
					<div class="grid gap-3">
						<Label>Event Type</Label>

						<DynamicSelectButton
							name="typeId"
							initialText="Select Event Type"
							size="full"
							bind:value={typeId}
							loadFn={loadEventTypes}
							mapOption={(type:EventType) => ({
								value: type.id.toString(),
								label: type.name
							})}
						/>
					</div>

					<!-- Category -->
					<div class="grid gap-3">
						<Label>Category</Label>

						<DynamicSelectButton
							name="categoryId"
							initialText="Select Category"
							size="full"
							bind:value={categoryId}
							loadFn={loadEventCategories}
							mapOption={(cat:EventCategory) => ({
								value: cat.id.toString(),
								label: cat.name
							})}
						/>
					</div>

					<!-- Expected Participants -->
					<div class="grid gap-3">
						<Label>Expected Participants</Label>
						<Input type="number" bind:value={expectedParticipants} />
					</div>

					<!-- Description -->
					<div class="grid gap-3">
						<Label>Description</Label>
						<Input bind:value={requestDetails} />
					</div>

					<!-- Start -->
					<div class="grid gap-3">
						<Label>Start Date</Label>
						<Input type="date" bind:value={startsAt} />
					</div>

					<!-- End -->
					<div class="grid gap-3">
						<Label>End Date</Label>
						<Input type="date" bind:value={endsAt} />
					</div>

					<!-- Parent Event -->
					<div class="grid gap-3">
						<Label>Parent Event (Optional)</Label>
						<DynamicSelectButton
							name="parentEventId"
							initialText="Select Parent Event"
							size="full"
							bind:value={parentEventId}
							loadFn={() => loadParentableEvents({ typeId: typeId, orgId: organizationId })}
							mapOption={(event: ParentableEvent) => ({
								value: event.id.toString(),
								label: event.title
							})}
						/>
					</div>

				</div>
			</div>

			<Sheet.Footer class="border-t pt-4">
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