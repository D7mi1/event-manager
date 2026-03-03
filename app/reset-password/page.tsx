'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

const ResetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير واحد على الأقل')
    .regex(/[0-9]/, 'يجب أن تحتوي على رقم واحد على الأقل'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmPassword'],
});

type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const router = useRouter();

  const themeColor = '#3B82F6';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onBlur',
  });

  // التحقق من وجود جلسة صالحة (المستخدم جاء من رابط الاستعادة)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsValidSession(!!session);
    };
    checkSession();
  }, []);

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        if (error.message.includes('same_password')) {
          throw new Error('كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية.');
        }
        throw error;
      }

      setSuccess(true);

      // التوجيه التلقائي للداشبورد بعد 3 ثوان
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err: any) {
      setServerError(err.message);
    }
  };

  // حالة التحميل
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // لا توجد جلسة صالحة
  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center p-6 text-right font-sans relative overflow-hidden" dir="rtl">
        <div className="w-full max-w-lg bg-[#0F0F12]/90 border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl relative z-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-black mb-4">رابط غير صالح أو منتهي الصلاحية</h1>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            يبدو أن رابط إعادة تعيين كلمة المرور غير صالح أو انتهت صلاحيته. يرجى طلب رابط جديد.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-all duration-300 shadow-[0_15px_30px_rgba(37,99,235,0.2)]"
          >
            طلب رابط جديد
          </Link>
        </div>
      </div>
    );
  }

  // نجاح إعادة التعيين
  if (success) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center p-6 text-right font-sans relative overflow-hidden" dir="rtl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20" style={{ background: `radial-gradient(circle, #22C55E 0%, transparent 70%)` }} />

        <div className="w-full max-w-lg bg-[#0F0F12]/90 border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl relative z-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-green-600/10 border border-green-600/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-black mb-4">تم تغيير كلمة المرور بنجاح!</h1>
          <p className="text-white/50 text-sm leading-relaxed mb-2">
            يمكنك الآن استخدام كلمة المرور الجديدة لتسجيل الدخول.
          </p>
          <p className="text-white/30 text-xs mb-8">
            سيتم توجيهك تلقائياً إلى لوحة التحكم...
          </p>
          <Loader2 className="w-6 h-6 animate-spin text-green-400 mx-auto" />
        </div>
      </div>
    );
  }

  // نموذج إعادة التعيين
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center p-6 text-right font-sans relative overflow-hidden" dir="rtl">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20" style={{ background: `radial-gradient(circle, ${themeColor} 0%, transparent 70%)` }} />

      <div className="w-full max-w-lg bg-[#0F0F12]/90 border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl relative z-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={32} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-black mb-2">إعادة تعيين كلمة المرور</h1>
          <p className="text-white/40 text-sm leading-relaxed">
            أدخل كلمة المرور الجديدة لحسابك.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* كلمة المرور الجديدة */}
          <div className="relative group">
            <label className="text-[10px] text-white/30 absolute -top-2.5 right-4 bg-[#0F0F12] px-2 z-10 font-bold uppercase italic">
              كلمة المرور الجديدة
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('password')}
                className={`w-full bg-white/[0.02] border rounded-2xl p-5 outline-none font-sans transition-all ${
                  errors.password
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-white/10 focus:border-blue-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors z-20"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-[10px] mt-2 mr-2 font-bold flex items-center gap-1 animate-in slide-in-from-top-1">
                <AlertCircle size={10} /> {errors.password.message}
              </p>
            )}
          </div>

          {/* تأكيد كلمة المرور */}
          <div className="relative group">
            <label className="text-[10px] text-white/30 absolute -top-2.5 right-4 bg-[#0F0F12] px-2 z-10 font-bold uppercase italic">
              تأكيد كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('confirmPassword')}
                className={`w-full bg-white/[0.02] border rounded-2xl p-5 outline-none font-sans transition-all ${
                  errors.confirmPassword
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-white/10 focus:border-blue-500'
                }`}
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-[10px] mt-2 mr-2 font-bold flex items-center gap-1 animate-in slide-in-from-top-1">
                <AlertCircle size={10} /> {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* متطلبات كلمة المرور */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <p className="text-[10px] text-white/30 font-bold mb-2">متطلبات كلمة المرور:</p>
            <ul className="space-y-1 text-[10px] text-white/40">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-500/60" />
                8 أحرف على الأقل
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-500/60" />
                حرف كبير واحد على الأقل (A-Z)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-500/60" />
                رقم واحد على الأقل (0-9)
              </li>
            </ul>
          </div>

          {serverError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[11px] text-center font-bold flex items-center justify-center gap-2 animate-in fade-in">
              <AlertCircle size={14} /> {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-6 shadow-[0_15px_30px_rgba(37,99,235,0.2)]"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'تعيين كلمة المرور الجديدة'}
          </button>
        </form>

        {/* Back to login */}
        <Link
          href="/login"
          className="block mt-8 text-center text-[11px] text-white/30 hover:text-white transition-colors font-bold"
        >
          <span className="flex items-center justify-center gap-2">
            <ArrowRight size={12} />
            العودة لتسجيل الدخول
          </span>
        </Link>
      </div>
    </div>
  );
}
