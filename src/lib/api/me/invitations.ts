import { api } from '$lib/api';
import type { ApiResponse, PendingInvitation, PendingInvitationDetailed } from '$lib/types';

export async function loadPendingInvitations() {
	const res = await api.get('me/invitations').json<ApiResponse<PendingInvitation[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadPendingInvitation(invitationId: number) {
	if (!invitationId) {
		throw new Error('Invitation ID required');
	}
	const res = await api
		.get(`me/invitations/${invitationId}`)
		.json<ApiResponse<PendingInvitationDetailed>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function respondToInvitation(
	invitationId: number,
	roleId: number,
	status: 'accepted' | 'rejected'
) {
	if (!invitationId) {
		throw new Error('Invitation ID required');
	}
	if (!roleId) {
		throw new Error('Role ID required');
	}
	if (!status) {
		throw new Error('Status required');
	}
	const res = await api
		.patch(`me/invitations/${invitationId}`, {
			json: {
				roleId,
				status
			}
		})
		.json<ApiResponse<boolean>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
