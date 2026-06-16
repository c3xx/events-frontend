import { api } from '$lib/api';
import type { ApiResponse, EventOrganizerRole } from '$lib/types';

export async function addOrganizer(
	eventId: string,
	organizationId: string,
	role: EventOrganizerRole
) {
	if (!eventId) {
		throw new Error('Event ID is required');
	}
	if (!organizationId) {
		throw new Error('Organization ID is required');
	}
	if (!role) {
		throw new Error('Role is required');
	}
	const res = await api
		.post(`events/${eventId}/organizers/`, {
			json: { userRoleId: 3, organizationId, intendedRole: role }
		})
		.json<ApiResponse<{ id: number }>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function removeOrganizer(eventId: string, organizerId: string) {
	if (!eventId) {
		throw new Error('Event ID is required');
	}
	if (!organizerId) {
		throw new Error('Organizer ID is required');
	}
	const res = await api
		.delete(`events/${eventId}/organizers/${organizerId}`)
		.json<ApiResponse<{ id: number }>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
