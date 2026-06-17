import { api } from '$lib/api';
import type { ApiResponse } from '$lib/types';

export async function submitEvent(eventId: string) {
	if (!eventId) {
		throw new Error('Event ID is required');
	}
	const res = await api.post(`events/${eventId}/submit`).json<ApiResponse<{ id: number }>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
