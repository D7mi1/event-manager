// types/index.ts

export type EventType = 'business' | 'wedding' | 'other';
export type EventStatus = 'active' | 'draft';
export type AttendeeStatus = 'pending' | 'confirmed' | 'declined';

export interface Event {
    id: string;
    created_at: string;
    name: string;
    date: string;
    location_name: string;
    type: EventType;
    user_id?: string;
    status?: EventStatus;
    guests_count?: number;
    is_registration_open?: boolean;
    description?: string;
    cover_image?: string;
}

export interface Table {
    id: string;
    name: string;
    shape: 'round' | 'rectangular' | 'square';
}

export interface Seat {
    id: string;
    seat_number: string;
    table?: Table;
    occupied?: boolean;
}

export interface Attendee {
    id: string;
    created_at: string;
    event_id: string;
    name: string;
    email: string;
    phone: string;
    status: AttendeeStatus;
    check_in_time?: string | null;
    attended?: boolean;
    eventName?: string;
    events?: Event;
    seats?: Seat[];
    regret_reason?: string;
    qr_code?: string;
}

export interface Memory {
    id: string;
    event_id: string;
    attendee_id: string;
    message: string;
    created_at: string;
    attendee?: Attendee;
}

export interface ApiResponse<T> {
    data?: T;
    error?: {
        message: string;
        code: string;
    };
}