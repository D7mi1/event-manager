'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { User, Phone, Save, Trash2, Users, Send, Check } from 'lucide-react';

export default function EventDetailsPage() {
  const { id } = useParams();
  const [eventName, setEventName] = useState('');
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null); // لمعرفة من يتم إرسال الرسالة له حالياً

  const [newGuest, setNewGuest] = useState({ name: '', phone: '' });

  useEffect(() => {
    async function getData() {
      if (!id) return;
      const eventRes = await supabase.from('events').select('name').eq('id', id).single();
      if (eventRes.data) setEventName(eventRes.data.name);
      fetchAttendees();
    }
    getData();
  }, [id]);

  async function fetchAttendees() {
    const { data } = await supabase
      .from('attendees')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: false });
    
    setAttendees(data || []);
    setLoading(false);
  }

  async function handleAddGuest(e: React.FormEvent) {
    e.preventDefault();
    if (!newGuest.name || !newGuest.phone) return;

    const { error } = await supabase.from('attendees').insert([
      { event_id: id, name: newGuest.name, phone: newGuest.phone, status: 'pending' }
    ]);

    if (!error) {
      setNewGuest({ name: '', phone: '' });
      fetchAttendees();
    }
  }

  async function handleDelete(guestId: string) {
    if(!confirm('هل أنت متأكد من الحذف؟')) return;
    await supabase.from('attendees').delete().eq('id', guestId);
    fetchAttendees();
  }

  // دالة إرسال الواتساب الجديدة
  async function sendWhatsApp(guest: any) {
    setSendingId(guest.id); // تشغيل مؤشر التحميل

    // رابط التذكرة (سيتحول لرابط حقيقي عند رفع الموقع)
    const ticketLink = `${window.location.origin}/ticket/${guest.id}`;

    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: guest.phone,
          name: guest.name,
          ticketLink: ticketLink
        })
      });

      if (res.ok) {
        alert(`تم إرسال الدعوة إلى ${guest.name} بنجاح! (محاكاة)`);
        // تحديث حالة الضيف إلى "تم الإرسال"
        await supabase.from('attendees').update({ status: 'sent' }).eq('id', guest.id);
        fetchAttendees();
      } else {
        alert('حدث خطأ في الإرسال');
      }
    } catch (err) {
      console.error(err);
      alert('خطأ في الاتصال');
    }

    setSendingId(null); // إيقاف مؤشر التحميل
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="text-blue-600" />
          إدارة مدعوين: {eventName}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* نموذج الإضافة */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-4">
            <h2 className="font-bold text-lg mb-4">إضافة ضيف جديد</h2>
            <form onSubmit={handleAddGuest} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">الاسم</label>
                <input 
                  type="text" required className="w-full p-2 border rounded-lg mt-1"
                  placeholder="الاسم الثلاثي"
                  value={newGuest.name}
                  onChange={e => setNewGuest({...newGuest, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">الجوال</label>
                <input 
                  type="tel" required className="w-full p-2 border rounded-lg mt-1 text-left"
                  placeholder="9665xxxxxxxx"
                  value={newGuest.phone}
                  onChange={e => setNewGuest({...newGuest, phone: e.target.value})}
                />
              </div>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                إضافة
              </button>
            </form>
          </div>
        </div>

        {/* الجدول */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-3 text-right">الاسم</th>
                  <th className="p-3 text-right">الجوال</th>
                  <th className="p-3 text-center">الحالة</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attendees.map((guest) => (
                  <tr key={guest.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium">{guest.name}</td>
                    <td className="p-3 text-gray-600" dir="ltr">{guest.phone}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        guest.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        guest.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {guest.status === 'pending' ? 'انتظار' : 
                         guest.status === 'sent' ? 'تم الإرسال' : 'حضر'}
                      </span>
                    </td>
                    <td className="p-3 flex justify-center gap-2">
                      {/* زر الواتساب */}
                      <button 
                        onClick={() => sendWhatsApp(guest)}
                        disabled={sendingId === guest.id}
                        className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
                        title="إرسال الدعوة"
                      >
                        {sendingId === guest.id ? (
                          <span className="animate-spin">⌛</span>
                        ) : (
                          <Send size={18} />
                        )}
                      </button>

                      {/* زر الحذف */}
                      <button 
                        onClick={() => handleDelete(guest.id)}
                        className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition"
                        title="حذف"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}