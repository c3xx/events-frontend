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
	}
};
