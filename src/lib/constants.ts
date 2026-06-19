import type { PermissionCode } from './types';

export const UNPROTECTED_API_ROUTES = ['/auth/login', '/auth/refresh', '/auth/logout'];
export const UNPROTECTED_ROUTES = ['/login'];

export const ROUTE_PERMISSIONS: Record<string, PermissionCode[]> = {
	'/users': ['user:create'],
	'/events': [
		'event:allot_venue',
		'event:manage',
		'event:view_all',
		'event:view_all_confirmed',
		'event:view_all_non_draft',
		'event:view_own'
	],
	'/venues': ['venue:add_member', 'venue:create', 'venue:modify_facilities'],
	'/organizations': ['organization:add_member', 'organization:create']
} as const;
