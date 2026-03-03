// types/index.ts
// المصدر الوحيد لجميع أنواع البيانات في المشروع
// ✅ محدّث ليطابق DB Schema الفعلي في Supabase

// ============================================
// Enums & Union Types
// ============================================

export type EventType = 'conference' | 'workshop' | 'exhibition' | 'business';
export type EventStatus = 'active' | 'draft';
export type AttendeeStatus = 'pending' | 'confirmed' | 'declined';
export type GuestType = 'vip' | 'standard' | 'media' | 'staff';
export type TableShape = 'round' | 'rectangular' | 'square';

// ============================================
// Core Interfaces - مطابقة لـ DB Schema الفعلي
// ============================================

export interface Event {
    id: string;
    created_at: string;
    name: string;
    date: string;
    location_name: string;
    location_link?: string;          // ✅ DB: location_link (ليس map_link)
    type: EventType;
    user_id?: string;
    status?: EventStatus;
    guests_count?: number;
    is_registration_open?: boolean;
    has_seating?: boolean;           // ✅ DB: has_seating
    image_url?: string;
    theme_color?: string;
    pin_hash?: string;               // ✅ DB: pin_hash (ليس pin)
    groom_name?: string;             // ✅ DB: groom_name
    bride_name?: string;             // ✅ DB: bride_name
    company_logo?: string;           // ✅ DB: company_logo
    invitation_text?: string;
    // الحقول التالية تحتاج ALTER TABLE (migration):
    event_time?: string;             // ⏳ يُضاف عبر migration
    description?: string;            // ⏳ يُضاف عبر migration
    organizer_name?: string;         // ⏳ يُضاف عبر migration
    allow_multiple_entry?: boolean;  // ⏳ يُضاف عبر migration
}

export interface Attendee {
    id: string;
    created_at: string;
    event_id: string;
    name: string;
    email?: string;
    phone?: string;
    status: AttendeeStatus;
    attended?: boolean;
    attended_at?: string | null;     // ✅ DB: attended_at (ليس check_in_time)
    regret_reason?: string;
    token?: string;                  // ✅ DB: token
    seat_id?: string;                // ✅ DB: seat_id (FK→seats)
    updated_at?: string;
    companions_count?: number;       // ✅ DB: companions_count
    food_preference?: string;        // ✅ DB: food_preference
    special_requests?: string;       // ✅ DB: special_requests
    // الحقل التالي يحتاج ALTER TABLE (migration):
    category?: string;                // ⏳ يُضاف عبر migration
    // Relations (Supabase joins)
    events?: Event;
    seats?: Seat[];
}

export interface Memory {
    id: string;
    event_id: string;
    guest_id: string;                // ✅ DB: guest_id (ليس attendee_id)
    image_url: string;               // ✅ DB: NOT NULL
    message: string;
    status?: string;                 // ✅ DB: status (default: 'approved')
    created_at: string;
    attendee?: Attendee;             // Supabase join via guest_id FK
}

// ============================================
// Seating Interfaces - مطابقة لـ DB
// ============================================

export interface Table {
    id: string;
    created_at?: string;
    event_id?: string;
    name: string;
    shape: TableShape;
    capacity?: number;
    x?: number;
    y?: number;
    rotation?: number;
    config?: any;                    // ✅ DB: config (jsonb)
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
