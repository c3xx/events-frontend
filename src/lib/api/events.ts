import type { ApiResponse, CreateEventData, Event, ParentableEvent, EventCategory, EventType } from "$lib/types";
import { api } from "$lib/api";


export async function loadEvents() {
    const res = await api.get('events').json<ApiResponse<Event[]>>();
    if (res.success) {
        return res.data;
    } else {
        throw new Error(res.message);
    }
}

export async function loadParentableEvents(params?: { typeId?: string | number; orgId?: string | number }) {
    const searchParams = new URLSearchParams();
    if (params?.typeId) searchParams.set('typeId', params.typeId.toString());
    if (params?.orgId) searchParams.set('organizationId', params.orgId.toString());
    const res = await api.get('events/parentable', { searchParams }).json<ApiResponse<ParentableEvent[]>>();
    if (res.success) {
        return res.data;
    } else {
        throw new Error(res.message);
    }
}


export async function createEvent(eventData: CreateEventData): Promise<Event> {
    console.log("Sending eventData:", eventData);
    const res = await api.post('events', {
        json: eventData
    }).json<ApiResponse<Event>>();
    if (res.success) {
        return res.data;
    } else {
        throw new Error(res.message);
    }
}

