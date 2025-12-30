'use client';
import { useState, useEffect, use } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { supabase } from '@/app/utils/supabase/client';
import { DraggableGuest } from '@/components/seating/DraggableGuest';
import { DroppableTable } from '@/components/seating/DroppableTable';
import { Loader2, ArrowLeft, Circle, Armchair } from 'lucide-react';
import Link from 'next/link';

export default function SeatingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState<any[]>([]);
  const [unseatedGuests, setUnseatedGuests] = useState<any[]>([]);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    const { data: tablesData } = await supabase.from('tables').select('*, seats(*, attendee:attendees(*))').eq('event_id', id);
    const { data: allGuests } = await supabase.from('attendees').select('*').eq('event_id', id);
    
    const seatedIds = new Set();
    tablesData?.forEach(t => t.seats.forEach((s:any) => { if(s.attendee_id) seatedIds.add(s.attendee_id); }));
    
    setTables(tablesData || []);
    setUnseatedGuests(allGuests?.filter(g => !seatedIds.has(g.id)) || []);
    setLoading(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      await supabase.from('seats').insert({ table_id: over.id, attendee_id: active.id, seat_number: Date.now() });
      fetchData();
    }
  };

  const addNewSection = async (shape: 'round' | 'theater') => {
    const name = prompt('اسم الطاولة/القسم؟');
    const cap = prompt('عدد المقاعد؟', '10');
    if (name) {
      await supabase.from('tables').insert([{ event_id: id, name, shape, capacity: parseInt(cap || '10') }]);
      fetchData();
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0A0A0C]"><Loader2 className="animate-spin text-[#C19D65]"/></div>;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen bg-[#0A0A0C]">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#18181B]">
           <div className="flex items-center gap-4">
              <Link href={`/dashboard/events/${id}`} className="text-white/50 hover:text-white"><ArrowLeft/></Link>
              <h1 className="font-bold text-white">مخطط الجلوس</h1>
           </div>
           <div className="flex gap-2">
              <button onClick={() => addNewSection('round')} className="px-4 py-2 bg-[#C19D65] text-black font-bold rounded flex gap-2"><Circle size={16}/> طاولة</button>
              <button onClick={() => addNewSection('theater')} className="px-4 py-2 bg-[#27272A] text-[#C19D65] border border-[#C19D65] font-bold rounded flex gap-2"><Armchair size={16}/> صفوف</button>
           </div>
        </div>
        <div className="flex flex-1 overflow-hidden">
           <div className="w-64 bg-[#18181B] border-l border-white/10 p-4 overflow-y-auto">
              {unseatedGuests.map(g => <DraggableGuest key={g.id} id={g.id} name={g.name} category={g.category} />)}
           </div>
           <div className="flex-1 p-10 relative overflow-auto flex flex-wrap content-start gap-8 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:16px_16px]">
              {tables.map(t => <DroppableTable key={t.id} id={t.id} name={t.name} capacity={t.capacity} shape={t.shape} guests={t.seats.map((s:any) => s.attendee)} />)}
           </div>
        </div>
      </div>
    </DndContext>
  );
}