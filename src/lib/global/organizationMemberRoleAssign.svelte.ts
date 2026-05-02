import type { OrganizationMember } from '$lib/types';

export const organisationMemberRoleAssignState = $state<{ selectedMember: OrganizationMember | null; assignSheetOpen: boolean }>({
    selectedMember: null,
    assignSheetOpen: false
});
