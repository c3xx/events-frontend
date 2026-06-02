import { api } from '$lib/api';
import type { ApiResponse, EventType } from '$lib/types';

export async function loadEventTypes() {
	const res = await api.get('event-types').json<ApiResponse<EventType[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function addEventType(name: string) {
	if (!name) {
		throw new Error('Name is required');
	}
	const res = await api.post('event-types', { json: { name } }).json<
		ApiResponse<{
			id: string;
		}>
	>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
