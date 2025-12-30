'use client';
import { useEffect, useState, use } from 'react';
import { supabase } from '@/app/utils/supabase/client';
import { Heart } from 'lucide-react';

export default function MemoryWall({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [memories, setMemories] = useState<any[]>([]);

  useEffect(() => {
    fetchMemories();
    
    // الاشتراك في التحديثات اللحظية (Realtime)
    const channel = supabase.channel('realtime-memories')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'memories', filter: `event_id=eq.${id}` }, 
      (payload) => {
        // عند وصول رسالة جديدة، نضيفها ونشغل صوت تنبيه خفيف (اختياري)
        fetchNewMemory(payload.new.id); 
      })
      .subscribe();

    return () => { supabase.removeChannel(channel) };
  }, [id]);

  const fetchMemories = async () => {
    const { data } = await supabase
      .from('memories')
      .select('*, attendee:attendees(name, category)')
      .eq('event_id', id)
      .order('created_at', { ascending: false });
    if (data) setMemories(data);
  };

  const fetchNewMemory = async (memoryId: string) => {
    const { data } = await supabase.from('memories').select('*, attendee:attendees(name, category)').eq('id', memoryId).single();
    if (data) setMemories(prev => [data, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white p-8 overflow-hidden font-sans">
      <div className="text-center mb-12">
         <h1 className="text-5xl font-black text-[#C19D65] mb-2 drop-shadow-lg">جدار الذكريات</h1>
         <p className="text-xl text-white/50">شاركونا مشاعركم عبر التذكرة الإلكترونية</p>
      </div>

      {/* Grid Layout (Masonry Style) */}
      <div className="columns-1 md:columns-3 lg:columns-4 gap-6 space-y-6 mx-auto max-w-7xl">
        {memories.map((mem) => (
          <div key={mem.id} className="break-inside-avoid bg-[#18181B] border border-white/10 p-6 rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-4 duration-700">
             <p className="text-lg leading-relaxed mb-4 text-white/90">"{mem.message}"</p>
             <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C19D65] to-black flex items-center justify-center font-bold text-white">
                   {mem.attendee?.name.charAt(0)}
                </div>
                <div>
                   <h4 className="font-bold text-sm">{mem.attendee?.name}</h4>
                   <span className="text-[10px] text-[#C19D65] uppercase tracking-widest">{mem.attendee?.category}</span>
                </div>
                <Heart size={16} className="mr-auto text-red-500 fill-red-500 animate-pulse"/>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}