import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { api } from '$lib/api';
import type { ApiResponse, User } from '$lib/types';

export async function loadUsers() {
	const res = await api.get('users').json<ApiResponse<User[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadMatchResults(query: string) {
	const res = await api.get('users', { searchParams: { q: query } }).json<ApiResponse<User[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function createUser(name: string, email: string) {
	if (!name || !email) {
		throw new Error('Name and Email are required fields');
	}

	const res = await api
		.post('users', {
			json: {
				fullName: name,
				email
			}
		})
		.json<ApiResponse<{ id: number }>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
