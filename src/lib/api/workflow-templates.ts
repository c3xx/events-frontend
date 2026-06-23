import { api } from '$lib/api';
import type {
	ApiResponse,
	WorkflowTemplate,
	WorkflowTargetGroupApprovalCriteriaType
} from '$lib/types';

export async function loadWorkflowTemplates() {
	const res = await api.get('workflow-templates').json<ApiResponse<WorkflowTemplate[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadWorkflowTemplate(templateId: number) {
	if (!templateId) {
		throw new Error('template ID required');
	}
	const res = await api
		.get(`workflow-templates/${templateId}`)
		.json<ApiResponse<WorkflowTemplate>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadWorkflowTemplateSteps(templateId: number) {
	if (!templateId) {
		throw new Error('template ID required');
	}
	const res = await api
		.get(`workflow-templates/${templateId}/steps`)
		.json<ApiResponse<WorkflowTemplate['steps']>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadWorkflowTemplatesStepsRoles(templateId: number, stepId: number) {
	if (!templateId || !stepId) {
		throw new Error('template ID and Step ID are required');
	}
	const res = await api
		.get(`workflow-templates/${templateId}/steps/${stepId}/roles`)
		.json<ApiResponse<WorkflowTemplate['steps'][0]['roles']>>();
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
			id: number;
		}>
	>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function addWorkflowTemplateStep(
	templateId: number,
	name: string,
	previousStepId: number | null
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
				id: number;
				nextStepId: null | number;
			}>
		>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function addWorkflowTemplateStepRole(
	templateId: number,
	stepId: number,
	roleId: number,
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
	templateId: number,
	stepId: number,
	roleId: number
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
