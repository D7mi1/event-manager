import { create } from 'zustand';
import { supabase } from '@/app/utils/supabase/client';

export interface Attendee {
  id: string;
  name: string;
  phone: string;
  category: string;
  status: string; // 'invited', 'confirmed', 'declined'
  attended: boolean;
  updated_at: string;
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

  fetchData: async () => {
    const { eventId } = get();
    if (!eventId) return;
    const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single();
    const { data: attendees } = await supabase.from('attendees').select('*, seats(*, table:tables(name))').eq('event_id', eventId).order('created_at', { ascending: false });
    set({ eventDetails: event, attendees: attendees || [], isLoading: false });
  },

  addGuest: async (guest) => {
    const { eventId, attendees } = get();
    const { data, error } = await supabase.from('attendees').insert([{ ...guest, event_id: eventId, status: 'confirmed' }]).select().single();
    if (data && !error) set({ attendees: [data, ...attendees], isAddModalOpen: false });
  },

  bulkAddGuests: async (guests) => {
    const { eventId, attendees } = get();
    const formattedGuests = guests.map(g => ({ ...g, event_id: eventId, status: 'confirmed', attended: false, updated_at: new Date().toISOString() }));
    const { data, error } = await supabase.from('attendees').upsert(formattedGuests, { onConflict: 'event_id, phone', ignoreDuplicates: true }).select();
    
    if (error) { alert(`فشل: ${error.message}`); } 
    else if (data) {
      const newIds = new Set(data.map(d => d.id));
      const mergedList = [...data, ...attendees.filter(a => !newIds.has(a.id))];
      set({ attendees: mergedList, isImportModalOpen: false });
      alert(`تمت العملية بنجاح!`);
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
    alert("تم حفظ الإعدادات");
  },

  // ✅ دالة تحديث حالة الإرسال
  markInviteAsSent: async (id) => {
    set(state => ({
      attendees: state.attendees.map(a => a.id === id ? { ...a, status: 'invited' } : a)
    }));
    await supabase.from('attendees').update({ status: 'invited' }).eq('id', id);
  }
}));