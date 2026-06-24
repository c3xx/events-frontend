import type { Snippet } from 'svelte';

export type WorkflowTemplate = {
	id: number;
	name: string;
	steps: {
		id: number;
		name: string;
		nextStepId: number | null;
		roles: {
			targetGroupApprovalCriteria: WorkflowTargetGroupApprovalCriteriaType;
			role: {
				id: number;
				name: string;
				scope: { type: EntityType; kindId: number; kindName: string };
			};
		}[];
	}[];
};

export type WorkflowInstance = {
	id: number;
	createdAt: string;
	initialStepId: number | null;
	status: 'overridden' | 'active' | 'completed' | 'denied' | 'aborted';
	completedAt: string | null;
	eventId: number;
	submittedBy: number;
	steps: {
		id: number;
		name: string;
		nextStepId: number | null;
		status: 'pending' | 'overridden' | 'active' | 'completed' | 'denied' | 'skipped' | 'blocked';
		completedAt: string | null;
		stepOpen: boolean;
		roles: {
			id: number;
			targetGroupApprovalCriteria: WorkflowTargetGroupApprovalCriteriaType;
			role: {
				id: number;
				name: string;
				scope: {
					type: EntityType;
					kindId: number;
					kindName: string;
				};
			};
			targetGroups: {
				id: number;
				scope: {
					type: EntityType;
					id: number;
					name: string;
				};
				assignments: {
					id: number;
					status: 'pending' | 'approved' | 'denied' | 'skipped';
					completedAt: string | null;
					remarks: string | null;
					userRole: {
						id: number;
						user: {
							id: number;
							fullName: string;
						};
					};
				}[];
			}[];
		}[];
	}[];
};

export const ENTITIES = ['organization', 'venue'] as const;
export type EntityType = (typeof ENTITIES)[number];

export type EntityMember = {
	id: number;
	fullName: string;
	email: string;
	roles: {
		id: number;
		roleId: number;
		isActive: boolean;
	}[];
};

type EntityRole = {
	id: number;
	isActive: boolean;
	roleId: number;
	managedEntityId: string;
};

export type User = {
	id: number;
	fullName: string;
	email: string;
	type: 'admin' | 'end_user';
	isActive: boolean;
	roles: EntityRole[];
};

export type Venue = {
	id: number;
	name: string;
	venueTypeId: number;
	organizationId: number;
	maxCapacity: string;
	accessLevel: string;
	isAvailable: boolean;
	unavailabilityReason: string | null;
	isActive: boolean;
};

// TODO: Match types
export type Organization = {
	id: number;
	name: string;
	organizationTypeId: number;
	parentOrganizationId: number | null;
	isActive: boolean;
};

export type Role = {
	id: number;
	name: string;
};

export type AssignRole = {
	userId: number;
	roleId: number | null;
	organizationId: number | null;
};

export type OrganizationType = {
	id: number;
	name: string;
	children: {
		childTypeId: number;
	}[];
	selectedChildId: number | null;
	selectedRoleId: number | null;
};

export type VenueType = {
	id: number;
	name: string;
	children: {
		childTypeId: number;
	}[];
	selectedChildId: number | null;
	selectedRoleId: number | null;
};

export type ChildType = {
	id: number;
	name: string;
};

export type RoleType = {
	id: number;
	name: string;
};

export type PermissionCode =
	| 'organization:create'
	| 'organization:add_member'
	| 'venue:create'
	| 'venue:add_member'
	| 'venue:modify_facilities'
	| 'user:create'
	| 'event:manage'
	| 'event:view_own'
	| 'event:view_all_confirmed'
	| 'event:view_all'
	| 'event:view_all_non_draft'
	| 'event:allot_venue'
	| 'event_organizer_invitation:respond'
	| 'role:modify_permissions'
	| 'event_type:create'
	| 'event_type:delete'
	| 'event_type:modify_hierarchy'
	| 'event_category:create'
	| 'facility:create'
	| 'organization_type:create'
	| 'organization_type:modify_hierarchy'
	| 'organization_type:create_role'
	| 'venue_type:create'
	| 'venue_type:create_role'
	| 'event_organizer:manage';

