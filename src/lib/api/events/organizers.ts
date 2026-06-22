import { api } from '$lib/api';
import type { ApiResponse, EventOrganizerRole } from '$lib/types';

export async function addOrganizer(
	eventId: number,
	roleId: number,
	organizationId: number,
	role: EventOrganizerRole
) {
	if (!eventId) {
		throw new Error('Event ID is required');
	}
	if (!roleId) {
		throw new Error('Role ID is required');
	}
	if (!organizationId) {
		throw new Error('Organization ID is required');
	}
	if (!role) {
		throw new Error('Role is required');
	}
	const res = await api
		.post(`events/${eventId}/organizers/`, {
			json: { roleId, organizationId, intendedRole: role }
		})
		.json<ApiResponse<{ id: number }>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function removeOrganizer(eventId: number, organizerId: number) {
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
