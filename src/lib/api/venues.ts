import { api } from '$lib/api';
import type { ApiResponse, VenueType } from '$lib/types';

export async function loadVenueTypes() {
	const res = await api.get('venue-types').json<ApiResponse<VenueType[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function addVenueType(name: string) {
	if (!name) {
		throw new Error('Name is required');
	}
	const res = await api.post('venue-types', { json: { name } }).json<
		ApiResponse<{
			id: string;
			name: string;
		}>
	>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function addChildVenueType(id: string, childId: string) {
	if (!id || !childId) {
		throw new Error('Parent ID and Child ID are required');
	}
	const res = await api.post(`venue-types/${id}/children/${childId}`, { json: { name } }).json<
		ApiResponse<{
			parentTypeId: string;
			childTypeId: string;
		}>
	>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadChildrenVenueType(id: string) {
	if (!id) {
		throw new Error('Parent ID is required');
	}
	const res = await api.get(`venue-types/${id}/children`).json<
		ApiResponse<
			{
				id: string;
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

export async function loadRolesVenueType(id: string) {
	if (!id) {
		throw new Error('Parent ID is required');
	}
	const res = await api.get(`venue-types/${id}/roles`).json<
		ApiResponse<
			{
				id: string;
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

export async function addVenueRole(parentId: string, name: string) {
	if (!parentId || !name) {
		throw new Error('Parent ID and Name are required');
	}
	const res = await api.post(`venue-types/${parentId}/roles`, { json: { name } }).json<
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
