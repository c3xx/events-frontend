import type { Venue } from '$lib/types';

export const venueFacilitiesState = $state<{ selectedVenue: Venue | null; sheetOpen: boolean }>({
	selectedVenue: null,
	sheetOpen: false
});
