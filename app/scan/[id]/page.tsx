'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/app/utils/supabase/client';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Loader2, ScanLine, Lock, CheckCircle2, XCircle, Download, LogOut, RefreshCw } from 'lucide-react';
import { verifyEventPin } from '@/app/actions/verifyPin';
import * as Sentry from '@sentry/nextjs';

interface PageProps { params: Promise<{ id: string }>; }

export default function ScannerPage({ params }: PageProps) {
  const { id } = use(params);

  // States
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  
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

  // --- 3. تسجيل الدخول والتحقق من الـ PIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await verifyEventPin(id, pin);
      if (result.success) {
        setIsAuthenticated(true);
      } else {
        alert('رمز الدخول غير صحيح ❌');
        setPin('');
        if (navigator.vibrate) navigator.vibrate(500);
      }
    } catch (err) {
      Sentry.captureException(err);
      alert('حدث خطأ أثناء التحقق');
    } finally {
      setLoading(false);
    }
  };

  // --- 4. دالة المسح المحدثة مع Sentry ---
  const onScan = async (detectedCodes: any[]) => {
    if (detectedCodes.length === 0 || loading) return;
    const guestId = detectedCodes[0].rawValue;

    if (guestId === lastScannedId) return;
    setLastScannedId(guestId);

    setLoading(true);

    try {
      const { data: success, error } = await supabase
        .rpc('mark_attended', { attendee_id: guestId, input_pin: pin });

      if (error) throw error;

      if (success) {
        playSound('success');
        if (navigator.vibrate) navigator.vibrate(200);
        setScanResult({ status: 'success', message: '✅ تم التحضير بنجاح' });
      } else {
        playSound('error');
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        setScanResult({ status: 'error', message: '❌ تذكرة غير صالحة' });
      }

    } catch (err) {
      Sentry.captureException(err, { extra: { guestId, eventId: id } });
      playSound('error');
      setScanResult({ status: 'error', message: 'خطأ في النظام' });
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
        <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
           <div className="text-center">
              <div className="w-24 h-24 bg-[#C19D65]/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-[#C19D65] border border-[#C19D65]/20 shadow-2xl shadow-[#C19D65]/5">
                 <Lock size={48} />
              </div>
              <h1 className="text-3xl font-black mb-2">بوابة المشرفين</h1>
              <p className="text-white/40 text-sm">أدخل الرمز المكون من 4 أرقام للمتابعة</p>
           </div>
           
           <form onSubmit={handleLogin} className="space-y-6">
              <input 
                type="password" 
                inputMode="numeric" 
                maxLength={4} 
                value={pin} 
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••" 
                className="w-full bg-[#18181B] border border-white/10 rounded-3xl py-6 text-center text-4xl font-mono tracking-[0.5em] outline-none focus:border-[#C19D65] focus:ring-4 focus:ring-[#C19D65]/10 transition-all" 
              />
              <button 
                disabled={loading || pin.length < 4} 
                className="w-full bg-[#C19D65] text-black font-black py-5 rounded-2xl text-lg hover:brightness-110 disabled:opacity-50 shadow-xl shadow-[#C19D65]/10 flex items-center justify-center gap-3 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'فتح الماسح الضوئي'}
              </button>
           </form>

           {deferredPrompt && (
             <button onClick={handleInstallClick} className="w-full py-4 bg-white/5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border border-white/5 text-white/40 hover:bg-white/10 transition-colors">
               <Download size={14} /> تثبيت لوحة الماسح على الجوال
             </button>
           )}
        </div>
      </div>
    );
  }

  // --- شاشة الماسح النشطة ---
  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col overflow-hidden">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 w-full z-20 p-6 flex justify-between items-start bg-gradient-to-b from-black/90 via-black/40 to-transparent">
         <div>
            <h2 className="font-black text-lg flex items-center gap-2 tracking-tight">
               <ScanLine size={22} className="text-[#C19D65]"/> الماسح النشط
            </h2>
            <p className="text-[10px] text-white/40 mr-8 font-bold uppercase tracking-widest">Live Attendance Tracking</p>
         </div>
         <div className="flex flex-col items-end gap-2">
            <div className="bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-black text-green-500 flex items-center gap-1.5 shadow-lg">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> متصل الآن
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
            >
              <RefreshCw size={14} />
            </button>
         </div>
      </div>

      {/* Scanner Viewport */}
      <div className="flex-1 relative bg-gray-900">
          <Scanner onScan={onScan} styles={{ container: { height: '100%' } }} />
          
          {/* Viewfinder Guide */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-72 h-72 border border-white/10 rounded-[3rem] relative bg-black/5">
                {/* Corners */}
                <div className="absolute -top-1 -left-1 w-12 h-12 border-l-[6px] border-t-[6px] border-[#C19D65] rounded-tl-[2rem]"></div>
                <div className="absolute -top-1 -right-1 w-12 h-12 border-r-[6px] border-t-[6px] border-[#C19D65] rounded-tr-[2rem]"></div>
                <div className="absolute -bottom-1 -left-1 w-12 h-12 border-l-[6px] border-b-[6px] border-[#C19D65] rounded-bl-[2rem]"></div>
                <div className="absolute -bottom-1 -right-1 w-12 h-12 border-r-[6px] border-b-[6px] border-[#C19D65] rounded-br-[2rem]"></div>
                
                {/* Scanning Line */}
                <div className="absolute left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#C19D65] to-transparent shadow-[0_0_25px_#C19D65] animate-[scan_2.5s_ease-in-out_infinite]"></div>
             </div>
          </div>

          {/* Status Feedback */}
          {scanResult.status !== 'idle' && (
             <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                <div className={`p-10 rounded-[3rem] text-center transform scale-110 shadow-2xl ${scanResult.status === 'success' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                   {scanResult.status === 'success' ? <CheckCircle2 size={80} className="mx-auto mb-4 animate-bounce" /> : <XCircle size={80} className="mx-auto mb-4 animate-shake" />}
                   <h2 className="text-3xl font-black tracking-tight">{scanResult.message}</h2>
                </div>
             </div>
          )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-[#18181B] p-8 pb-12 rounded-t-[3rem] border-t border-white/10 z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          <p className="text-sm text-white/40 mb-6 text-center font-medium italic">قم بتوجيه الكاميرا نحو الرمز الموجود في تذكرة الضيف</p>
          
          <div className="flex gap-4">
             <button 
                onClick={() => setIsAuthenticated(false)} 
                className="flex-1 py-4 bg-white/5 text-white/60 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 hover:text-red-400 transition-all border border-white/5"
             >
                <LogOut size={18} /> تسجيل الخروج
             </button>
             <div className="flex-1 py-4 bg-black/40 rounded-2xl flex items-center justify-center gap-3 border border-white/5">
                <div className="w-2 h-2 bg-[#C19D65] rounded-full animate-ping"></div>
                <span className="text-xs font-mono font-bold text-white/60 uppercase tracking-widest">Active Session</span>
             </div>
          </div>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 90%; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}