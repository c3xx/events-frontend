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
        json: eventData
    }).json<ApiResponse<Event>>();
    if (res.success) {
        return res.data;
    } else {
        throw new Error(res.message);
    }
}

