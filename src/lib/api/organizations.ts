import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { api } from '$lib/api';
import type {
	ApiResponse,
	Organization,
	EntityMember,
	OrganizationType,
	Role,
	User
} from '$lib/types';

export async function getOrgById(id: string) {
	if (!id) {
		throw new Error('Organization ID required');
	}
	const res = await api.get(`organizations/${id}`).json<ApiResponse<Organization>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadOrgs() {
	const res = await api.get('organizations').json<ApiResponse<Organization[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadOrgTypes() {
	const res = await api.get('organization-types').json<ApiResponse<OrganizationType[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function createOrg(
	name: string,
	organizationTypeId: string,
	parentOrganizationId: string
) {
	if (!name || !organizationTypeId) {
		throw new Error('Name and Type ID are required fields');
	}

	const res = await api
		.post('organizations', {
			json: { name, organizationTypeId, parentOrganizationId }
		})
		.json<ApiResponse<{ id: string }>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function addOrgType(name: string) {
	if (!name) {
		throw new Error('Name is required');
	}
	const res = await api.post('organization-types', { json: { name } }).json<
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

export async function addChildOrgType(id: string, childId: string) {
	if (!id || !childId) {
		throw new Error('Parent ID and Child ID are required');
	}
	const res = await api
		.post(`organization-types/${id}/children/${childId}`, { json: { name } })
		.json<
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

export async function loadChildrenOrgType(id: string) {
	if (!id) {
		throw new Error('Parent ID is required');
	}
	const res = await api.get(`organization-types/${id}/children`).json<
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

export async function loadRolesOrgType(id: string) {
	if (!id) {
		throw new Error('Parent ID is required');
	}
	const res = await api.get(`organization-types/${id}/roles`).json<ApiResponse<Role[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function addRole(parentId: string, name: string) {
	if (!parentId || !name) {
		throw new Error('Parent ID and Name are required');
	}
	const res = await api.post(`organization-types/${parentId}/roles`, { json: { name } }).json<
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

export async function loadOrganizationMembers(id: string) {
	if (!id) {
		throw new Error('Organization ID is required');
	}
	const res = await api.get(`organizations/${id}/members`).json<ApiResponse<EntityMember[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function getOrganizationMemberByEmail(id: string, email: string) {
	if (!id) {
		throw new Error('Organization ID required');
	}
	if (!email) {
		throw new Error('Email ID required');
	}
	const res = await api
		.get(`organizations/${id}/members?email=${email}`)
		.json<ApiResponse<EntityMember[]>>();
	if (res.success) {
		return res.data[0];
	} else {
		throw new Error(res.message);
	}
}

export async function updateOrganizationMemberRoles(id: string, userId: string, roleIds: string[]) {
	if (!id) {
		throw new Error('Organization ID required');
	}
	if (!userId) {
		throw new Error('User ID required');
	}
	const res = await api
		.put(`organizations/${id}/members/${userId}`, {
			json: {
				roleIds: roleIds
			}
		})
		.json<ApiResponse<{ id: string; roleId: string }[]>>();
	if (res.success) {
		return res.data; //fix this later, remove index as this should be a single value
	} else {
		throw new Error(res.message);
	}
}

export async function deleteOrganizationMember(id: string, userId: string) {
	if (!id) {
		throw new Error('Organization ID required');
	}
	if (!userId) {
		throw new Error('User ID required');
	}
	const res = await api
		.delete(`organizations/${id}/members/${userId}`)
		.json<ApiResponse<{ id: string; roleId: string }[]>>();
	if (res.success) {
		return res.data; //fix this later, remove index as this should be a single value
	} else {
		throw new Error(res.message);
	}
}

// export async function addMemberToOrganization(id: string, userId: string, roleIds: string[]) {
// 	if (!id) {
// 		throw new Error('Organization ID is required');
// 	}
// 	if (!userId) {
// 		throw new Error('User ID is required');
// 	}
// 	const res = await api
// 		.post(`organizations/${id}/members`, {
// 			json: {
// 				userId,
// 				roleIds
// 			}
// 		})
// 		.json<ApiResponse<{ id: number }>>();

// 	if (res.success) {
// 		return res.data;
// 	} else {
// 		throw new Error(res.message);
// 	}
// }
