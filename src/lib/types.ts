import type { Snippet } from 'svelte';

export type Workflow = {
	id: string;
	name: string;
	steps: {
		id: string;
		name: string;
		nextStepId: string | null;
		roles: {
			targetGroupApprovalCriteria: WorkflowTargetGroupApprovalCriteriaType;
			role: {
				id: string;
				name: string;
				scope: { type: EntityType; kindId: string; kindName: string };
			};
		}[];
	}[];
};

export const ENTITIES = ['organization', 'venue'] as const;
export type EntityType = (typeof ENTITIES)[number];

export type EntityMember = {
	id: string;
	fullName: string;
	email: string;
	roles: {
		id: string;
		roleId: string;
		isActive: boolean;
	}[];
};

type EntityRole = {
	id: string;
	isActive: boolean;
	roleId: string;
	managedEntityId: string;
};

export type User = {
	id: string;
	fullName: string;
	email: string;
	type: 'admin' | 'end_user';
	isActive: boolean;
	roles: EntityRole[];
};

export type Venue = {
	id: string;
	name: string;
	venueTypeId: string;
	organizationId: string;
	maxCapacity: string;
	accessLevel: string;
	isAvailable: boolean;
	unavailabilityReason: string | null;
	isActive: boolean;
};

// TODO: Match types
export type Organization = {
	id: string;
	name: string;
	organizationTypeId: string;
	parentOrganizationId: string | null;
	isActive: boolean;
};

export type Role = {
	id: string;
	name: string;
};

export type AssignRole = {
	userId: string;
	roleId: string | null;
	organizationId: string | null;
};

export type OrganizationType = {
	id: string;
	name: string;
	children: {
		childTypeId: string;
	}[];
	selectedChildId: string;
	selectedRoleId: string;
};

export type VenueType = {
	id: string;
	name: string;
	children: {
		childTypeId: string;
	}[];
	selectedChildId: string;
	selectedRoleId: string;
};

export type ChildType = {
	id: string;
	name: string;
};

export type RoleType = {
	id: string;
	name: string;
};

type PermissionCode =
	| 'user:create'
	| 'user:modify'
	| 'user:delete'
	| 'organization:create'
	| 'organization:modify'
	| 'organization:delete'
	| 'organization:assign_users';

export type PermissionType = {
	id: string;
	code: PermissionCode;
	description: string;
};

export type PermissionChildType = {
	id: string;
	title: string;
	description: string;
	status: boolean;
};

export type AuthUser = {
	user: {
		id: string;
		fullName: string;
		email: string;
	} | null;
	permissions: string[]; //TODO: change data type
};

export type ApiSuccess<T> = {
	success: true;
	data: T;
};

export type ColumnDef<T> = {
	key: keyof T | null;
	header?: string;
	type: 'text' | 'link' | 'button' | 'transformValue';
	onclick?: (row: T) => void;
	transformValue?: (row: T, value: string) => string;
	href?: string;
	visiblity?: boolean;
	//pass the first half of the link here
	// example: if link localhost:5173/organisations/:id
	// pass localhost:5173/organisations
};

export type TableProps<T> = {
	columns: ColumnDef<T>[];
	data: T[];
	selectable?: boolean;
	onSelectionChange?: (rows: T[]) => void;
	optionsList?: ActionMenuItem<T>[];
	expandable?: boolean;
	expandedContent?: Snippet<[T]>;
};

export type ActionMenuItem<T> = {
	id: string;
	name: string;
	onclick: (selectedItem: T) => void;
};

export enum ERROR_CODES {
	// todo: sort
	validation_error = 'VALIDATION_ERROR',
	user_not_found = 'USER_NOT_FOUND',
	unauthorized = 'UNAUTHORIZED',
	already_exists = 'ALREADY_EXISTS',
	internal_server_error = 'INTERNAL_SERVER_ERROR',
	invalid_related_entity = 'INVALID_RELATED_ENTITY', // todo: what? make this better
	forbidden = 'FORBIDDEN'
}

export type ApiFailure = {
	success: false;
	code: ERROR_CODES;
	message: string;
};

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiFailure;

export type LoadedData<T> = LoadingPending | LoadingSuccess<T> | LoadingFailure;

type LoadingSuccess<T> = {
	state: 'success';
	data: T;
};

type LoadingPending = {
	state: 'pending';
	message: string;
};

type LoadingFailure = {
	state: 'failed';
	message: string;
};

