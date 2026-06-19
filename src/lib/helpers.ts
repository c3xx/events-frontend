import { ROUTE_PERMISSIONS } from './constants';
import { authInfo } from './global/auth.svelte';

export function formatDate(dateStr: string) {
	return new Date(dateStr).toLocaleString('en-IN', {
		dateStyle: 'medium',
		timeStyle: 'short'
	});
}

export function canAccessRoute(route: string): boolean {
	const user = authInfo.get();

	if (!user) return false;
	if (user.type === 'admin') return true;

	const requiredPermissions = ROUTE_PERMISSIONS[route as keyof typeof ROUTE_PERMISSIONS];

	if (!requiredPermissions) return false;

	return user.memberships.some((membership) =>
		membership.roles.some((role) =>
			role.permissions.some((permission) => requiredPermissions.includes(permission))
		)
	);
}
