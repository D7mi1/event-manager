'use client';

import { useState } from 'react';
import { supabase } from '@/app/utils/supabase/client';
import { Mail, KeyRound, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EmailLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 1. دالة إرسال الرمز للإيميل
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          // يمكنك تحديد رابط إعادة التوجيه إذا كنت تستخدم Magic Link، 
          // لكن للـ OTP لا نحتاجه كثيراً هنا
          shouldCreateUser: false, // اجعلها true إذا أردت السماح بالتسجيل الجديد
        },
      });

      if (error) throw error;
      
      setStep('otp'); // الانتقال لخطوة إدخال الكود
      alert('تم إرسال الرمز إلى بريدك الإلكتروني 📧');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إرسال الرمز');
    } finally {
      setLoading(false);
    }
  };

  // 2. دالة التحقق من الرمز المدخل
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) throw error;

      // نجاح الدخول!
      if (data.session) {
        router.push('/dashboard'); // توجيه للوحة التحكم
      }
    } catch (err: any) {
      setError('الرمز غير صحيح أو منتهي الصلاحية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-[#18181B] border border-white/10 rounded-[2rem] shadow-2xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#C19D65]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#C19D65]">
          {step === 'email' ? <Mail size={32} /> : <KeyRound size={32} />}
        </div>
        <h2 className="text-2xl font-bold text-white">تسجيل الدخول</h2>
        <p className="text-white/40 mt-2 text-sm">
          {step === 'email' ? 'أدخل بريدك الإلكتروني لاستلام رمز الدخول' : `تم إرسال الرمز إلى ${email}`}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {step === 'email' ? (
        // --- نموذج إدخال الإيميل ---
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-2 mr-1">البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-white outline-none focus:border-[#C19D65] transition-all dir-ltr"
            />
          </div>
          <button
            disabled={loading || !email}
            className="w-full py-4 bg-[#C19D65] text-black font-bold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>إرسال الرمز <ArrowRight size={18} /></>}
          </button>
        </form>
      ) : (
        // --- نموذج إدخال الرمز ---
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-2 mr-1">رمز التحقق (6 أرقام)</label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-center text-2xl font-mono tracking-[0.5em] text-[#C19D65] outline-none focus:border-[#C19D65] transition-all"
            />
          </div>
          
          <button
            disabled={loading || otp.length < 6}
            className="w-full py-4 bg-[#C19D65] text-black font-bold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>تحقق ودخول <CheckCircle2 size={18} /></>}
          </button>
          
          <button 
            type="button" 
            onClick={() => { setStep('email'); setOtp(''); setError(null); }}
            className="w-full py-2 text-white/40 text-sm hover:text-white"
          >
            تغيير البريد الإلكتروني
          </button>
        </form>
      )}
    </div>
  );
}