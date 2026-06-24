import { goto } from '$app/navigation';
import { page } from '$app/state';
import { api } from '$lib/api';
import { UNPROTECTED_ROUTE_IDS } from '$lib/constants';
import { authInfo } from '$lib/global/auth.svelte';
import { ERROR_CODES, type ApiResponse, type AuthUser, type PasswordTokenType } from '$lib/types';

export async function authUser() {
	const accessToken = localStorage.getItem('accessToken');
	if (typeof accessToken !== 'string' || accessToken.trim().length === 0) {
		// there is no access token. that means, nothing to authenticate with.

		// todo: change all these "/login" references to cover all possible such routes
		if (UNPROTECTED_ROUTE_IDS.includes(page.route.id)) {
			// if we are in the login page, we ignore the cookie (if any), and we just stay there.
			return;
		} else {
			// we are in some other page, so we shall clear the cookie and get to login page.
			await logout(); // clear cookie and localstorage
			await goto('/login');
			return;
		}
	} else {
		// we have an access token:
		if (page.route.id === '/(unauth)/login') {
			// we are in the login page,
			// then we should try to go to the home page. if still unauthenticated,
			// we will be taken back to the login page again, after clearing the localstorage.
			await goto('/');
			return;
		} else {
			// we are in some other page than login. we should try to authenticate
			await authMe();
		}
	}
}

export async function logout() {
	await api.post('auth/logout', { credentials: 'include' });
	authInfo.clear();
	localStorage.clear(); // TODO: rethink - .clear() or removeItem()
}

export async function loginUser(email: string, password: string) {
	const res = await api
		.post('auth/login', {
			json: { email, password },
			credentials: 'include'
		})
		.json<ApiResponse<{ accessToken: string }>>();

	if (res.success) {
		localStorage.setItem('accessToken', res.data.accessToken);
		await authMe();
	} else {
		throw new Error(res.message);
	}
	return true;
}

export async function authMe() {
	const accessToken = localStorage.getItem('accessToken');
	const res = await api
		.get('me', { headers: { Authorization: `Bearer ${accessToken}` } })
		.json<ApiResponse<AuthUser>>();
	if (res.success) {
		// authentication success, the page is accessible.
		authInfo.set(res.data);
		// await goto('/');
		return;
	} else {
		// // that didn't work. why?
		if (res.code === ERROR_CODES.unauthorized) {
			// 	// access token seems to be expired; we should try the refresh token hoping that one exists
			// 	const refreshRes = await api
			// 		.post('auth/refresh', { credentials: 'include' })
			// 		.json<ApiResponse<AuthUser & { accessToken: string }>>();
			// 	if (refreshRes.success) {
			// 		localStorage.setItem('accessToken', refreshRes.data.accessToken);
			// 		authInfo.user = refreshRes.data.user;
			// 		authInfo.permissions = refreshRes.data.permissions;
			// 		return;
			// 	} else {
			// 		// refresh token doesnt work either. so clear everything, go back to login page.
			await logout();
			await goto('/login');
			return;
			// 	}
		}
	}
}

export async function requestPasswordToken(email: string, type: PasswordTokenType) {
	const res = await api
		.post('auth/request-password-token', {
			json: {
				email: email,
				type: type
			}
		})
		.json<ApiResponse<true>>();

	if (res.success) {
		return true;
	} else {
		throw new Error(res.message);
	}
}

export async function validatePasswordToken(token: string) {
	const res = await api
		.post('auth/validate-password-token', {
			json: {
				token: token
			}
		})
		.json<
			ApiResponse<{
				type: PasswordTokenType;
				expiresAt: string;
			}>
		>();

	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function resetPassword(token: string, password: string) {
	const res = await api
		.post('auth/reset-password', {
			json: {
				token: token,
				password: password
			}
		})
		.json<ApiResponse<true>>();

	if (res.success) {
		return true;
	} else {
		throw new Error(res.message);
	}
}
