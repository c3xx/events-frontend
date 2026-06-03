import type { ApiResponse, CreateEventData, Event, EventCategory, EventType } from "$lib/types";
import { api } from "$lib/api";


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


// export async function loadEvents(): Promise<Event[]> {
// 	await new Promise((resolve) => setTimeout(resolve, 500));

// 	return [
// 		{
// 			id: 1,
// 			title: 'Tech Fest 2026',
// 			status: 'approved',
// 			startsAt: '2026-06-10T09:00:00Z',
// 			endsAt: '2026-06-10T18:00:00Z',
// 			expectedParticipants: 500,
// 			requestDetails: 'Annual inter-college technology festival.',
// 			parentEventId: null,
// 			type: { id: 1, name: 'Festival' },
// 			category: { id: 1, name: 'Technology' },
// 			parentEvent: null,
// 			organizers: [
// 				{
// 					id: 1,
// 					role: 'host',
// 					organization: { id: 1, name: 'Computer Science Association' }
// 				}
// 			]
// 		},

// 		{
// 			id: 2,
// 			title: 'AI Workshop',
// 			status: 'draft',
// 			startsAt: '2026-07-02T10:00:00Z',
// 			endsAt: '2026-07-02T15:00:00Z',
// 			expectedParticipants: 120,
// 			requestDetails: 'Hands-on workshop on Generative AI tools.',
// 			parentEventId: 1,
// 			type: { id: 2, name: 'Workshop' },
// 			category: { id: 2, name: 'Artificial Intelligence' },
// 			parentEvent: { id: 1, title: 'Tech Fest 2026' },
// 			organizers: [
// 				{
// 					id: 2,
// 					role: 'co_host',
// 					organization: { id: 2, name: 'AI Research Club' }
// 				}
// 			]
// 		},

// 		{
// 			id: 3,
// 			title: 'Startup Meetup',
// 			status: 'approved',
// 			startsAt: '2026-08-15T17:00:00Z',
// 			endsAt: '2026-08-15T20:00:00Z',
// 			expectedParticipants: 80,
// 			requestDetails: 'Networking meetup for startup founders.',
// 			parentEventId: null,
// 			type: { id: 3, name: 'Meetup' },
// 			category: { id: 3, name: 'Business' },
// 			parentEvent: null,
// 			organizers: [
// 				{
// 					id: 3,
// 					role: 'host',
// 					organization: { id: 3, name: 'Entrepreneurship Cell' }
// 				}
// 			]
// 		},

// 		{
// 			id: 4,
// 			title: 'Cybersecurity Bootcamp',
// 			status: 'approved',
// 			startsAt: '2026-06-20T09:00:00Z',
// 			endsAt: '2026-06-20T17:00:00Z',
// 			expectedParticipants: 200,
// 			requestDetails: 'Intensive security training program.',
// 			parentEventId: null,
// 			type: { id: 2, name: 'Workshop' },
// 			category: { id: 4, name: 'Cybersecurity' },
// 			parentEvent: null,
// 			organizers: [
// 				{
// 					id: 4,
// 					role: 'host',
// 					organization: { id: 4, name: 'Security Club' }
// 				}
// 			]
// 		},

// 		{
// 			id: 5,
// 			title: 'Web Dev Hackathon',
// 			status: 'approved',
// 			startsAt: '2026-07-10T09:00:00Z',
// 			endsAt: '2026-07-11T18:00:00Z',
// 			expectedParticipants: 300,
// 			requestDetails: '24-hour coding hackathon.',
// 			parentEventId: 1,
// 			type: { id: 1, name: 'Hackathon' },
// 			category: { id: 1, name: 'Technology' },
// 			parentEvent: { id: 1, title: 'Tech Fest 2026' },
// 			organizers: [
// 				{
// 					id: 5,
// 					role: 'host',
// 					organization: { id: 1, name: 'Computer Science Association' }
// 				}
// 			]
// 		},

// 		{
// 			id: 6,
// 			title: 'Marketing Summit',
// 			status: 'draft',
// 			startsAt: '2026-09-01T10:00:00Z',
// 			endsAt: '2026-09-01T16:00:00Z',
// 			expectedParticipants: 150,
// 			requestDetails: 'Digital marketing trends discussion.',
// 			parentEventId: null,
// 			type: { id: 3, name: 'Summit' },
// 			category: { id: 3, name: 'Business' },
// 			parentEvent: null,
// 			organizers: [
// 				{
// 					id: 6,
// 					role: 'host',
// 					organization: { id: 5, name: 'Business Club' }
// 				}
// 			]
// 		},

