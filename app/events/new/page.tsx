'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation'; 
import { Calendar, MapPin, Type, Save, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: ''
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); 
    setLoading(true);

    // إرسال البيانات لقاعدة البيانات
    const { error } = await supabase
      .from('events')
      .insert([
        { 
          name: formData.name, 
          event_date: formData.date, 
          location: formData.location 
        }
      ]);

    if (error) {
      alert('حدث خطأ أثناء الحفظ!');
      console.error(error);
      setLoading(false);
    } else {
      // العودة للصفحة الرئيسية وتحديث البيانات
      router.push('/');
      router.refresh(); 
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Link href="/" className="flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-900">
        <ArrowRight size={20} />
        <span>العودة للرئيسية</span>
      </Link>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">إنشاء فعالية جديدة 📝</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* الاسم */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اسم الفعالية</label>
            <div className="relative">
              <Type className="absolute right-3 top-3 text-gray-400" size={20} />
              <input 
                type="text" 
                required
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="مثلاً: حفل تخرج أحمد"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          {/* التاريخ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الفعالية</label>
            <div className="relative">
              <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                <Calendar size={20} />
              </div>
              <input 
                type="datetime-local" 
                required
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          {/* الموقع */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الموقع</label>
            <div className="relative">
              <MapPin className="absolute right-3 top-3 text-gray-400" size={20} />
              <input 
                type="text" 
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="مثلاً: قاعة الملكية - الرياض"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          {/* زر الحفظ */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2"
          >
            {loading ? (
              <span>جاري الحفظ...</span>
            ) : (
              <>
                <Save size={20} />
                <span>حفظ الفعالية</span>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}