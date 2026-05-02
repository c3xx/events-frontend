import type { Snippet } from 'svelte';

type OrganizationRole = {
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
	roles: OrganizationRole[];
};

export type Venue = {
	id: number;
	name: string;
	venueTypeId: number;
	organizationId: number | null;
	maxCapacity: number;
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
	createdAt: string;
	roleName: string;
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
	type: 'text' | 'link' | 'button';
	onclick?: (payload: T) => {};
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

export type VenueTypeRole = {
	id: number;
	name: string;
};

export type VenueMembers = {
	id: number;
	isActive: boolean;
	roleId: number;
	user: {
		id: number;
		fullName: string;
		email: string;
	};
}[];

export type VenueFacilities = {
	id: number;
	facilityId: number;
	facilityName: string;
}[];

export type VenueMember = { id: number };
