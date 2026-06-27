import { goto } from '$app/navigation';
import { ROUTE_PERMISSIONS, UNPROTECTED_ROUTES } from './constants';
import { authInfo } from './global/auth.svelte';
import type { PermissionCode } from './types';

export function formatDate(dateStr: string) {
	return new Date(dateStr).toLocaleString('en-IN', {
		dateStyle: 'medium',
		timeStyle: 'short'
	});
}

export function formatDateDayAndMonth(dateStr: string) {
	return new Date(dateStr).toLocaleString('en-IN', {
		day: '2-digit',
		month: 'short'
	});
}

export function formatDateDayAndMonthAndYear(dateStr: string) {
	return new Date(dateStr).toLocaleString('en-IN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});
}

export function formatDateOnlyTime(dateStr: string) {
	return new Date(dateStr).toLocaleString('en-IN', {
		timeStyle: 'short'
	});
}

export function canAccessRoute(route: string): boolean {
	if (UNPROTECTED_ROUTES.includes(route)) return true;
	const user = authInfo.get();

	if (!user) return false;
	if (user.type === 'admin') return true;

	const requiredPermissions = ROUTE_PERMISSIONS[route as keyof typeof ROUTE_PERMISSIONS];

	if (!requiredPermissions) return true;

	return user.memberships.some((membership) =>
		membership.roles.some((role) =>
			role.permissions.some((permission) => requiredPermissions.includes(permission))
		)
	);
}

export function permissionGrantedSomewhere(permission: PermissionCode): boolean {
	const user = authInfo.get();
	if (!user) return false;
	if (user.type === 'admin') return true;
	return user.memberships.some((m) =>
		m.roles.some((r) => r.permissions.some((p) => p === permission))
	);
}

export function permissionGrantedUnderEntity(
	entityId: number,
	permission: PermissionCode
): boolean {
	const user = authInfo.get();
	if (!user) return false;
	const memberShips = user.memberships.find((m) => m.id === entityId);
	if (!memberShips) return false;
	return memberShips.roles.some((r) => r.permissions.some((p) => p === permission));
}

export function stringToColor(str: string) {
	let hash = 0;
	for (const c of str) {
		hash = c.charCodeAt(0) + ((hash << 5) - hash);
	}
	const hue = Math.abs(hash) % 360;
	return {
		bg: `hsl(${hue}, 65%, 55%)`,
		fg: `hsl(${hue}, 20%, 95%)`
	};
}
