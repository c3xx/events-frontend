import { api } from '$lib/api';
import type {
	ApiResponse,
	Venue,
	VenueFacilities,
	VenueMember,
	CreateVenueData,
	Role,
	EntityMember
} from '$lib/types';

export async function getVenueById(id: string) {
	if (!id) {
		throw new Error('Organization ID required');
	}
	const res = await api.get(`venues/${id}`).json<ApiResponse<Venue>>();
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
	const res = await api.get(`venue-types/${id}/roles`).json<ApiResponse<Role[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadVenues() {
	const res = await api.get('venues').json<ApiResponse<Venue[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function createVenue(data: CreateVenueData) {
	const res = await api
		.post('venues', {
			json: data
		})
		.json<ApiResponse<Venue>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadVenueMembers(id: string) {
	if (!id) {
		throw new Error('Venue ID is required');
	}
	const res = await api.get(`venues/${id}/members`).json<ApiResponse<EntityMember[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function addMemberToVenue(id: string, memberData: { userId: number; roleId: number }) {
	const res = await api
		.post(`venues/${id}/members`, {
			json: memberData
		})
		.json<ApiResponse<VenueMember>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function getVenueFacilities(id: string) {
	const res = await api.get(`venues/${id}/facilities`).json<ApiResponse<VenueFacilities[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function setVenueFacilities(id: string, facilityIds: number[]) {
	const res = await api
		.put(`venues/${id}/facilities`, {
			json: { facilityId: facilityIds }
		})
		.json<ApiResponse<any>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