export type PermissionType = {
	id: number;
	code: PermissionCode;
	description: string;
};

export type PermissionChildType = {
	id: number;
	title: string;
	description: string;
	status: boolean;
};

export type AuthUser = {
	id: number;
	email: string;
	type: 'admin' | 'end_user';
	fullName: string;
	memberships: {
		id: number;
		type: EntityType;
		name: string;
		kind: {
			id: number;
			name: string;
		};
		roles: {
			id: number;
			name: string;
			permissions: PermissionCode[];
		}[];
	}[];
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
	id: number;
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
export type EventOrganizerRole = (typeof EVENT_ORGANIZER_ROLE)[number];
export type EventTypeVenuePolicy = 'required' | 'optional' | 'forbidden';
export type EventTypeCollaborationPolicy = 'required' | 'optional' | 'forbidden';

export type EventOrganizer = {
	id: number;
	organization: Organization;
	role: EventOrganizerRole;
};

type EventOrganizerInvitationStatus = 'pending' | 'accepted' | 'rejected' | 'revoked' | 'expired';

export type EventOrganizerInvitation = {
	id: number;
	status: EventOrganizerInvitationStatus;
	invitedAt: string;
	closedAt: string | null;
	invitedByUser: {
		id: number;
		user: {
			id: number;
			fullName: string;
		};
	};
	senderOrganization: {
		id: number;
		name: string;
	};
	recipientOrganization: {
		id: number;
		name: string;
	};
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
	startsAt: string;
	endsAt: string;
	parentEventId?: number | null | undefined;
};

export type UpdateEventData = Partial<Omit<CreateEventData, 'organizationId'>>;

export type CreateVenueAllotmentData = {
	venueId: number;
	startsAt: string;
	endsAt: string;
};

export type EventType = {
	id: number;
	name: string;
	isActive: boolean;
	workflowTemplate: {
		id: number;
		name: string;
	};
	venuePolicy: EventTypeVenuePolicyType;
	collaborationPolicy: EventTypeCollaborationPolicyType;
};

export type EventCategory = {
	id: number;
	name: string;
};

export const EVENT_TYPE_VENUE_POLICY = ['required', 'optional', 'forbidden'] as const;
export const EVENT_TYPE_COLLABORATION_POLICY = ['required', 'optional', 'forbidden'] as const;
export const WORKFLOW_TARGET_GROUP_APPROVAL_CRITERIA = ['all', 'any'] as const;
export const EVENT_ORGANIZER_ROLE = ['host', 'co_host', 'resource_provider '] as const;

export type EventTypeVenuePolicyType = (typeof EVENT_TYPE_VENUE_POLICY)[number];
export type EventTypeCollaborationPolicyType = (typeof EVENT_TYPE_COLLABORATION_POLICY)[number];
export type WorkflowTargetGroupApprovalCriteriaType =
	(typeof WORKFLOW_TARGET_GROUP_APPROVAL_CRITERIA)[number];

export type VenueFacility = {
	id: number;
	facilityId: number;
	facilityName: string;
};

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

export type ParentableEvent = {
	id: number;
	title: string;
};

export type PendingApprovalEvent = {
	id: number;
	title: string;
	status: EventStatus;
	startsAt: string;
	endsAt: string;
};

export type EventAssignmentsAndDetails = EventDetail & { assignments: EventAssignment[] };

export type EventAssignment = {
	id: number;
	status: 'pending' | 'approved' | 'denied' | 'skipped';
	remarks: string | null;
	completedAt: string | null;
	state: 'approved' | 'denied' | 'none';
	step: {
		id: number;
		name: string;
		status: 'pending' | 'overridden' | 'active' | 'completed' | 'denied' | 'skipped' | 'blocked';
		instanceId: number;
	};
	role: {
		id: number;
		name: string;
		scope: {
			type: 'organization' | 'venue';
			kindId: number;
			kindName: string;
		};
	};
	scope: {
		type: 'organization' | 'venue';
		id: number;
		name: string;
	};
};

export type PasswordTokenType = 'set_password' | 'reset_password';
