import type { Organization } from '$lib/types';

export const addOrganizationState = $state<{
	selectedOrganization: Organization | null;
	sheetOpen: boolean;
}>({
	selectedOrganization: null,
	sheetOpen: false
});
