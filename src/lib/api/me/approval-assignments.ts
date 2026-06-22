import { api } from '$lib/api';
import type { ApiResponse, EventAssignmentsAndDetails, PendingApprovalEvent } from '$lib/types';

export async function loadApprovalEvents() {
	const res = await api
		.get('me/approval-assignments/events')
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
	}
	const res = await api
		.get(`me/approval-assignments/events/${eventId}`)
		.json<ApiResponse<EventAssignmentsAndDetails>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function respondEventAssignments(
	eventId: number,
	assignmentIds: number[],
	decision: 'approved' | 'denied',
	remarks?: string | undefined
) {
	if (!eventId) {
		throw new Error('Event ID required');
	}
	if (!assignmentIds) {
		throw new Error('Assignment IDs required');
	}
	if (!decision) {
		throw new Error('Decision required');
	}
	const res = await api
		.patch(`me/approval-assignments/events/${eventId}`, {
			json: {
				assignmentIds,
				decision,
				remarks
			}
		})
		.json<ApiResponse<boolean>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
