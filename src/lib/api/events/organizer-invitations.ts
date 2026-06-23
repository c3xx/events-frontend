import { api } from '$lib/api';
import type { ApiResponse, EventOrganizerInvitation, EventOrganizerRole } from '$lib/types';

export async function loadOrganizerInvitations(eventId: number) {
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

export async function removeOrganizerInvitation(eventId: number, invitationId: number) {
	if (!eventId) {
		throw new Error('Event ID is required');
	}
	if (!invitationId) {
		throw new Error('Invitation ID is required');
	}
	const res = await api
		.delete(`events/${eventId}/organizer-invitations/${invitationId}`, { json: { userRoleId: 3 } })
		.json<ApiResponse<{ id: number }>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function respondOrganizerInvitations(
	eventId: number,
	invitationId: number,
	status: 'accepted' | 'rejected'
) {
	if (!eventId) {
		throw new Error('Event ID is required');
	}
	if (!invitationId) {
		throw new Error('Invitation ID is required');
	}
	if (!status) {
		throw new Error('Status (Accepted or Rejected) is required');
	}
	const res = await api
		.patch(`events/${eventId}/organizer-invitations/${invitationId}`, {
			json: { userRoleId: 4, status }
		})
		.json<ApiResponse<{ id: number }>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
