import type { ApiResponse, CreateEventData, Event, EventCategories, EventType } from "$lib/types";
import { api } from "$lib/api";


// export async function loadEvents() {
//     const res = await api.get('events').json<ApiResponse<Event[]>>();
//     if (res.success) {
//         return res.data;
//     } else {
//         throw new Error(res.message);
//     }
// }

export async function loadEventTypes() {
	const res = await api.get('event-types').json<ApiResponse<EventType[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadEventCategories() {
	const res = await api.get('event-categories').json<ApiResponse<EventCategories[]>>();
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


export async function loadEvents(): Promise<Event[]> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	return [
		{
			id: 1,
			title: 'Tech Fest 2026',

			status: 'approved',

			startsAt: '2026-06-10T09:00:00Z',
			endsAt: '2026-06-10T18:00:00Z',

			expectedParticipants: 500,

			requestDetails: 'Annual inter-college technology festival.',

			parentEventId: null,

			type: {
				id: 1,
				name: 'Festival'
			},

			category: {
				id: 1,
				name: 'Technology'
			},

			parentEvent: null,

			organizers: [
				{
					id: 1,
					role: 'host',

					organization: {
						id: 1,
						name: 'Computer Science Association'
					}
				}
			]
		},

		{
			id: 2,
			title: 'AI Workshop',

			status: 'draft',

			startsAt: '2026-07-02T10:00:00Z',
			endsAt: '2026-07-02T15:00:00Z',

			expectedParticipants: 120,

			requestDetails: 'Hands-on workshop on Generative AI tools.',

			parentEventId: 1,

			type: {
				id: 2,
				name: 'Workshop'
			},

			category: {
				id: 2,
				name: 'Artificial Intelligence'
			},

			parentEvent: {
				id: 1,
				title: 'Tech Fest 2026'
			},

			organizers: [
				{
					id: 2,
					role: 'co_host',

					organization: {
						id: 2,
						name: 'AI Research Club'
					}
				}
			]
		},

		{
			id: 3,
			title: 'Startup Meetup',

			status: 'cancelled',

			startsAt: '2026-08-15T17:00:00Z',
			endsAt: '2026-08-15T20:00:00Z',

			expectedParticipants: 80,

			requestDetails: 'Networking meetup for startup founders.',

			parentEventId: null,

			type: {
				id: 3,
				name: 'Meetup'
			},

			category: {
				id: 3,
				name: 'Business'
			},

			parentEvent: null,

			organizers: [
				{
					id: 3,
					role: 'host',

					organization: {
						id: 3,
						name: 'Entrepreneurship Cell'
					}
				}
			]
		},
        {
			id: 3,
			title: 'Startup Meetup',

			status: 'cancelled',

			startsAt: '2026-08-15T17:00:00Z',
			endsAt: '2026-08-15T20:00:00Z',

			expectedParticipants: 80,

			requestDetails: 'Networking meetup for startup founders.',

			parentEventId: null,

			type: {
				id: 3,
				name: 'Meetup'
			},

			category: {
				id: 3,
				name: 'Business'
			},

			parentEvent: null,

			organizers: [
				{
					id: 3,
					role: 'host',

					organization: {
						id: 3,
						name: 'Entrepreneurship Cell'
					}
				}
			]
		}
	];
}