'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
// نستخدم @ للوصول السريع للمجلد، تأكد أن EventCard موجود داخل app/components
import EventCard from '@/app/components/EventCard'; 
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error('Error:', error);
      else setEvents(data || []);
      
      setLoading(false);
    }

    fetchEvents();
  }, []);

  return (
    <div>
      {/* العنوان وزر الإضافة */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">فعالياتي</h1>
        
        {/* تم تحديث هذا الزر ليصبح رابطاً للصفحة الجديدة */}
        <Link 
          href="/events/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          <span>فعالية جديدة</span>
        </Link>
      </div>

      {/* منطقة عرض البيانات */}
      {loading ? (
        <p className="text-gray-500">جاري التحميل...</p>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">لا توجد فعاليات حالياً</p>
          <p className="text-sm text-gray-400">اضغط على زر "فعالية جديدة" للبدء</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard 
              key={event.id}
              id={event.id}
              name={event.name}
              date={event.event_date}
              location={event.location}
            />
          ))}
        </div>
      )}
    </div>
  );
}