'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/app/utils/supabase/client';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Loader2, ScanLine, Lock, CheckCircle2, XCircle, Download, Copy, Check } from 'lucide-react';
import { verifyEventPin } from '@/app/actions/verifyPin';

interface PageProps { params: Promise<{ id: string }>; }

export default function ScannerPage({ params }: PageProps) {
  const { id } = use(params);

  // States
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [showEditPin, setShowEditPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  
  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  // Scanner States
  const [scanResult, setScanResult] = useState<{status: 'idle' | 'success' | 'error', message: string}>({ status: 'idle', message: '' });
  const [lastScannedId, setLastScannedId] = useState<string | null>(null);

  // --- 1. إعداد التثبيت (PWA) ---
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  // --- 2. إعداد الصوت ---
  const playSound = (type: 'success' | 'error') => {
    const audio = new Audio(type === 'success' ? '/sounds/success.mp3' : '/sounds/error.mp3');
    audio.play().catch(e => console.log('Audio blocked:', e));
  };

  // --- 3. تسجيل الدخول ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await verifyEventPin(id, pin);
    if (result.success) {
      setIsAuthenticated(true);
    } else {
      alert('رمز الدخول غير صحيح ❌');
      if (navigator.vibrate) navigator.vibrate(500); // اهتزاز طويل عند الخطأ
    }
    setLoading(false);
  };

  // --- 3.5 تعديل PIN code ---
  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      alert('الرمز يجب أن يكون 4 أرقام على الأقل');
      return;
    }
    setPin(newPin);
    setNewPin('');
    setShowEditPin(false);
    alert('تم تحديث رمز الدخول ✅');
  };

  // --- 3.6 الخروج من وضع الماسح ---
  const handleLogout = () => {
    setIsAuthenticated(false);
    setPin('');
    setShowEditPin(false);
  };

  // --- 3.7 نسخ رابط الماسح ---
  const handleCopyScannerLink = async () => {
    const link = `${window.location.origin}/scan/${id}`;
    await navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // --- 4. دالة المسح مع التغذية الراجعة ---
  const onScan = async (detectedCodes: any[]) => {
    if (detectedCodes.length === 0) return;
    const guestId = detectedCodes[0].rawValue;

    if (guestId === lastScannedId) return;
    setLastScannedId(guestId);

    setLoading(true);

    try {
      const { data: success, error } = await supabase
        .rpc('mark_attended', { attendee_id: guestId, input_pin: pin });

      if (error) throw error;

      if (success) {
        // ✅ نجاح
        playSound('success');
        if (navigator.vibrate) navigator.vibrate(200); // اهتزاز قصير
        setScanResult({ status: 'success', message: '✅ تم التحضير بنجاح' });
      } else {
        // ❌ فشل (تذكرة غير صالحة)
        playSound('error');
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]); // اهتزاز متقطع
        setScanResult({ status: 'error', message: '❌ تذكرة غير صالحة' });
      }

    } catch (err) {
      console.error(err);
      playSound('error');
      setScanResult({ status: 'error', message: 'حدث خطأ في النظام' });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setScanResult({ status: 'idle', message: '' });
        setLastScannedId(null);
      }, 2500);
    }
  };

  // --- شاشة الدخول ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex flex-col items-center justify-center p-6 text-white" dir="rtl">
        <div className="w-full max-w-sm space-y-8">
           <div className="text-center">
              <div className="w-20 h-20 bg-[#C19D65]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#C19D65]">
                 <Lock size={40} />
              </div>
              <h1 className="text-2xl font-black">بوابة المشرفين</h1>
              <p className="text-white/40 mt-2">أدخل رمز الدخول (PIN)</p>
           </div>
           <form onSubmit={handleLogin} className="space-y-4">
              <input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value)}
                placeholder="****" className="w-full bg-[#18181B] border border-white/10 rounded-2xl py-4 text-center text-3xl font-mono tracking-[1em] outline-none focus:border-[#C19D65]" />
              <button disabled={loading || pin.length < 4} className="w-full bg-[#C19D65] text-black font-bold py-4 rounded-xl hover:brightness-110 disabled:opacity-50">
                 {loading ? <Loader2 className="animate-spin mx-auto"/> : 'دخول'}
              </button>
           </form>

           {/* عرض رابط الماسح */}
           <div className="bg-[#18181B] border border-white/10 rounded-xl p-4 space-y-3">
             <p className="text-xs text-white/50">رابط الماسح الضوئي</p>
             <div className="flex gap-2 items-center">
               <input type="text" readOnly value={`${typeof window !== 'undefined' ? window.location.origin : ''}/scan/${id}`}
                 className="flex-1 bg-[#27272A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 font-mono truncate outline-none" />
               <button type="button" onClick={handleCopyScannerLink}
                 className="p-2 bg-[#27272A] hover:bg-[#3F3F46] rounded-lg transition">
                 {copiedLink ? <Check size={18} className="text-green-500"/> : <Copy size={18} className="text-white/60"/>}
               </button>
             </div>
             {copiedLink && <p className="text-xs text-green-500">✅ تم نسخ الرابط!</p>}
           </div>
           
           {/* زر تثبيت التطبيق */}
           {deferredPrompt && (
             <button onClick={handleInstallClick} className="w-full py-3 bg-[#27272A] rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-white/10">
               <Download size={16} /> تثبيت التطبيق على الجوال
             </button>
           )}
        </div>
      </div>
    );
  }

  // --- شاشة الماسح ---
  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col">
      <div className="absolute top-0 left-0 w-full z-20 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
         <h2 className="font-bold flex items-center gap-2"><ScanLine size={20} className="text-[#C19D65]"/> الماسح النشط</h2>
         <div className="flex items-center gap-3">
           <button onClick={() => setShowEditPin(true)} className="bg-[#27272A] hover:bg-[#3F3F46] px-3 py-1 rounded-lg text-xs font-bold transition">
             🔐 تعديل PIN
           </button>
           <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-mono flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> LIVE
           </div>
         </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-gray-900">
         <Scanner onScan={onScan} styles={{ container: { height: '100%' } }} />
         
         {/* Custom Viewfinder */}
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-2 border-[#C19D65]/50 rounded-3xl relative">
               <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-[#C19D65] -ml-1 -mt-1 rounded-tl-xl"></div>
               <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-[#C19D65] -mr-1 -mt-1 rounded-tr-xl"></div>
               <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-[#C19D65] -ml-1 -mb-1 rounded-bl-xl"></div>
               <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-[#C19D65] -mr-1 -mb-1 rounded-br-xl"></div>
               <div className="absolute left-0 right-0 h-0.5 bg-[#C19D65] shadow-[0_0_20px_#C19D65] animate-[scan_2s_infinite]"></div>
            </div>
         </div>

         {/* Feedback Overlay */}
         {scanResult.status !== 'idle' && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
               <div className={`p-8 rounded-[2rem] text-center transform scale-110 ${scanResult.status === 'success' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                  {scanResult.status === 'success' ? <CheckCircle2 size={64} className="mx-auto mb-4"/> : <XCircle size={64} className="mx-auto mb-4"/>}
                  <h2 className="text-2xl font-black">{scanResult.message}</h2>
               </div>
            </div>
         )}

         {/* مودال تعديل PIN */}
         {showEditPin && (
           <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
             <div className="bg-[#18181B] border border-white/10 rounded-2xl p-8 w-full max-w-sm mx-4">
               <h3 className="text-xl font-bold text-white mb-6 text-center">تعديل رمز الدخول</h3>
               <form onSubmit={handleChangePin} className="space-y-4">
                 <div>
                   <label className="text-xs text-white/50 mb-2 block">الرمز الحالي</label>
                   <input type="password" inputMode="numeric" maxLength={4} value={pin}
                     disabled className="w-full bg-[#27272A] border border-white/10 rounded-lg py-3 text-center text-2xl font-mono outline-none opacity-50" />
                 </div>
                 <div>
                   <label className="text-xs text-white/50 mb-2 block">الرمز الجديد</label>
                   <input type="password" inputMode="numeric" maxLength={4} value={newPin}
                     onChange={(e) => setNewPin(e.target.value)}
                     placeholder="****" className="w-full bg-[#27272A] border border-white/10 rounded-lg py-3 text-center text-2xl font-mono tracking-[0.5em] outline-none focus:border-[#C19D65]" />
                 </div>
                 <div className="flex gap-3 pt-4">
                   <button type="button" onClick={() => { setShowEditPin(false); setNewPin(''); }}
                     className="flex-1 py-3 bg-[#27272A] rounded-lg text-white font-bold hover:bg-[#3F3F46]">
                     إلغاء
                   </button>
                   <button type="submit"
                     disabled={newPin.length < 4}
                     className="flex-1 py-3 bg-[#C19D65] rounded-lg text-black font-bold hover:brightness-110 disabled:opacity-50">
                     تحديث
                   </button>
                 </div>
               </form>
             </div>
           </div>
         )}
      </div>

      <div className="bg-[#18181B] p-6 pb-10 text-center rounded-t-[2rem] border-t border-white/10 z-20">
         <p className="text-sm text-white/50 mb-4">وجّه الكاميرا نحو باركود التذكرة</p>
         <div className="flex gap-2 mb-4 items-center bg-[#27272A] rounded-lg p-3">
           <input type="text" readOnly value={`/scan/${id}`}
             className="flex-1 bg-transparent text-xs text-white/60 font-mono outline-none" />
           <button onClick={handleCopyScannerLink} className="p-2 hover:bg-[#3F3F46] rounded transition" title="نسخ الرابط">
             {copiedLink ? <Check size={16} className="text-green-500"/> : <Copy size={16} className="text-white/60"/>}
           </button>
         </div>
         <div className="flex gap-2 mb-3">
           <button className="flex-1 py-2 bg-[#27272A] text-white rounded-lg text-sm font-bold hover:bg-[#3F3F46] transition">
             🔐 PIN: {pin}
           </button>
           <button onClick={() => setShowEditPin(true)} className="flex-1 py-2 bg-[#C19D65]/20 text-[#C19D65] rounded-lg text-sm font-bold hover:bg-[#C19D65]/30 transition">
             ✏️ تعديل
           </button>
         </div>
         <div className="flex gap-3">
           <button onClick={handleLogout} className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-bold hover:bg-red-500/30">
             🚪 خروج
           </button>
           <div className="flex-1 inline-flex items-center justify-center gap-2 text-[10px] text-white/30 bg-white/5 px-3 py-2 rounded-lg">
              <Lock size={10} /> آمن
           </div>
         </div>
      </div>
    </div>
  );
}