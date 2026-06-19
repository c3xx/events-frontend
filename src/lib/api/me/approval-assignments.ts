import { api } from '$lib/api';
import type { ApiResponse, EventAssignment, PendingApprovalEvent } from '$lib/types';

export async function loadEventApprovalAssignments() {
	const res = await api
		.get('approval-assignments/events')
		.json<ApiResponse<PendingApprovalEvent[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadEventAssignments(eventId: number) {
	if (!eventId) {
		throw new Error('Event ID required');
		return;
	}
	const res = await api
		.get(`approval-assignments/events/${eventId}`)
		.json<ApiResponse<EventAssignment[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
