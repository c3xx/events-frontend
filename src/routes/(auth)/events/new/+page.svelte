<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Loader, Plus } from '@lucide/svelte';
	import type {
		CreateEventData,
		EventCategory,
		EventType,
		LoadedData,
		Organization,
		ParentableEvent
	} from '$lib/types';

	import { onMount } from 'svelte';
	import { loadOrgs } from '$lib/api/organizations';
	import { loadEventTypes } from '$lib/api/event-types';
	import { loadEventCategories } from '$lib/api/event-categories';
	import { createEvent, loadParentableEvents } from '$lib/api/events';
	import { authInfo } from '$lib/global/auth.svelte';
	import { goto } from '$app/navigation';
	import SelectButton from '$lib/components/app/select-button.svelte';

	let organizationId = $state<number | null>(null);
	let title = $state('');
	let typeId = $state<number | null>(null);
	let categoryId = $state<number | null>(null);
	let expectedParticipants = $state<number>(0);
	let requestDetails = $state('');
	let startsAt = $state('');
	let endsAt = $state('');
	let parentEventId = $state<number | null>(null);
	let belongsToParent = $state(false);

	let eventTypes = $state<LoadedData<EventType[]>>({
		state: 'pending',
		message: 'Loading event types...'
	});
	let eventCategories = $state<LoadedData<EventCategory[]>>({
		state: 'pending',
		message: 'Loading event categories...'
	});
	let parentableEvents = $state<LoadedData<ParentableEvent[]>>({
		state: 'pending',
		message: 'Loading parentable events...'
	});

	onMount(async () => {
		try {
			eventTypes = {
				state: 'success',
				data: await loadEventTypes()
			};
		} catch (err) {
			eventTypes = {
				state: 'failed',
				message: 'Failed to load event types'
			};
		}
		try {
			eventCategories = {
				state: 'success',
				data: await loadEventCategories()
			};
		} catch (err) {
			eventCategories = {
				state: 'failed',
				message: 'Failed to load event categories'
			};
		}
	});

	$effect(() => {
		if (authInfo.get() && authInfo.get()!.memberships.length > 0) {
			organizationId = authInfo.get()?.memberships[0].id!;
		}
	});

	$effect(() => {
		(async () => {
			parentableEvents = {
				state: 'pending',
				message: 'Loading events'
			};
			if (typeId !== null && organizationId !== null) {
				try {
					parentableEvents = {
						state: 'success',
						data: await loadParentableEvents(typeId, organizationId)
					};
				} catch (err) {
					parentableEvents = {
						state: 'failed',
						message: 'Failed to load parentable events'
					};
				}
			}
		})();
	});

	let errorText = $state('');
	let submitLoading = $state(false);

	function toISOString(date: string): string {
		return new Date(`${date}`).toISOString();
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (organizationId === null) {
			errorText = 'Please select an organization';
			return;
		}
		if (title === null || title.trim().length === 0) {
			errorText = 'Please enter a valid title';
			return;
		}
		if (expectedParticipants === null || isNaN(expectedParticipants) || expectedParticipants < 0) {
			errorText = 'Please enter a postive integer for Expected participants';
			return;
		}
		if (typeId === null) {
			errorText = 'Please select an event type';
			return;
		}
		if (categoryId === null) {
			errorText = 'Please select an event category';
			return;
		}
		if (startsAt === null) {
			errorText = 'Please select a start date';
			return;
		}
		if (endsAt === null) {
			errorText = 'Please select an end date';
			return;
		}
		errorText = '';
		try {
			submitLoading = true;
			const newEvent: CreateEventData = {
				organizationId,
				categoryId,
				typeId,
				endsAt: toISOString(endsAt),
				startsAt: toISOString(startsAt),
				title,
				expectedParticipants,
				requestDetails,
				parentEventId
			};
			const { id } = await createEvent(newEvent);
			await goto(`${id}`);
		} catch (err: any) {
			errorText = err.message ?? 'Something went wrong';
		} finally {
			submitLoading = false;
		}
	}
</script>

