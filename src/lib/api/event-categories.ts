import { api } from '$lib/api';
import type { ApiResponse, EventCategory } from '$lib/types';

export async function loadEventCategories() {
	const res = await api.get('event-categories').json<ApiResponse<EventCategory[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function addEventCategory(name: string) {
	if (!name) {
		throw new Error('Name is required');
	}
  
	const res = await api.post('event-categories', { json: { name } }).json<
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
