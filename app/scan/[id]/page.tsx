'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/app/utils/supabase/client';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Loader2, ScanLine, Lock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { verifyEventPin } from '@/app/actions/verifyPin'; // تأكد أنك أنشأت هذا الملف كما في الخطوة السابقة

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ScannerPage({ params }: PageProps) {
  const { id } = use(params);

  // States
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  
  // Scanner States
  const [scanResult, setScanResult] = useState<{status: 'idle' | 'success' | 'error', message: string}>({ status: 'idle', message: '' });
  const [lastScannedId, setLastScannedId] = useState<string | null>(null);

  // --- 1. تسجيل الدخول (للمشرف) ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // نتحقق من الرمز عبر السيرفر (أكثر أماناً)
    const result = await verifyEventPin(id, pin);
    
    if (result.success) {
      setIsAuthenticated(true);
    } else {
      alert('رمز الدخول غير صحيح ❌');
    }
    setLoading(false);
  };

  // --- 2. دالة المسح الآمنة (RPC Call) ---
  const onScan = async (detectedCodes: any[]) => {
    if (detectedCodes.length === 0) return;
    
    const guestId = detectedCodes[0].rawValue;

    // منع التكرار السريع لنفس الكود
    if (guestId === lastScannedId) return;
    setLastScannedId(guestId);

    setLoading(true);

    try {
      // 🔥 هنا نستخدم الدالة الآمنة التي أنشأناها في قاعدة البيانات
      const { data: success, error } = await supabase
        .rpc('mark_attended', { 
          attendee_id: guestId, 
          input_pin: pin // نرسل الرمز للتأكد من الصلاحية
        });

      if (error) throw error;

      if (success) {
        // نجاح: تشغيل صوت أو اهتزاز
        if (navigator.vibrate) navigator.vibrate(200);
        setScanResult({ status: 'success', message: '✅ تم التحضير بنجاح' });
      } else {
        // فشل (الرمز خطأ أو التذكرة لا تتبع هذه الفعالية)
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        setScanResult({ status: 'error', message: '❌ تذكرة غير صالحة أو رمز خاطئ' });
      }

    } catch (err) {
      console.error(err);
      setScanResult({ status: 'error', message: 'حدث خطأ في النظام' });
    } finally {
      setLoading(false);
      // إعادة تعيين الحالة بعد ثانتين للمسح التالي
      setTimeout(() => {
        setScanResult({ status: 'idle', message: '' });
        setLastScannedId(null);
      }, 2000);
    }
  };

  // --- الشاشة 1: تسجيل دخول المشرف ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex flex-col items-center justify-center p-6 text-white" dir="rtl">
        <div className="w-full max-w-sm space-y-8">
           <div className="text-center">
              <div className="w-20 h-20 bg-[#C19D65]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#C19D65]">
                 <Lock size={40} />
              </div>
              <h1 className="text-2xl font-black">بوابة المشرفين</h1>
              <p className="text-white/40 mt-2">أدخل رمز الدخول (PIN) الخاص بالفعالية</p>
           </div>

           <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password" 
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="****"
                className="w-full bg-[#18181B] border border-white/10 rounded-2xl py-4 text-center text-3xl font-mono tracking-[1em] outline-none focus:border-[#C19D65] transition-colors"
              />
              <button 
                disabled={loading || pin.length < 4}
                className="w-full bg-[#C19D65] text-black font-bold py-4 rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                 {loading ? <Loader2 className="animate-spin mx-auto"/> : 'دخول'}
              </button>
           </form>
        </div>
      </div>
    );
  }

  // --- الشاشة 2: الماسح الضوئي ---
  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col">
      
      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-20 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
         <h2 className="font-bold flex items-center gap-2"><ScanLine size={20} className="text-[#C19D65]"/> الماسح النشط</h2>
         <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-mono">LIVE</div>
      </div>

      {/* Scanner Viewport */}
      <div className="flex-1 relative overflow-hidden bg-gray-900">
         <Scanner 
            onScan={onScan} 
            styles={{ container: { height: '100%' } }}
            components={{ audio: false, finder: false }} // نلغي الفايندر الافتراضي لنصمم خاص بنا
         />
         
         {/* Custom Overlay */}
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-2 border-[#C19D65]/50 rounded-3xl relative">
               <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-[#C19D65] -ml-1 -mt-1 rounded-tl-xl"></div>
               <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-[#C19D65] -mr-1 -mt-1 rounded-tr-xl"></div>
               <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-[#C19D65] -ml-1 -mb-1 rounded-bl-xl"></div>
               <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-[#C19D65] -mr-1 -mb-1 rounded-br-xl"></div>
               
               {/* Scan Line Animation */}
               <div className="absolute left-0 right-0 h-0.5 bg-[#C19D65] shadow-[0_0_20px_#C19D65] animate-[scan_2s_infinite]"></div>
            </div>
         </div>

         {/* Result Popup Overlay */}
         {scanResult.status !== 'idle' && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
               <div className={`p-8 rounded-[2rem] text-center transform scale-110 ${scanResult.status === 'success' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                  {scanResult.status === 'success' ? <CheckCircle2 size={64} className="mx-auto mb-4"/> : <XCircle size={64} className="mx-auto mb-4"/>}
                  <h2 className="text-2xl font-black">{scanResult.message}</h2>
               </div>
            </div>
         )}
      </div>

      {/* Footer / Instructions */}
      <div className="bg-[#18181B] p-6 pb-10 text-center rounded-t-[2rem] border-t border-white/10 z-20">
         <p className="text-sm text-white/50 mb-2">وجّه الكاميرا نحو باركود التذكرة</p>
         <div className="inline-flex items-center gap-2 text-[10px] text-white/30 bg-white/5 px-3 py-1 rounded-full">
            <Lock size={10} /> الاتصال مؤمن ومشفر
         </div>
      </div>

    </div>
  );
}