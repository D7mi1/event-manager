'use client'

import { useState, use, useEffect } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { createClient } from '@/app/utils/supabase/client'
import { CheckCircle, XCircle, Loader2, Camera, AlertTriangle, Repeat } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function PublicScanner({ params }: PageProps) {
  const resolvedParams = use(params)
  const eventId = resolvedParams.id
  
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'warning' | 'loading'>('idle')
  const [message, setMessage] = useState('')
  const [guestName, setGuestName] = useState('')
  const [pauseScan, setPauseScan] = useState(false)
  const [allowMultiple, setAllowMultiple] = useState(false)
  const [eventTitle, setEventTitle] = useState('')
  
  const supabase = createClient()

  useEffect(() => {
    const fetchEventSettings = async () => {
        const { data } = await supabase.from('events').select('title, allow_multiple_entry').eq('id', eventId).single()
        if (data) {
            setAllowMultiple(data.allow_multiple_entry || false)
            setEventTitle(data.title)
        }
    }
    fetchEventSettings()
  }, [eventId])

  const handleScan = async (rawText: string) => {
    if (pauseScan || status === 'loading' || status === 'success' || status === 'warning') return

    try {
      if (!rawText) return
      setPauseScan(true)
      setStatus('loading')
      
      const parsedData = JSON.parse(rawText)
      if (parsedData.eventId !== eventId) {
          setStatus('error'); setMessage('⛔ تذكرة لحفلة أخرى!'); return
      }

      const { data: attendee, error: fetchError } = await supabase
          .from('attendees').select('*').eq('event_id', eventId).eq('phone', parsedData.phone).single()

      if (fetchError || !attendee) {
          setStatus('error'); setMessage('❌ الضيف غير موجود'); return
      }

      if (attendee.status === 'attended' && !allowMultiple) {
            setStatus('warning')
            setMessage('⚠️ التذكرة مستخدمة مسبقاً!')
            setGuestName(attendee.name)
            setTimeout(() => { setStatus('idle'); setGuestName(''); setMessage(''); setPauseScan(false) }, 3000)
            return
      }

      // تسجيل الحضور مع الوقت
      const { error: updateError } = await supabase
          .from('attendees')
          .update({ 
              status: 'attended', 
              attended_at: new Date().toISOString() 
          })
          .eq('id', attendee.id)

      if (updateError) {
          setStatus('error'); setMessage('خطأ في التسجيل')
      } else {
          setStatus('success')
          setGuestName(attendee.name)
          setMessage(attendee.status === 'attended' ? '✅ دخول متكرر' : '✅ مسموح بالدخول')
          setTimeout(() => { setStatus('idle'); setMessage(''); setGuestName(''); setPauseScan(false) }, 3000)
      }

    } catch (err) {
      setStatus('error'); setMessage('⚠️ باركود غير صالح')
      setTimeout(() => { setStatus('idle'); setPauseScan(false) }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative" dir="rtl">
      <div className="absolute top-6 w-full text-center z-10">
        <h1 className="text-white font-bold text-lg drop-shadow-md">{eventTitle}</h1>
        <div className="flex justify-center items-center gap-2 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 backdrop-blur-md border ${allowMultiple ? 'bg-green-500/20 border-green-500/30 text-green-100' : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-100'}`}>
                {allowMultiple ? <><Repeat size={12}/> دخول متعدد</> : <><AlertTriangle size={12}/> دخول مرة واحدة</>}
            </span>
        </div>
      </div>

      <div className="w-full max-w-md bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl relative border border-zinc-800">
        <div className="relative h-96 bg-black overflow-hidden">
            {status === 'success' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-600 text-white z-20 animate-in fade-in zoom-in duration-300">
                    <CheckCircle size={80} className="mb-4" />
                    <h2 className="text-3xl font-bold mb-2">أهلاً بك!</h2>
                    <p className="text-xl font-medium">{guestName}</p>
                </div>
            )}
            {status === 'warning' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-yellow-500 text-white z-20 animate-in fade-in zoom-in duration-300">
                    <AlertTriangle size={80} className="mb-4" />
                    <h2 className="text-2xl font-bold mb-2 text-center">سبق له الدخول!</h2>
                    <p className="text-xl font-medium">{guestName}</p>
                </div>
            )}
            {status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-600 text-white z-20 animate-in fade-in duration-300">
                    <XCircle size={80} className="mb-4" />
                    <h2 className="text-2xl font-bold text-center px-4">{message}</h2>
                    <button onClick={() => { setStatus('idle'); setPauseScan(false); }} className="mt-6 bg-white text-red-600 px-6 py-2 rounded-full font-bold shadow-lg">استمرار</button>
                </div>
            )}
            {status === 'loading' && <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 backdrop-blur-sm"><Loader2 className="animate-spin text-indigo-500 w-16 h-16"/></div>}

            <div className="h-full w-full relative">
                 <Scanner onScan={(result) => { if (result && result.length > 0) handleScan(result[0].rawValue) }} allowMultiple={true} scanDelay={2000} components={{ audio: false, finder: false }} styles={{ container: { height: '100%' }, video: { objectFit: 'cover' } }} />
            </div>
            
            {status === 'idle' && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
                    <div className={`w-64 h-64 border-2 ${allowMultiple ? 'border-green-500/50' : 'border-indigo-500/50'} rounded-3xl relative animate-pulse`}>
                         <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-current rounded-tl-2xl opacity-50"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-current rounded-tr-2xl opacity-50"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-current rounded-bl-2xl opacity-50"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-current rounded-br-2xl opacity-50"></div>
                    </div>
                </div>
            )}
        </div>
        
        {/* تم إصلاح الخطأ في هذا الجزء */}
        <div className="bg-zinc-900 border-t border-zinc-800 text-white p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-zinc-400 mb-1">
                <Camera size={16} />
                <span className="text-xs uppercase tracking-wider font-semibold">بوابة الدخول</span>
            </div>
            <p className="font-bold text-lg text-indigo-400">
                {status === 'idle' ? 'جاهز للمسح...' : 'جاري المعالجة'}
            </p>
        </div>
      </div>
    </div>
  )
}