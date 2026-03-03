'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import {
  Loader2, ScanLine, Lock, CheckCircle2, XCircle,
  Download, LogOut, RefreshCw, Wifi, WifiOff, CloudUpload
} from 'lucide-react';
import { verifyEventPin } from '@/app/actions/verifyPin';
import * as Sentry from '@sentry/nextjs';
import { toast } from 'sonner';

// ============================================
// Offline Queue - طابور المسح بدون إنترنت
// ============================================
interface QueuedScan {
  guestId: string;
  pin: string;
  timestamp: number;
}

const QUEUE_KEY = 'meras_offline_scans';

function getOfflineQueue(): QueuedScan[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addToQueue(scan: QueuedScan) {
  const queue = getOfflineQueue();
  // تجنب التكرار
  if (queue.some(q => q.guestId === scan.guestId)) return;
  queue.push(scan);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function clearQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

// ============================================
// Scanner Page Component
// ============================================
interface PageProps { params: Promise<{ id: string }>; }

export default function ScannerPage({ params }: PageProps) {
  const { id } = use(params);

  // States
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Online Status
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Scanner States
  const [scanResult, setScanResult] = useState<{ status: 'idle' | 'success' | 'error' | 'queued', message: string }>({ status: 'idle', message: '' });
  const [lastScannedId, setLastScannedId] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState(0);

  // Refs
  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  const errorAudioRef = useRef<HTMLAudioElement | null>(null);

  // --- 1. إعداد التثبيت (PWA) وتحميل الأصوات ومراقبة الاتصال ---
  useEffect(() => {
    // PWA Event
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    // Online/Offline
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('تم استعادة الاتصال بالإنترنت');
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('انقطع الاتصال بالإنترنت - الوضع غير المتصل');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    // Preload Audios
    successAudioRef.current = new Audio('/sounds/success.mp3');
    errorAudioRef.current = new Audio('/sounds/error.mp3');

    // تحميل عدد الطابور المعلق
    setPendingCount(getOfflineQueue().length);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- مزامنة الطابور عند عودة الاتصال ---
  const syncOfflineQueue = useCallback(async () => {
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    let synced = 0;

    for (const scan of queue) {
      try {
        const { data: success, error } = await supabase
          .rpc('mark_attended', { attendee_id: scan.guestId, input_pin: scan.pin });

        if (!error && success) {
          synced++;
        }
      } catch {
        // تجاهل الأخطاء الفردية ومتابعة المزامنة
      }
    }

    clearQueue();
    setPendingCount(0);
    setIsSyncing(false);

    if (synced > 0) {
      toast.success(`تمت مزامنة ${synced} عملية مسح`);
    }
  }, []);

  useEffect(() => {
    if (isOnline && isAuthenticated) {
      syncOfflineQueue();
    }
  }, [isOnline, isAuthenticated, syncOfflineQueue]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  // --- 2. دالة تشغيل الصوت ---
  const playSound = (type: 'success' | 'error') => {
    const audio = type === 'success' ? successAudioRef.current : errorAudioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
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
        toast.error('رمز الدخول غير صحيح');
        setPin('');
        if (navigator.vibrate) navigator.vibrate(500);
      }
    } catch (err) {
      Sentry.captureException(err);
      toast.error('حدث خطأ أثناء التحقق');
    } finally {
      setLoading(false);
    }
  };

  // --- 4. دالة المسح (مع دعم Offline) ---
  const onScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes.length === 0 || loading || !detectedCodes[0].rawValue) return;

    const guestId = detectedCodes[0].rawValue;

    // منع التكرار الفوري
    if (guestId === lastScannedId) return;
    setLastScannedId(guestId);
    setLoading(true);

    // === وضع Offline ===
    if (!navigator.onLine) {
      addToQueue({ guestId, pin, timestamp: Date.now() });
      setPendingCount(prev => prev + 1);
      setScanCount(prev => prev + 1);
      playSound('success');
      if (navigator.vibrate) navigator.vibrate(200);
      setScanResult({ status: 'queued', message: '📶 تم الحفظ - سيتم المزامنة لاحقاً' });
      setLoading(false);
      setTimeout(() => {
        setScanResult({ status: 'idle', message: '' });
        setLastScannedId(null);
      }, 2000);
      return;
    }

    // === وضع Online ===
    try {
      const { data: success, error } = await supabase
        .rpc('mark_attended', { attendee_id: guestId, input_pin: pin });

      if (error) throw error;

      if (success) {
        playSound('success');
        if (navigator.vibrate) navigator.vibrate(200);
        setScanCount(prev => prev + 1);
        setScanResult({ status: 'success', message: 'تم التحضير بنجاح' });
      } else {
        playSound('error');
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        setScanResult({ status: 'error', message: 'تذكرة غير صالحة أو مستخدمة' });
      }
    } catch (err) {
      // في حالة فشل الاتصال أثناء الطلب - أضف للطابور
      if (!navigator.onLine) {
        addToQueue({ guestId, pin, timestamp: Date.now() });
        setPendingCount(prev => prev + 1);
        setScanCount(prev => prev + 1);
        playSound('success');
        setScanResult({ status: 'queued', message: '📶 تم الحفظ - سيتم المزامنة لاحقاً' });
      } else {
        Sentry.captureException(err, { extra: { guestId, eventId: id } });
        playSound('error');
        setScanResult({ status: 'error', message: 'خطأ في النظام' });
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        setScanResult({ status: 'idle', message: '' });
        setLastScannedId(null);
      }, 2500);
    }
  };

  // ============================================
  // شاشة الدخول
  // ============================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex flex-col items-center justify-center p-6 text-white" dir="rtl">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center">
            <div className="w-24 h-24 bg-[#C19D65]/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-[#C19D65] border border-[#C19D65]/20 shadow-2xl shadow-[#C19D65]/5">
              <Lock size={48} aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-black mb-2">بوابة المشرفين</h1>
            <p className="text-white/40 text-sm">أدخل الرمز المكون من 4 أرقام للمتابعة</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <label htmlFor="pin-input" className="sr-only">رمز الدخول</label>
            <input
              id="pin-input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              aria-label="رمز الدخول"
              className="w-full bg-[#18181B] border border-white/10 rounded-3xl py-6 text-center text-4xl font-mono tracking-[0.5em] outline-none focus:border-[#C19D65] focus:ring-4 focus:ring-[#C19D65]/10 transition-all"
            />
            <button
              type="submit"
              disabled={loading || pin.length < 4}
              className="w-full bg-[#C19D65] text-black font-black py-5 rounded-2xl text-lg hover:brightness-110 disabled:opacity-50 shadow-xl shadow-[#C19D65]/10 flex items-center justify-center gap-3 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : 'فتح الماسح الضوئي'}
            </button>
          </form>

          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="w-full py-4 bg-white/5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border border-white/5 text-white/40 hover:bg-white/10 transition-colors"
            >
              <Download size={14} aria-hidden="true" /> تثبيت لوحة الماسح على الجوال
            </button>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // شاشة الماسح النشطة
  // ============================================
  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col overflow-hidden">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 w-full z-20 p-4 sm:p-6 flex justify-between items-start bg-gradient-to-b from-black/90 via-black/40 to-transparent">
        <div>
          <h2 className="font-black text-lg flex items-center gap-2 tracking-tight">
            <ScanLine size={22} className="text-[#C19D65]" aria-hidden="true" /> الماسح النشط
          </h2>
          <p className="text-[10px] text-white/40 mr-8 font-bold uppercase tracking-widest">Live Attendance Tracking</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {/* مؤشر الاتصال */}
          {isOnline ? (
            <div className="bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-black text-green-500 flex items-center gap-1.5 shadow-lg">
              <Wifi size={10} aria-hidden="true" />
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              متصل
            </div>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-black text-amber-500 flex items-center gap-1.5 shadow-lg">
              <WifiOff size={10} aria-hidden="true" />
              غير متصل
            </div>
          )}

          {/* عدد المسح */}
          <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-black text-white/60">
            {scanCount} مسح
          </div>

          {/* طابور المزامنة */}
          {pendingCount > 0 && (
            <button
              onClick={syncOfflineQueue}
              disabled={!isOnline || isSyncing}
              className="bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-black text-amber-400 flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
            >
              {isSyncing ? (
                <Loader2 size={10} className="animate-spin" aria-hidden="true" />
              ) : (
                <CloudUpload size={10} aria-hidden="true" />
              )}
              {pendingCount} في الانتظار
            </button>
          )}

          <button
            onClick={() => window.location.reload()}
            className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
            aria-label="تحديث الصفحة"
          >
            <RefreshCw size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Scanner Viewport */}
      <div className="flex-1 relative bg-gray-900">
        <Scanner
          onScan={onScan}
          formats={['qr_code']}
          components={{ finder: false, onOff: false }}
          styles={{ container: { height: '100%', objectFit: 'cover' } }}
          scanDelay={500}
        />

        {/* Custom Viewfinder UI */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-72 h-72 border border-white/10 rounded-[3rem] relative bg-black/5 backdrop-blur-[2px]">
            {/* Corners */}
            <div className="absolute -top-1 -left-1 w-12 h-12 border-l-[6px] border-t-[6px] border-[#C19D65] rounded-tl-[2rem]" />
            <div className="absolute -top-1 -right-1 w-12 h-12 border-r-[6px] border-t-[6px] border-[#C19D65] rounded-tr-[2rem]" />
            <div className="absolute -bottom-1 -left-1 w-12 h-12 border-l-[6px] border-b-[6px] border-[#C19D65] rounded-bl-[2rem]" />
            <div className="absolute -bottom-1 -right-1 w-12 h-12 border-r-[6px] border-b-[6px] border-[#C19D65] rounded-br-[2rem]" />

            {/* Scanning Line */}
            <div className="absolute left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#C19D65] to-transparent shadow-[0_0_25px_#C19D65] animate-[scan_2.5s_ease-in-out_infinite]" />
          </div>
        </div>

        {/* Status Feedback */}
        {scanResult.status !== 'idle' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300" role="alert">
            <div className={`p-10 rounded-[3rem] text-center transform scale-110 shadow-2xl ${
              scanResult.status === 'success' ? 'bg-green-500 text-black' :
              scanResult.status === 'queued' ? 'bg-amber-500 text-black' :
              'bg-red-500 text-white'
            }`}>
              {scanResult.status === 'success' && <CheckCircle2 size={80} className="mx-auto mb-4 animate-bounce" aria-hidden="true" />}
              {scanResult.status === 'queued' && <CloudUpload size={80} className="mx-auto mb-4 animate-bounce" aria-hidden="true" />}
              {scanResult.status === 'error' && <XCircle size={80} className="mx-auto mb-4 animate-shake" aria-hidden="true" />}
              <h2 className="text-3xl font-black tracking-tight">{scanResult.message}</h2>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-[#18181B] p-6 sm:p-8 pb-10 sm:pb-12 rounded-t-[3rem] border-t border-white/10 z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        {!isOnline && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4 text-center">
            <p className="text-xs text-amber-400 font-bold">
              📶 وضع غير متصل - يتم حفظ عمليات المسح محلياً وسيتم مزامنتها عند عودة الاتصال
            </p>
          </div>
        )}

        <p className="text-sm text-white/40 mb-6 text-center font-medium italic">
          قم بتوجيه الكاميرا نحو الرمز الموجود في تذكرة الضيف
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => setIsAuthenticated(false)}
            className="flex-1 py-4 bg-white/5 text-white/60 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 hover:text-red-400 transition-all border border-white/5"
          >
            <LogOut size={18} aria-hidden="true" /> تسجيل الخروج
          </button>
          <div className="flex-1 py-4 bg-black/40 rounded-2xl flex items-center justify-center gap-3 border border-white/5">
            <div className={`w-2 h-2 rounded-full animate-ping ${isOnline ? 'bg-[#C19D65]' : 'bg-amber-500'}`} />
            <span className="text-xs font-mono font-bold text-white/60 uppercase tracking-widest">
              {isOnline ? 'Active Session' : 'Offline Mode'}
            </span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0%, 100% { top: 10%; opacity: 0; }
          10%, 90% { opacity: 1; }
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
