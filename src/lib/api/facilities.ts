import { api } from '$lib/api';
import type { ApiResponse } from '$lib/types';

export async function loadFacilities() {
	const res = await api.get('facilities').json<
		ApiResponse<
			{
				id: number;
				name: string;
			}[]
		>
	>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function addFacility(name: string) {
	if (!name) {
		throw new Error('Name is required');
	}
	const res = await api.post('facilities', { json: { name } }).json<
		ApiResponse<{
			id: number;
		}>
	>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
