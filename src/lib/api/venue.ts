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
		throw new Error('Venue ID required');
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

export async function getVenueMemberByEmail(id: string, email: string) {
	if (!id) {
		throw new Error('Venue ID required');
	}
	if (!email) {
		throw new Error('Email ID required');
	}
	const res = await api
		.get(`venues/${id}/members?email=${email}`)
		.json<ApiResponse<EntityMember[]>>();
	if (res.success) {
		return res.data[0];
	} else {
		throw new Error(res.message);
	}
}

export async function updateVenueMemberRoles(id: string, userId: string, roleIds: string[]) {
	if (!id) {
		throw new Error('Venue ID required');
	}
	if (!userId) {
		throw new Error('User ID required');
	}
	const res = await api
		.put(`venues/${id}/members/${userId}`, {
			json: {
				roleIds: roleIds
			}
		})
		.json<ApiResponse<{ id: string; roleId: string }[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function deleteVenueMember(id: string, userId: string) {
	if (!id) {
		throw new Error('Venue ID required');
	}
	if (!userId) {
		throw new Error('User ID required');
	}
	const res = await api
		.delete(`venues/${id}/members/${userId}`)
		.json<ApiResponse<{ id: string; roleId: string }[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function addVenueTypeRole(parentId: string, name: string) {
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
