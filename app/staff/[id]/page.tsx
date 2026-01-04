'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/app/utils/supabase/client'
import { Search, CheckCircle, Clock, Plus, Loader2, X, Shield, Trash2, Edit, Save, UserPlus } from 'lucide-react'
import { Attendee } from '@/types'

interface PageProps { params: Promise<{ id: string }> }

export default function StaffPage({ params }: PageProps) {
    const resolvedParams = use(params)
    const eventId = resolvedParams.id

    const [attendees, setAttendees] = useState<Attendee[]>([])
    const [event, setEvent] = useState<any>(null)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)

    const [formData, setFormData] = useState({ name: '', phone: '' })
    const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null)
    const [processing, setProcessing] = useState(false)

    // const supabase = createClient() // Removed in favor of imported instance

    const fetchData = async () => {
        const { data: eventData } = await supabase.from('events').select('title').eq('id', eventId).single()
        setEvent(eventData)

        const { data: attendeesData } = await supabase
            .from('attendees')
            .select('*')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false })

        if (attendeesData) setAttendees(attendeesData)
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [eventId])

    const toggleCheckIn = async (attendee: Attendee) => {
        const newStatus = attendee.status === 'confirmed' ? 'pending' : 'confirmed'
        const checkInTime = newStatus === 'confirmed' ? new Date().toISOString() : null

        setAttendees(prev => prev.map(a => a.id === attendee.id ? { ...a, status: newStatus, check_in_time: checkInTime } : a))
        await supabase.from('attendees').update({ status: newStatus, check_in_time: checkInTime }).eq('id', attendee.id)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('⚠️ هل أنت متأكد من حذف هذا الاسم نهائياً من القائمة؟')) return
        const { error } = await supabase.from('attendees').delete().eq('id', id)
        if (!error) setAttendees(prev => prev.filter(a => a.id !== id))
        else alert('حدث خطأ أثناء الحذف')
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        setProcessing(true)
        const phone = formData.phone.startsWith('+') ? formData.phone : `+966${formData.phone.replace(/^0+/, '')}`

        const { data, error } = await supabase.from('attendees').insert([{
            event_id: eventId,
            name: formData.name,
            phone: phone,
            email: `${phone}@manual.com`,
            status: 'confirmed',
            check_in_time: new Date().toISOString()
        }]).select().single()

        if (!error && data) {
            setAttendees([data, ...attendees])
            setShowAddModal(false)
            setFormData({ name: '', phone: '' })
            alert('✅ تم التحضير بنجاح')
        } else {
            alert('❌ خطأ: قد يكون الرقم مسجلاً مسبقاً')
        }
        setProcessing(false)
    }

    const openEditModal = (attendee: Attendee) => {
        setSelectedAttendee(attendee)
        setFormData({ name: attendee.name, phone: attendee.phone || '' })
        setShowEditModal(true)
    }

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedAttendee) return
        setProcessing(true)

        const { error } = await supabase
            .from('attendees')
            .update({ name: formData.name })
            .eq('id', selectedAttendee.id)

        if (!error) {
            setAttendees(prev => prev.map(a => a.id === selectedAttendee.id ? { ...a, name: formData.name } : a))
            setShowEditModal(false)
            setSelectedAttendee(null)
        } else {
            alert('فشل التعديل')
        }
        setProcessing(false)
    }

    const filtered = attendees.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || (a.phone && a.phone.includes(search)))

    if (loading) return <div className="min-h-screen flex justify-center items-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600" /></div>

    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-24" dir="rtl">

            {/* الهيدر */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4 sticky top-4 z-10 flex justify-between items-center">
                <div>
                    <h1 className="font-bold text-slate-800 text-lg truncate max-w-[180px]">{event?.title}</h1>
                    <p className="text-xs text-orange-500 flex items-center gap-1 font-bold"><Shield size={12} /> مشرف ميداني</p>
                </div>
                <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                    {attendees.filter(a => a.status === 'confirmed').length} <span className="text-slate-400 font-normal">/ {attendees.length}</span>
                </div>
            </div>

            {/* البحث */}
            <div className="relative mb-4">
                <Search className="absolute right-3 top-3.5 text-slate-400" size={20} />
                <input
                    className="w-full bg-white pl-4 pr-10 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition shadow-sm"
                    placeholder="بحث بالاسم أو الرقم..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* القائمة */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">لا توجد نتائج</div>
                ) : (
                    filtered.map(att => (
                        <div key={att.id} className={`p-4 rounded-xl border flex justify-between items-center transition shadow-sm ${att.status === 'confirmed' ? 'bg-green-50/50 border-green-200' : 'bg-white border-slate-200'}`}>

                            <div className="flex-1">
                                <h3 className="font-bold text-slate-800 mb-0.5">{att.name}</h3>
                                <p className="text-xs text-slate-500 font-mono mb-2" dir="ltr">{att.phone}</p>

                                <div className="flex gap-3">
                                    <button onClick={() => openEditModal(att)} className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 text-[10px] bg-slate-100 px-2 py-1 rounded hover:bg-indigo-50 transition">
                                        <Edit size={12} /> تعديل
                                    </button>
                                    <button onClick={() => handleDelete(att.id)} className="text-slate-400 hover:text-red-600 flex items-center gap-1 text-[10px] bg-slate-100 px-2 py-1 rounded hover:bg-red-50 transition">
                                        <Trash2 size={12} /> حذف
                                    </button>
                                </div>

                                {att.check_in_time && att.status === 'confirmed' && (
                                    <p className="text-[10px] text-green-600 flex items-center gap-1 mt-2 font-medium">
                                        <Clock size={10} /> دخل: {new Date(att.check_in_time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={() => toggleCheckIn(att)}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-sm ml-2 shrink-0 ${att.status === 'confirmed' ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-slate-100 text-slate-300 hover:bg-indigo-100 hover:text-indigo-600'}`}
                            >
                                <CheckCircle size={24} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* زر التحضير اليدوي (تم تعديل النص هنا) */}
            <button
                onClick={() => { setFormData({ name: '', phone: '' }); setShowAddModal(true) }}
                className="fixed bottom-6 left-6 bg-indigo-600 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition font-bold z-20"
            >
                <UserPlus size={24} /> <span>تحضير يدوي</span>
            </button>

            {/* نافذة الإضافة */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg flex items-center gap-2"><UserPlus className="text-indigo-600" size={20} /> تحضير زائر جديد</h3>
                            <button onClick={() => setShowAddModal(false)} className="bg-slate-100 p-1 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-500"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">الاسم الثلاثي</label>
                                <input required className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="الاسم" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">رقم الجوال</label>
                                <input required type="tel" className="w-full p-3 border border-slate-300 rounded-xl text-right focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="5xxxxxxxx" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <button disabled={processing} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold mt-2 shadow-lg hover:bg-indigo-700 transition flex justify-center items-center gap-2">
                                {processing ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                                <span>تسجيل ودخول فوري</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* نافذة التعديل */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg flex items-center gap-2"><Edit className="text-orange-500" size={20} /> تعديل البيانات</h3>
                            <button onClick={() => setShowEditModal(false)} className="bg-slate-100 p-1 rounded-full text-slate-500 hover:bg-slate-200"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">الاسم الجديد</label>
                                <input required className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="opacity-50 pointer-events-none">
                                <label className="text-sm font-medium text-slate-700 block mb-1">رقم الجوال (لا يمكن تعديله)</label>
                                <input readOnly className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-right" value={formData.phone} />
                            </div>
                            <button disabled={processing} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold mt-2 shadow-lg hover:bg-slate-800 transition flex justify-center items-center gap-2">
                                {processing ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                <span>حفظ التعديلات</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}