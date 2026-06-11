import { api } from '$lib/api';
import type { ApiResponse, Workflow, WorkflowTargetGroupApprovalCriteriaType } from '$lib/types';

export async function loadWorkflowTemplates() {
	const res = await api.get('workflow-templates').json<ApiResponse<Workflow[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadWorkflowTemplate(templateId: string) {
	if (!templateId) {
		throw new Error('template ID required');
	}
	const res = await api.get(`workflow-templates/${templateId}`).json<ApiResponse<Workflow>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadWorkflowTemplateSteps(templateId: string) {
	if (!templateId) {
		throw new Error('template ID required');
	}
	const res = await api
		.get(`workflow-templates/${templateId}/steps`)
		.json<ApiResponse<Workflow['steps']>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadWorkflowTemplatesStepsRoles(templateId: string, stepId: string) {
	if (!templateId || !stepId) {
		throw new Error('template ID and Step ID are required');
	}
	const res = await api
		.get(`workflow-templates/${templateId}/steps/${stepId}/roles`)
		.json<ApiResponse<Workflow['steps'][0]['roles']>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function addWorkflowTemplate(name: string) {
	if (!name) {
		throw new Error('Name is required');
	}
	const res = await api.post(`workflow-templates/`, { json: { name } }).json<
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

export async function addWorkflowTemplateStep(
	templateId: string,
	name: string,
	previousStepId: string | null
) {
	if (!templateId) {
		throw new Error('Template ID required');
	}
	if (!name) {
		throw new Error('Name is required');
	}
	const res = await api
		.post(`workflow-templates/${templateId}/steps/`, { json: { name, previousStepId } })
		.json<
			ApiResponse<{
				id: string;
				nextStepId: null | string;
			}>
		>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function addWorkflowTemplateStepRole(
	templateId: string,
	stepId: string,
	roleId: string,
	targetGroupApprovalCriteria: WorkflowTargetGroupApprovalCriteriaType
) {
	if (!templateId) {
		throw new Error('Template ID required');
	}
	if (!stepId) {
		throw new Error('Step ID required');
	}
	if (!roleId) {
		throw new Error('Role ID required');
	}
	if (!targetGroupApprovalCriteria) {
		throw new Error('Target Group Approval Criteria required');
	}
	const res = await api
		.post(`workflow-templates/${templateId}/steps/${stepId}/roles`, {
			json: { roleId, targetGroupApprovalCriteria }
		})
		.json<ApiResponse<boolean>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function deleteWorkflowTemplateStepRole(
	templateId: string,
	stepId: string,
	roleId: string
) {
	if (!templateId) {
		throw new Error('Template ID required');
	}
	if (!stepId) {
		throw new Error('Step ID required');
	}
	if (!roleId) {
		throw new Error('Role ID required');
	}
	const res = await api
		.delete(`workflow-templates/${templateId}/steps/${stepId}/roles/${roleId}`)
		.json<ApiResponse<boolean>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