export type Facility = {
	id: number;
	name: string;
};

export type EventStatus = 'draft' | 'pending' | 'approved' | 'cancelled' | 'overridden';
export type EventOrganizerRole = 'host' | 'co_host';
export type EventTypeVenuePolicy = 'required' | 'optional' | 'forbidden';
export type EventTypeCollaborationPolicy = 'required' | 'optional' | 'forbidden';

export const EVENT_TYPE_VENUE_POLICY = ['required', 'optional', 'forbidden'] as const;
export const EVENT_TYPE_COLLABORATION_POLICY = ['required', 'optional', 'forbidden'] as const;

export type EventTypeVenuePolicyType = (typeof EVENT_TYPE_VENUE_POLICY)[number];
export type EventTypeCollaborationPolicyType = (typeof EVENT_TYPE_COLLABORATION_POLICY)[number];

export type EventType = {
	id: number;
	name: string;
	isActive: boolean;
	venuePolicy: EventTypeVenuePolicy;
	collaborationPolicy: EventTypeCollaborationPolicy;
};

export type EventCategory = {
	id: number;
	name: string;
};

export type EventOrganizer = {
	id: number;
	organization: { id: number; name: string };
	role: EventOrganizerRole;
};

export type EventVenueAllotment = {
	id: number;
	startsAt: string;
	endsAt: string;
	venue: { id: number; name: string };
};

export type Event = {
	id: number;
	title: string;
	type: { id: number; name: string };
	category: { id: number; name: string };
	status: EventStatus;
	parentEvent: { id: number; title: string } | null;
	parentEventId: number | null;
	startsAt: string;
	endsAt: string;
	expectedParticipants: number;
	requestDetails: string;
	organizers: EventOrganizer[];
};

export type EventSummary = {
	id: number;
	title: string;
	type: { id: number; name: string };
	category: { id: number; name: string };
	status: EventStatus;
	parentEvent: { id: number; title: string } | null;
	startsAt: string;
	organizers: EventOrganizer[];
};

export type EventDetail = {
	id: number;
	title: string;
	expectedParticipants: number;
	requestDetails: string;
	status: EventStatus;
	parentEventId: number | null;
	startsAt: string;
	endsAt: string;
	createdAt: string;
	updatedAt: string;
	type: { id: number; name: string };
	category: { id: number; name: string };
	parentEvent: { id: number; title: string } | null;
	organizers: EventOrganizer[];
	venueAllotments: EventVenueAllotment[];
	report: { id: number; details: string; submittedAt: string } | null;
};

export type CreateEventData = {
	organizationId: number;
	title: string;
	typeId: number;
	categoryId: number;
	expectedParticipants: number;
	requestDetails: string;
	parentEventId?: number | null;
	startsAt: string;
	endsAt: string;
};

export type UpdateEventData = Partial<Omit<CreateEventData, 'organizationId'>>;

export type CreateVenueAllotmentData = {
	venueId: number;
	startsAt: string;
	endsAt: string;
};
=======
export type EventType = {
	id: string;
	name: string;
	workflowId: string;
	venuePolicy: EventTypeVenuePolicyType;
	collaborationPolicy: EventTypeCollaborationPolicyType;
};

export type EventCategory = {
	id: string;
	name: string;
};

export const EVENT_TYPE_VENUE_POLICY = ['required', 'optional', 'forbidden'] as const;
export const EVENT_TYPE_COLLABORATION_POLICY = ['required', 'optional', 'forbidden'] as const;
export const WORKFLOW_TARGET_GROUP_APPROVAL_CRITERIA = ['all', 'any'] as const;

export type EventTypeVenuePolicyType = (typeof EVENT_TYPE_VENUE_POLICY)[number];
export type EventTypeCollaborationPolicyType = (typeof EVENT_TYPE_COLLABORATION_POLICY)[number];
export type WorkflowTargetGroupApprovalCriteriaType =
	(typeof WORKFLOW_TARGET_GROUP_APPROVAL_CRITERIA)[number];

export type VenueFacilities = {
	id: number;
	facilityId: number;
	facilityName: string;
}[];

export type VenueMember = { id: number };

export type CreateVenueData = {
	name: string;
	venueTypeId: number;
	maxCapacity: number;
	accessLevel: 'public' | 'private';
	isAvailable: boolean;
	organizationId?: number | null | undefined;
	unavailabilityReason?: string | undefined;
};

