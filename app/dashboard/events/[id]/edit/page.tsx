'use client'

import { useState, useEffect, use } from 'react'
import { supabase } from '@/app/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Type, Loader2, FileText, Link as LinkIcon, Clock, Save, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface PageProps { params: Promise<{ id: string }> }

export default function EditEvent({ params }: PageProps) {
  const resolvedParams = use(params)
  const eventId = resolvedParams.id

  const [formData, setFormData] = useState({
    title: '', event_date: '', event_time: '', location: '', description: '', map_link: '', allow_multiple_entry: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)


  const router = useRouter()

  useEffect(() => {
    const fetchEvent = async () => {
      const { data } = await supabase.from('events').select('*').eq('id', eventId).single()
      if (data) setFormData(data)
      setLoading(false)
    }
    fetchEvent()
  }, [eventId, supabase])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('events')
      .update({
        title: formData.title,
        event_date: formData.event_date,
        event_time: formData.event_time,
        location: formData.location,
        description: formData.description,
        map_link: formData.map_link,
        allow_multiple_entry: formData.allow_multiple_entry
      })
      .eq('id', eventId)

    if (error) {
      alert('حدث خطأ أثناء التحديث')
      setSaving(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  if (loading) return <div className="p-10 text-center">جاري جلب البيانات...</div>

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto" dir="rtl">
      <Link href="/dashboard" className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-6 w-fit"><ArrowRight size={18} /> إلغاء وعودة</Link>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">تعديل المناسبة</h1>

      <form onSubmit={handleUpdate} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">

        {/* الاسم */}
        <div><label className="block text-slate-700 font-medium mb-2">اسم المناسبة</label><div className="relative"><Type className="absolute right-3 top-3 text-slate-400" size={20} /><input type="text" required className="w-full p-3 pr-10 border border-slate-300 rounded-lg outline-none focus:border-indigo-500" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div></div>

        {/* الوصف */}
        <div><label className="block text-slate-700 font-medium mb-2">التفاصيل</label><div className="relative"><FileText className="absolute right-3 top-3 text-slate-400" size={20} /><textarea className="w-full p-3 pr-10 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 min-h-[100px]" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div></div>

        {/* التاريخ والوقت */}
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-slate-700 font-medium mb-2">التاريخ</label><div className="relative"><Calendar className="absolute right-3 top-3 text-slate-400" size={20} /><input type="date" required className="w-full p-3 pr-10 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-right" value={formData.event_date} onChange={(e) => setFormData({ ...formData, event_date: e.target.value })} /></div></div>
          <div><label className="block text-slate-700 font-medium mb-2">الوقت</label><div className="relative"><Clock className="absolute right-3 top-3 text-slate-400" size={20} /><input type="time" className="w-full p-3 pr-10 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-right" value={formData.event_time || ''} onChange={(e) => setFormData({ ...formData, event_time: e.target.value })} /></div></div>
        </div>

        {/* الموقع */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-slate-700 font-medium mb-2">الموقع</label><div className="relative"><MapPin className="absolute right-3 top-3 text-slate-400" size={20} /><input type="text" required className="w-full p-3 pr-10 border border-slate-300 rounded-lg outline-none focus:border-indigo-500" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} /></div></div>
          <div><label className="block text-slate-700 font-medium mb-2">رابط الخريطة</label><div className="relative"><LinkIcon className="absolute right-3 top-3 text-slate-400" size={20} /><input type="url" className="w-full p-3 pr-10 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 text-left" dir="ltr" value={formData.map_link || ''} onChange={(e) => setFormData({ ...formData, map_link: e.target.value })} /></div></div>
        </div>

        {/* خيار التكرار */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={formData.allow_multiple_entry} onChange={(e) => setFormData({ ...formData, allow_multiple_entry: e.target.checked })} />
            <span className="font-medium text-slate-800">السماح بالدخول المتعدد</span>
          </label>
        </div>

        <button type="submit" disabled={saving} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg flex items-center justify-center gap-2">
          {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> حفظ التعديلات</>}
        </button>
      </form>
    </div>
  )
}