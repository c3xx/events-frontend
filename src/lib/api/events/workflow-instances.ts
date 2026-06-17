import { api } from '$lib/api';
import type { ApiResponse, WorkflowInstance } from '$lib/types';

export async function loadEventWorkflowsLatest(eventId: string) {
	if (!eventId) {
		throw new Error('Event ID is required');
	}
	const res = await api
		.get(`events/${eventId}/workflows/latest`)
		.json<ApiResponse<WorkflowInstance>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadEventWorkflow(eventId: string, workflowId: number) {
	if (!eventId) {
		throw new Error('Event ID is required');
	}
	if (!workflowId) {
		throw new Error('Workflow ID is required');
	}
	const res = await api
		.get(`events/${eventId}/workflows/${workflowId}`)
		.json<ApiResponse<WorkflowInstance>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadEventWorkflows(eventId: string) {
	if (!eventId) {
		throw new Error('Event ID is required');
	}
	const res = await api.get(`events/${eventId}/workflows/`).json<ApiResponse<WorkflowInstance[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
