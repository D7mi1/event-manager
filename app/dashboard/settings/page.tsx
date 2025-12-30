'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/utils/supabase/client';
import { User, CreditCard, Shield, Bell, Download, Check, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // بيانات وهمية للفواتير (للعرض فقط)
  const invoices = [
    { id: 'INV-001', date: '2025-01-01', amount: '0.00', status: 'paid', plan: 'Free Plan' },
    // يمكن إضافة فواتير مدفوعة هنا مستقبلاً
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data || {});
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('سيتم تفعيل تحديث البيانات قريباً..');
  };

  if (loading) return <div className="p-10 text-white">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white p-6 pt-24 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-8">الإعدادات والاشتراكات</h1>

        {/* Tabs Navigation */}
        <div className="flex gap-4 border-b border-white/10 mb-8 overflow-x-auto">
          <button onClick={() => setActiveTab('profile')} className={`pb-4 px-4 flex items-center gap-2 font-bold transition-all ${activeTab === 'profile' ? 'text-[#C19D65] border-b-2 border-[#C19D65]' : 'text-white/40 hover:text-white'}`}>
            <User size={18} /> الملف الشخصي
          </button>
          <button onClick={() => setActiveTab('billing')} className={`pb-4 px-4 flex items-center gap-2 font-bold transition-all ${activeTab === 'billing' ? 'text-[#C19D65] border-b-2 border-[#C19D65]' : 'text-white/40 hover:text-white'}`}>
            <CreditCard size={18} /> الاشتراكات والفواتير
          </button>
          <button onClick={() => setActiveTab('security')} className={`pb-4 px-4 flex items-center gap-2 font-bold transition-all ${activeTab === 'security' ? 'text-[#C19D65] border-b-2 border-[#C19D65]' : 'text-white/40 hover:text-white'}`}>
            <Shield size={18} /> الأمان
          </button>
        </div>

        {/* --- Tab: Profile --- */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
             <div className="bg-[#0F0F12] border border-white/5 rounded-[2rem] p-8">
               <h3 className="text-xl font-bold mb-6">بيانات الحساب</h3>
               <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                  <div>
                    <label className="text-xs font-bold text-white/50 block mb-2">الاسم الكامل</label>
                    <input type="text" defaultValue={profile.full_name} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-[#C19D65]" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/50 block mb-2">اسم الشركة / الجهة (للفاتورة)</label>
                    <input type="text" defaultValue={profile.company_name} placeholder="اختياري" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-[#C19D65]" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/50 block mb-2">الرقم الضريبي (VAT Number)</label>
                    <input type="text" defaultValue={profile.tax_number} placeholder="3xxxxxxxxxxxxx" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-[#C19D65]" />
                  </div>
                  <button className="bg-[#C19D65] text-black px-8 py-3 rounded-xl font-bold mt-4 hover:opacity-90">حفظ التغييرات</button>
               </form>
             </div>
          </div>
        )}

        {/* --- Tab: Billing --- */}
        {activeTab === 'billing' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Current Plan Card */}
            <div className="bg-gradient-to-r from-[#0F0F12] to-[#1A1A1D] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-2 h-full bg-[#C19D65]"></div>
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-white/50 mb-1">الباقة الحالية</p>
                    <h2 className="text-3xl font-black text-white mb-2">الباقة المجانية (Starter)</h2>
                    <p className="text-[#C19D65] text-sm font-bold flex items-center gap-2">
                       <Check size={14} /> فعالة ونشطة
                    </p>
                  </div>
                  <button className="bg-[#C19D65] text-black px-6 py-2 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform">
                    ترقية الباقة 🚀
                  </button>
               </div>
               <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase">الفعاليات المتبقية</p>
                    <p className="text-xl font-bold">1 <span className="text-xs text-white/30">/ 1</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase">الضيوف لكل فعالية</p>
                    <p className="text-xl font-bold">50</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase">تاريخ التجديد</p>
                    <p className="text-xl font-bold">مدى الحياة</p>
                  </div>
               </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-[#0F0F12] border border-white/5 rounded-[2rem] p-8">
               <h3 className="text-xl font-bold mb-6">سجل الفواتير</h3>
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-right">
                   <thead>
                     <tr className="text-white/40 border-b border-white/5">
                       <th className="pb-4 pr-4">رقم الفاتورة</th>
                       <th className="pb-4">التاريخ</th>
                       <th className="pb-4">الباقة</th>
                       <th className="pb-4">المبلغ</th>
                       <th className="pb-4">الحالة</th>
                       <th className="pb-4"></th>
                     </tr>
                   </thead>
                   <tbody>
                     {invoices.map((inv) => (
                       <tr key={inv.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                         <td className="py-4 pr-4 font-mono text-white/70">{inv.id}</td>
                         <td className="py-4">{inv.date}</td>
                         <td className="py-4">{inv.plan}</td>
                         <td className="py-4 font-bold">{inv.amount} ر.س</td>
                         <td className="py-4">
                           <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs font-bold border border-green-500/20">مدفوعة</span>
                         </td>
                         <td className="py-4 text-left pl-4">
                           <button className="text-white/40 hover:text-[#C19D65] transition-colors"><Download size={16} /></button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}