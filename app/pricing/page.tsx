'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { Check } from 'lucide-react'

export default function Pricing() {
  const [packages, setPackages] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const getPackages = async () => {
        const { data } = await supabase.from('packages').select('*').order('price')
        if(data) setPackages(data)
    }
    getPackages()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 p-10 flex flex-col items-center justify-center" dir="rtl">
        <h1 className="text-3xl font-bold mb-10">اختر الباقة المناسبة لك</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
            {packages.map(pkg => (
                <div key={pkg.id} className={`bg-white p-8 rounded-2xl border ${pkg.price > 0 ? 'border-indigo-200 shadow-xl' : 'border-slate-200 shadow-sm'}`}>
                    <h3 className="text-xl font-bold text-slate-800">{pkg.name}</h3>
                    <p className="text-4xl font-bold my-4 text-indigo-600">{pkg.price} <span className="text-sm text-slate-400 font-normal">ريال</span></p>
                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center gap-2"><Check size={18} className="text-green-500"/> {pkg.max_events} فعاليات</li>
                        <li className="flex items-center gap-2"><Check size={18} className="text-green-500"/> {pkg.max_attendees_per_event} زائر لكل فعالية</li>
                        <li className="flex items-center gap-2"><Check size={18} className="text-green-500"/> دعم فني</li>
                    </ul>
                    <button className="w-full py-3 rounded-xl font-bold border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition">
                        {pkg.price === 0 ? 'باقتك الحالية' : 'ترقية الباقة'}
                    </button>
                </div>
            ))}
        </div>
    </div>
  )
}