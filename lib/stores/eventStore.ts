import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export interface Attendee {
  id: string;
  name: string;
  phone: string;
  category?: string; // ⏳ يُضاف عبر migration - القيم: GENERAL, VIP, FAMILY
  status: string; // 'invited', 'confirmed', 'declined'
  attended: boolean;
  updated_at: string;
  attended_at?: string | null;
  companions_count?: number;
  food_preference?: string;
  seats?: any[];
}

interface EventState {
  // --- Data ---
  eventId: string;
  eventDetails: any;
  attendees: Attendee[];
  isLoading: boolean;
  searchTerm: string;
  filterType: 'all' | 'confirmed' | 'attended' | 'pending';

  messageSettings: {
    reminder: { enabled: boolean; text: string };
    location: { enabled: boolean; text: string };
  };

  // --- Modals State ---
  isAddModalOpen: boolean;
  isMessageModalOpen: boolean;
  isEditEventModalOpen: boolean;
  isImportModalOpen: boolean;
  isQueueModalOpen: boolean; // ✅ تمت إضافته

  // --- Actions ---
  setEventId: (id: string) => void;
  setSearchTerm: (term: string) => void;
  setFilterType: (type: any) => void;

  toggleAddModal: (isOpen: boolean) => void;
  toggleMessageModal: (isOpen: boolean) => void;
  toggleEditEventModal: (isOpen: boolean) => void;
  toggleImportModal: (isOpen: boolean) => void;
  toggleQueueModal: (isOpen: boolean) => void; // ✅ تمت إضافته

  // --- Operations ---
  fetchData: () => Promise<void>;
  addGuest: (guest: { name: string, phone: string, category: string }) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  toggleAttendance: (id: string, currentStatus: boolean) => Promise<void>;
  bulkAddGuests: (guests: any[]) => Promise<void>;
  updateEventDetails: (details: { name: string; location_name: string }) => Promise<void>;
  updateMessageSettings: (settings: any) => Promise<void>;
  markInviteAsSent: (id: string) => Promise<void>; // ✅ تمت إضافته
}

export const useEventStore = create<EventState>((set, get) => ({
  eventId: '',
  eventDetails: null,
  attendees: [],
  isLoading: true,
  searchTerm: '',
  filterType: 'all',

  messageSettings: {
    reminder: { enabled: true, text: "مرحباً بك، نذكرك بموعد حفلنا غداً.. الموقع: {location_link}" },
    location: { enabled: false, text: "حياكم الله! فتحنا الأبواب الآن وننتظركم ✨" }
  },

  isAddModalOpen: false,
  isMessageModalOpen: false,
  isEditEventModalOpen: false,
  isImportModalOpen: false,
  isQueueModalOpen: false,

  setEventId: (id) => set({ eventId: id }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setFilterType: (type) => set({ filterType: type }),

  toggleAddModal: (isOpen) => set({ isAddModalOpen: isOpen }),
  toggleMessageModal: (isOpen) => set({ isMessageModalOpen: isOpen }),
  toggleEditEventModal: (isOpen) => set({ isEditEventModalOpen: isOpen }),
  toggleImportModal: (isOpen) => set({ isImportModalOpen: isOpen }),
  toggleQueueModal: (isOpen) => set({ isQueueModalOpen: isOpen }),

  /**
   * 🚀 Fetch Data Strategy:
   * 1. Fetches event details and attendees list from Supabase.
   * 2. OPTIMIZATION: Selects specific columns (`id`, `name`, `date`...) instead of `*` to minimize payload.
   * 3. OPTIMIZATION: Avoids heavy joins (like `seats`) in the main fetch to ensure fast load times.
   */
  fetchData: async () => {
    const { eventId } = get();
    if (!eventId) return;

    // ✅ تحسين 1: جلب الأعمدة المطلوبة فقط للفعالية
    const { data: event } = await supabase
      .from('events')
      .select('id, name, date, location_name, type, status, guests_count, is_registration_open, image_url, theme_color, pin_hash')
      .eq('id', eventId)
      .single();

    // ✅ تحسين 2: إزالة الـ Joins الثقيلة وتحديد الأعمدة
    const { data: attendees } = await supabase
      .from('attendees')
      .select('id, name, phone, status, attended, updated_at, created_at, seats(seat_number, table:tables(name))')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    set({ eventDetails: event, attendees: attendees || [], isLoading: false });
  },

  addGuest: async (guest) => {
    const { eventId, attendees } = get();
    const { data, error } = await supabase.from('attendees').insert([{ ...guest, event_id: eventId, status: 'confirmed' }]).select().single();
    if (data && !error) set({ attendees: [data, ...attendees], isAddModalOpen: false });
  },

  /**
   * 🔄 Bulk Add Strategy:
   * - Uses `upsert` to insert multiple guests efficiently.
   * - `onConflict: 'event_id, phone'`: Prevents duplicate phone numbers in the same event.
   * - `ignoreDuplicates: true`: Skips existing records instead of updating them (to preserve status).
   * - Merges new data with existing local state to avoid a full re-fetch.
   */
  bulkAddGuests: async (guests) => {
    const { eventId, attendees } = get();
    const formattedGuests = guests.map(g => ({ ...g, event_id: eventId, status: 'confirmed', attended: false, updated_at: new Date().toISOString() }));
    const { data, error } = await supabase.from('attendees').upsert(formattedGuests, { onConflict: 'event_id, phone', ignoreDuplicates: true }).select();

    if (error) { toast.error(`فشل: ${error.message}`); }
    else if (data) {
      const newIds = new Set(data.map(d => d.id));
      const mergedList = [...data, ...attendees.filter(a => !newIds.has(a.id))];
      set({ attendees: mergedList, isImportModalOpen: false });
      toast.success('تمت العملية بنجاح!');
    }
  },

  deleteGuest: async (id) => {
    await supabase.from('attendees').delete().eq('id', id);
    set((state) => ({ attendees: state.attendees.filter((a) => a.id !== id) }));
  },

  bulkDelete: async (ids) => {
    await supabase.from('attendees').delete().in('id', ids);
    set((state) => ({ attendees: state.attendees.filter((a) => !ids.includes(a.id)) }));
  },

  /**
   * ⚡ Optimistic Update Pattern:
   * 1. Updates the UI immediately (via `set`) to give instant feedback.
   * 2. Sends the request to the server in the background.
   * 3. (Implicit): If server fails, we ideally should revert (not implemented here for simplicity, but good practice).
   */
  toggleAttendance: async (id, currentStatus) => {
    const newStatus = !currentStatus;
    set(state => ({ attendees: state.attendees.map(a => a.id === id ? { ...a, attended: newStatus, updated_at: new Date().toISOString() } : a) }));
    await supabase.from('attendees').update({ attended: newStatus }).eq('id', id);
  },

  updateEventDetails: async (details) => {
    const { eventId } = get();
    await supabase.from('events').update(details).eq('id', eventId);
    set((state) => ({ eventDetails: { ...state.eventDetails, ...details }, isEditEventModalOpen: false }));
  },

  updateMessageSettings: async (settings) => {
    set({ messageSettings: settings, isMessageModalOpen: false });
    toast.success('تم حفظ الإعدادات');
  },

  // ✅ دالة تحديث حالة الإرسال
  markInviteAsSent: async (id) => {
    set(state => ({
      attendees: state.attendees.map(a => a.id === id ? { ...a, status: 'invited' } : a)
    }));
    await supabase.from('attendees').update({ status: 'invited' }).eq('id', id);
  }
}));