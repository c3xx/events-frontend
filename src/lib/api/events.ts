import type { ApiResponse, CreateEventData, Event, EventDetail, UpdateEventData, CreateVenueAllotmentData } from '$lib/types';
import { api } from '$lib/api';

export async function loadEvents() {
	const res = await api.get('events').json<ApiResponse<Event[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function createEvent(eventData: CreateEventData): Promise<Event> {
	const res = await api.post('events', {
		body: JSON.stringify(eventData)
	}).json<ApiResponse<Event>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function getEvent(id: string) {
	if (!id) {
		throw new Error('Event ID required');
	}
	const res = await api.get(`events/${id}`).json<ApiResponse<EventDetail>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function updateEvent(id: string, data: UpdateEventData) {
	if (!id) {
		throw new Error('Event ID required');
	}
	const res = await api
		.patch(`events/${id}`, { json: data })
		.json<ApiResponse<{ id: number }>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function createVenueAllotment(eventId: string, data: CreateVenueAllotmentData) {
	if (!eventId) {
		throw new Error('Event ID required');
	}
	const res = await api
		.post(`events/${eventId}/venue-allotments`, { json: data })
		.json<ApiResponse<{ id: number }>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
