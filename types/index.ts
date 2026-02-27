// types/index.ts
// المصدر الوحيد لجميع أنواع البيانات في المشروع

// ============================================
// Enums & Union Types
// ============================================

export type EventType = 'conference' | 'workshop' | 'exhibition' | 'business';
export type EventStatus = 'active' | 'draft';
export type AttendeeStatus = 'pending' | 'confirmed' | 'declined';
export type GuestType = 'vip' | 'standard' | 'media' | 'staff';
export type TableShape = 'round' | 'rectangular' | 'square';

// ============================================
// Core Interfaces
// ============================================

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
    image_url?: string;
    theme_color?: string;
}

export interface Attendee {
    id: string;
    created_at: string;
    event_id: string;
    name: string;
    email?: string;
    phone?: string;
    status: AttendeeStatus;
    guest_type?: GuestType;
    check_in_time?: string | null;
    attended?: boolean;
    events?: Event;
    seats?: Seat[];
    regret_reason?: string;
}

export interface Memory {
    id: string;
    event_id: string;
    attendee_id: string;
    message: string;
    created_at: string;
    attendee?: Attendee;
}

// ============================================
// Seating Interfaces (موحد من types/supabase.ts)
// ============================================

export interface Table {
    id: string;
    event_id?: string;
    name: string;
    shape: TableShape;
    capacity?: number;
    x?: number;
    y?: number;
    rotation?: number;
    seats?: Seat[];
}

export interface Seat {
    id: string;
    table_id?: string;
    seat_number: string | number;
    table?: Table;
    attendee_id?: string | null;
    occupied?: boolean;
    attendee?: {
        name: string;
        category?: string;
    };
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
    data?: T;
    error?: {
        message: string;
        code: string;
    };
}

export interface ApiErrorResponse {
    error: string;
    code?: string;
    details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}