<div class="mx-auto flex w-full max-w-prose flex-col">
	<div class="sticky top-12 flex flex-col gap-y-sm bg-background p-r-pad">
		<h1 class="text-2xl leading-none">New Event</h1>
		{#if errorText}
			<p class="text-red-400">{errorText}</p>
		{/if}
	</div>
	<div class="flex flex-col gap-xs bg-background px-r-pad pb-r-pad">
		<p class="text-sm text-muted-foreground">
			Create a new event by providing its details, schedule, and classification. The information
			entered here will be used for approvals, venue allocation and organizer collaboration.
		</p>
		<div class="mt-sm grid gap-y-xxs bg-primary/10 p-sm">
			<p class="font-semibold">Organization</p>
			<p class="mt-1 text-sm">Select the organization under which the event is to created</p>
			{#if authInfo.get()?.memberships}
				{#if authInfo.get()?.memberships.length === 1}
					<p class="h-9 w-full border border-muted-foreground bg-background px-3 py-1">
						{authInfo.get()?.memberships.find((m) => m.id === organizationId)?.name}
					</p>
				{:else}
					<SelectButton
						name="organization"
						itemsList={authInfo.get()?.memberships!}
						optionName="name"
						optionValue="id"
						bind:value={organizationId}
						class="w-full"
					/>
				{/if}
			{/if}
		</div>
	</div>
	{#if organizationId}
		<form onsubmit={handleSubmit} class="flex flex-col gap-y-6 px-r-pad pb-r-pad">
			<div class="grid max-w-80 gap-y-xxs">
				<p>Title</p>
				<input
					required
					bind:value={title}
					class="flex h-9 w-full max-w-80 min-w-0 rounded-none bg-muted px-3 py-1 text-base shadow-xs ring-offset-background transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
				/>
			</div>
			<div class="grid gap-y-xxs">
				<p>Description</p>
				<textarea
					required
					bind:value={requestDetails}
					class="flex min-h-40 w-full min-w-0 rounded-none bg-muted px-3 py-1 text-base shadow-xs ring-offset-background transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
				></textarea>
			</div>
			<div class="grid max-w-80 gap-y-xxs">
				<p>Expected number of participants</p>
				<input
					type="number"
					required
					bind:value={expectedParticipants}
					class="flex h-9 w-full max-w-80 min-w-0 rounded-none bg-muted px-3 py-1 text-base shadow-xs ring-offset-background transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
				/>
			</div>
			<div class="grid gap-y-xxs">
				<p>Event Type</p>
				<p class="text-sm text-muted-foreground">
					Select the type of event. The selected type determines available workflows, venue
					policies, and organizer permissions.
				</p>
				{#if eventTypes.state === 'pending' || eventTypes.state === 'failed'}
					<p class="h-9 w-full max-w-80 bg-muted px-3 py-1 text-base">
						{eventTypes.message}
					</p>
				{:else if eventTypes.state === 'success'}
					<SelectButton
						name="event types"
						class="w-full max-w-80"
						itemsList={eventTypes.data}
						optionName="name"
						optionValue="id"
						bind:value={typeId}
					/>
				{/if}
			</div>
			<div class="grid gap-y-xxs">
				<p>Event Category</p>
				<p class="text-muted-foreground">Choose the category that best describes the event.</p>
				{#if eventCategories.state === 'pending' || eventCategories.state === 'failed'}
					<p class="h-9 w-full max-w-80 bg-muted px-3 py-1 text-base">
						{eventCategories.message}
					</p>
				{:else if eventCategories.state === 'success'}
					<SelectButton
						name="event categories"
						class="w-full max-w-80"
						itemsList={eventCategories.data}
						optionName="name"
						optionValue="id"
						bind:value={categoryId}
					/>
				{/if}
			</div>
			<div class="grid max-w-80 gap-y-xxs">
				<p>Start Date</p>
				<input
					type="date"
					required
					bind:value={startsAt}
					class="flex h-9 w-full max-w-80 min-w-0 rounded-none bg-muted px-3 py-1 text-base shadow-xs ring-offset-background transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
				/>
			</div>
			<div class="grid max-w-80 gap-y-xxs">
				<p>End Date</p>
				<input
					type="date"
					required
					bind:value={endsAt}
					class="flex h-9 w-full max-w-80 min-w-0 rounded-none bg-muted px-3 py-1 text-base shadow-xs ring-offset-background transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
				/>
			</div>
			<div class="flex flex-col">
				<div
					class={`${typeId === null || organizationId === null ? 'text-muted-foreground' : ''} flex items-center gap-xxs`}
				>
					<p>Is this event a part of another event?</p>
					<input
						type="checkbox"
						bind:checked={belongsToParent}
						disabled={typeId === null || organizationId === null}
					/>
				</div>
				{#if typeId === null || organizationId === null}
					<p class="text-xs italic">Select event type to select this option</p>
				{/if}
			</div>

			<div>
				{#if belongsToParent}
					<div class="grid gap-y-xxs">
						<p>Parent Event</p>
						<p class="text-muted-foreground">Select the event under which this event belongs</p>
						{#if parentableEvents.state === 'pending' || parentableEvents.state === 'failed'}
							<p class="h-9 w-full max-w-80 bg-muted px-3 py-1 text-base">
								{parentableEvents.message}
							</p>
						{:else if parentableEvents.state === 'success'}
							{#if parentableEvents.data.length === 0}
								<p class="h-9 w-full max-w-80 bg-muted px-3 py-1 text-base">No events found</p>
							{:else}
								<SelectButton
									name="parent events"
									class="w-full max-w-80"
									itemsList={parentableEvents.data}
									optionName="title"
									optionValue="id"
									bind:value={parentEventId}
								/>
							{/if}
						{/if}
					</div>
				{/if}
				<Button disabled={submitLoading} class="mt-r-pad w-full sm:w-min" type="submit"
					>{#if submitLoading}<Loader class="animate-spin" />
					{/if} Submit</Button
				>
			</div>
		</form>
	{/if}
</div>