// 		{
// 			id: 7,
// 			title: 'Robotics Expo',
// 			status: 'approved',
// 			startsAt: '2026-10-05T09:00:00Z',
// 			endsAt: '2026-10-05T18:00:00Z',
// 			expectedParticipants: 400,
// 			requestDetails: 'Showcase of robotics projects.',
// 			parentEventId: null,
// 			type: { id: 1, name: 'Expo' },
// 			category: { id: 1, name: 'Technology' },
// 			parentEvent: null,
// 			organizers: [
// 				{
// 					id: 7,
// 					role: 'host',
// 					organization: { id: 6, name: 'Robotics Club' }
// 				}
// 			]
// 		},

// 		{
// 			id: 8,
// 			title: 'UI/UX Design Workshop',
// 			status: 'draft',
// 			startsAt: '2026-06-25T10:00:00Z',
// 			endsAt: '2026-06-25T15:00:00Z',
// 			expectedParticipants: 100,
// 			requestDetails: 'Learn modern UI/UX principles.',
// 			parentEventId: null,
// 			type: { id: 2, name: 'Workshop' },
// 			category: { id: 5, name: 'Design' },
// 			parentEvent: null,
// 			organizers: [
// 				{
// 					id: 8,
// 					role: 'host',
// 					organization: { id: 7, name: 'Design Society' }
// 				}
// 			]
// 		},

// 		{
// 			id: 9,
// 			title: 'Cloud Computing Seminar',
// 			status: 'approved',
// 			startsAt: '2026-07-18T11:00:00Z',
// 			endsAt: '2026-07-18T14:00:00Z',
// 			expectedParticipants: 180,
// 			requestDetails: 'AWS and cloud fundamentals.',
// 			parentEventId: null,
// 			type: { id: 4, name: 'Seminar' },
// 			category: { id: 1, name: 'Technology' },
// 			parentEvent: null,
// 			organizers: [
// 				{
// 					id: 9,
// 					role: 'host',
// 					organization: { id: 8, name: 'Cloud Club' }
// 				}
// 			]
// 		},

// 		{
// 			id: 10,
// 			title: 'Entrepreneurship Talk',
// 			status: 'pending',
// 			startsAt: '2026-08-01T17:00:00Z',
// 			endsAt: '2026-08-01T19:00:00Z',
// 			expectedParticipants: 90,
// 			requestDetails: 'Startup journey insights.',
// 			parentEventId: null,
// 			type: { id: 3, name: 'Talk' },
// 			category: { id: 3, name: 'Business' },
// 			parentEvent: null,
// 			organizers: [
// 				{
// 					id: 10,
// 					role: 'host',
// 					organization: { id: 3, name: 'Entrepreneurship Cell' }
// 				}
// 			]
// 		},

// 		{
// 			id: 11,
// 			title: 'Data Science Bootcamp',
// 			status: 'draft',
// 			startsAt: '2026-09-10T09:00:00Z',
// 			endsAt: '2026-09-10T17:00:00Z',
// 			expectedParticipants: 250,
// 			requestDetails: 'Python, ML, and data analysis.',
// 			parentEventId: null,
// 			type: { id: 2, name: 'Bootcamp' },
// 			category: { id: 2, name: 'Artificial Intelligence' },
// 			parentEvent: null,
// 			organizers: [
// 				{
// 					id: 11,
// 					role: 'host',
// 					organization: { id: 2, name: 'AI Research Club' }
// 				}
// 			]
// 		},

// 		{
// 			id: 12,
// 			title: 'Game Dev Jam',
// 			status: 'approved',
// 			startsAt: '2026-07-25T09:00:00Z',
// 			endsAt: '2026-07-26T18:00:00Z',
// 			expectedParticipants: 220,
// 			requestDetails: 'Build games in 48 hours.',
// 			parentEventId: null,
// 			type: { id: 1, name: 'Game Jam' },
// 			category: { id: 1, name: 'Technology' },
// 			parentEvent: null,
// 			organizers: [
// 				{
// 					id: 12,
// 					role: 'host',
// 					organization: { id: 9, name: 'Game Dev Club' }
// 				}
// 			]
// 		}
// 	];
// }