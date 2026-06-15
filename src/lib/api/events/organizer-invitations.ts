import { api } from '$lib/api';
import type { ApiResponse, EventOrganizerInvitation } from '$lib/types';

export async function loadOrganizerInvitations(eventId: string) {
	if (!eventId) {
		throw new Error('Event ID is required');
	}
	const res = await api
		.get(`events/${eventId}/organizer-invitations/`)
		.json<ApiResponse<EventOrganizerInvitation[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
