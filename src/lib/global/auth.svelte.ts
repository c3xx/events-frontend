import type { AuthUser } from '$lib/types';

let user = $state<AuthUser | null>(null);

export const authInfo = {
	get() {
		return user;
	},

	set(value: AuthUser | null) {
		user = value;
	},

	clear() {
		user = null;
	},

	getAllowedRoutes(): string[] {
		if (user === null) return [];
		const memberships = user.memberships;
		const routes: string[] = [];
		if (
			memberships.some((m) => m.roles.some((r) => r.permissions.some((p) => p === 'user:create')))
		)
			routes.push('/users');
		if (
			memberships.some((m) =>
				m.roles.some((r) =>
					r.permissions.some(
						(p) =>
							p === 'event:allot_venue' ||
							p === 'event:manage' ||
							p === 'event:view_all' ||
							p === 'event:view_all_confirmed' ||
							p === 'event:view_all_non_draft' ||
							p === 'event:view_own'
					)
				)
			)
		)
			routes.push('/events');
		if (
			memberships.some((m) =>
				m.roles.some((r) =>
					r.permissions.some((p) => p === 'organization:add_member' || p === 'organization:create')
				)
			)
		)
			routes.push('/organizations');
		if (
			memberships.some((m) =>
				m.roles.some((r) =>
					r.permissions.some(
						(p) =>
							p === 'venue:add_member' || p === 'venue:create' || p === 'venue:modify_facilities'
					)
				)
			)
		)
			routes.push('/venues');
		return routes;
	}
};
