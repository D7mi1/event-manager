'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { supabase } from '@/app/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Loader2, ArrowLeft, ShieldCheck, RefreshCw } from 'lucide-react';
import Link from 'next/link';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'example@mail.com';
  const interest = searchParams.get('interest'); // لجلب الثيم (أعمال/أفراح)

  // تحديد ألوان الثيم بناءً على الاختيار السابق
  const themeColor = interest === 'business' ? '#3B82F6' : '#C19D65';
  const themeBg = interest === 'business' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(193, 157, 101, 0.1)';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState<string | null>(null);
  
  // مراجع لحقول الإدخال للتحكم في التركيز
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 1. التركيز التلقائي على أول خانة عند التحميل
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // عداد إعادة الإرسال
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // دالة التعامل مع الكتابة
  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; // قبول الأرقام فقط

    const newOtp = [...otp];
    // أخذ الرقم الأخير فقط (في حال كتب المستخدم بسرعة)
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // الانتقال للخانة التالية
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    // 2. الإرسال التلقائي عند اكتمال الكود
    const combinedOtp = newOtp.join('');
    if (combinedOtp.length === 6) {
      handleVerify(combinedOtp);
    }
  };

  // دالة التعامل مع الحذف (Backspace) والتنقل للخلف
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // دالة دعم اللصق (Paste) الذكي
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.every(char => !isNaN(Number(char)))) {
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      // تركيز على آخر خانة تم ملؤها أو الأخيرة
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[focusIndex]?.focus();
      
      if (newOtp.join('').length === 6) handleVerify(newOtp.join(''));
    }
  };

  const handleVerify = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup'
      });
      if (error) throw error;
      router.push('/dashboard'); // نجاح!
    } catch (err: any) {
      setError('الرمز غير صحيح أو انتهت صلاحيته');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      setTimer(60); // إعادة العداد
      alert('تم إرسال الرمز مجدداً');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center p-6 text-right font-sans relative overflow-hidden" dir="rtl">
      
      {/* التوهج الخلفي */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 transition-all duration-1000" style={{ background: `radial-gradient(circle, ${themeColor} 0%, transparent 70%)` }} />

      <div className="w-full max-w-lg bg-[#0F0F12]/90 border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border transition-all duration-500" style={{ backgroundColor: themeBg, borderColor: `${themeColor}40` }}>
            <ShieldCheck size={32} style={{ color: themeColor }} />
          </div>
          <h1 className="text-2xl font-black mb-2">تحقق من بريدك الإلكتروني</h1>
          <p className="text-white/40 text-sm leading-relaxed">
            أرسلنا رمز تأكيد مؤلف من 6 أرقام إلى <br />
            <span className="text-white font-bold dir-ltr block mt-1">{email}</span>
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex justify-between gap-2 mb-8" dir="ltr">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }} // ربط المرجع
              type="text"
              inputMode="numeric" // لإظهار كيبورد الأرقام
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-12 h-14 md:w-14 md:h-16 bg-white/[0.02] border rounded-2xl text-center text-xl font-bold outline-none transition-all
                ${digit ? `border-[${themeColor}] shadow-[0_0_10px_${themeColor}40]` : 'border-white/10'}
                focus:border-[var(--theme-color)] focus:bg-white/[0.05] focus:scale-105
              `}
              style={{ '--theme-color': themeColor } as React.CSSProperties}
            />
          ))}
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[11px] text-center font-bold animate-in fade-in">
             {error}
          </div>
        )}

        {/* زر التأكيد */}
        <button 
          onClick={() => handleVerify(otp.join(''))}
          disabled={loading || otp.join('').length < 6}
          style={{ backgroundColor: themeColor, boxShadow: `0 15px 30px ${themeColor}20` }} 
          className="w-full text-black py-4 rounded-2xl font-black text-lg hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'تأكيد الحساب'}
        </button>

        {/* إعادة الإرسال */}
        <div className="mt-8 text-center">
          <p className="text-white/30 text-xs font-bold mb-2">لم يصلك الرمز؟</p>
          {timer > 0 ? (
            <span className="text-white/50 text-xs font-mono bg-white/5 px-3 py-1 rounded-lg">
              إعادة الإرسال بعد 00:{timer < 10 ? `0${timer}` : timer}
            </span>
          ) : (
            <button 
              onClick={handleResend}
              className="text-white hover:text-[var(--theme-color)] text-xs font-black underline decoration-2 underline-offset-4 transition-all flex items-center justify-center gap-2 mx-auto"
              style={{ '--theme-color': themeColor } as React.CSSProperties}
            >
              <RefreshCw size={12} /> إعادة إرسال الرمز
            </button>
          )}
        </div>
        
        {/* العودة */}
        <Link href="/login" className="block mt-8 text-center text-[10px] text-white/20 hover:text-white transition-colors">
          عودة لتسجيل الدخول
        </Link>

      </div>
    </div>
  );
}

// تغليف الصفحة بـ Suspense لأننا نستخدم useSearchParams
export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>}>
      <VerifyContent />
    </Suspense>
  );
}