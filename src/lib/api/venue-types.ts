import { api } from '$lib/api';
import type { ApiResponse, VenueType, Role } from '$lib/types';

export async function loadVenueTypes() {
	const res = await api.get('venue-types').json<ApiResponse<VenueType[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
