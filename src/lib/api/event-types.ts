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

export async function getEventType(id: number) {
	const res = await api.get(`event-types/${id}`).json<
		ApiResponse<
			EventType & {
				workflowTemplateId: number;
			}
		>
	>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function createEventType(
	name: string,
	venuePolicy: string,
	collaborationPolicy: string,
	workflowTemplateId: number
) {
	const res = await api
		.post('event-types', {
			json: {
				name,
				venuePolicy,
				collaborationPolicy,
				workflowTemplateId
			}
		})
		.json<ApiResponse<{ id: number }>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function deleteEventType(id: number) {
	const res = await api.delete(`event-types/${id}`).json<ApiResponse<true>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadEventTypeChildren(parentId: number) {
	const res = await api
		.get(`event-types/${parentId}/children`)
		.json<ApiResponse<{ id: number; name: string }[]>>();
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
			id: number;
		}>
	>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function addEventTypeChild(parentId: number, childId: number) {
	const res = await api
		.post(`event-types/${parentId}/children/${childId}`)
		.json<ApiResponse<{ parentTypeId: number; childTypeId: number }>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function removeEventTypeChild(parentId: number, childId: number) {
	const res = await api
		.delete(`event-types/${parentId}/children/${childId}`)
		.json<ApiResponse<true>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
