'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { QRCodeSVG } from 'qrcode.react'; // استيراد مكتبة الـ QR
import { Calendar, MapPin, User, CheckCircle } from 'lucide-react';

export default function TicketPage() {
  const { id } = useParams(); // هذا هو رقم تعريف الضيف (attendee_id)
  const [ticketData, setTicketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getTicket() {
      // نجلب بيانات الضيف + بيانات الحفل المرتبط به
      const { data, error } = await supabase
        .from('attendees')
        .select(`
          *,
          events (
            name,
            event_date,
            location
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setTicketData(data);
      }
      setLoading(false);
    }
    getTicket();
  }, [id]);

  if (loading) return <div className="text-center p-10">جاري تحميل التذكرة...</div>;

  if (!ticketData) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
        <h1 className="text-xl font-bold text-red-500 mb-2">تذكرة غير موجودة</h1>
        <p className="text-gray-500">تأكد من الرابط وحاول مرة أخرى</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* تصميم التذكرة */}
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative">
        
        {/* رأس التذكرة ملون */}
        <div className="bg-blue-600 p-6 text-center text-white pb-10">
          <h1 className="text-2xl font-bold mb-1">{ticketData.events.name}</h1>
          <p className="text-blue-100 text-sm">دعوة خاصة</p>
        </div>

        {/* جسم التذكرة */}
        <div className="px-6 -mt-8 relative z-10">
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            
            {/* الـ QR Code */}
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                <QRCodeSVG 
                  value={ticketData.id} // محتوى الكود هو رقم هوية الضيف
                  size={150}
                  fgColor="#000000"
                />
              </div>
            </div>

            {/* تفاصيل الضيف */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                  <User size={20} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">الضيف الكريم</p>
                  <p className="font-bold text-gray-800">{ticketData.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                  <Calendar size={20} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">التاريخ</p>
                  <p className="font-bold text-gray-800">
                    {new Date(ticketData.events.event_date).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>

               <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <MapPin size={20} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">الموقع</p>
                  <p className="font-bold text-gray-800">{ticketData.events.location}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t flex justify-center text-green-600 gap-1 text-sm font-medium">
              <CheckCircle size={16} />
              <span>تذكرة مؤكدة</span>
            </div>

          </div>
        </div>

        {/* ذيل التذكرة */}
        <div className="bg-gray-50 p-6 text-center text-gray-400 text-xs mt-4">
          نظام إدارة الفعاليات الذكي © 2024
        </div>
      </div>
    </div>
  );
}