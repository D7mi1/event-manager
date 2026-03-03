'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { Mail, Loader2, AlertCircle, CheckCircle2, ArrowRight, KeyRound } from 'lucide-react';

const ForgotPasswordSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
});

type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const themeColor = '#3B82F6';

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setServerError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (error) {
        throw error;
      }

      setSent(true);
    } catch (err: any) {
      // لا نكشف إذا كان الإيميل موجود أو لا (أمان)
      // نعرض رسالة نجاح دائماً لمنع enumeration
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center p-6 text-right font-sans relative overflow-hidden" dir="rtl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20" style={{ background: `radial-gradient(circle, #22C55E 0%, transparent 70%)` }} />

        <div className="w-full max-w-lg bg-[#0F0F12]/90 border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl relative z-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-green-600/10 border border-green-600/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>

          <h1 className="text-2xl font-black mb-4">تم إرسال رابط الاستعادة</h1>
          <p className="text-white/50 text-sm leading-relaxed mb-2">
            إذا كان البريد الإلكتروني مسجلاً لدينا، ستصلك رسالة تحتوي على رابط لإعادة تعيين كلمة المرور.
          </p>
          <p className="text-white/30 text-xs mb-8 dir-ltr">
            {getValues('email')}
          </p>

          <div className="space-y-3">
            <p className="text-white/30 text-xs">تحقق من صندوق الوارد وأيضاً مجلد الرسائل غير المرغوبة (Spam).</p>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-all duration-300 shadow-[0_15px_30px_rgba(37,99,235,0.2)]"
            >
              <ArrowRight className="w-4 h-4" />
              العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center p-6 text-right font-sans relative overflow-hidden" dir="rtl">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20" style={{ background: `radial-gradient(circle, ${themeColor} 0%, transparent 70%)` }} />

      <div className="w-full max-w-lg bg-[#0F0F12]/90 border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl relative z-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mx-auto mb-6">
            <KeyRound size={32} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-black mb-2">نسيت كلمة المرور؟</h1>
          <p className="text-white/40 text-sm leading-relaxed">
            أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="relative group">
            <label className="text-[10px] text-white/30 absolute -top-2.5 right-4 bg-[#0F0F12] px-2 z-10 font-bold uppercase italic">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                {...register('email')}
                className={`w-full bg-white/[0.02] border rounded-2xl p-5 outline-none font-sans transition-all ${
                  errors.email
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-white/10 focus:border-blue-500'
                }`}
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
            </div>
            {errors.email && (
              <p className="text-red-400 text-[10px] mt-2 mr-2 font-bold flex items-center gap-1 animate-in slide-in-from-top-1">
                <AlertCircle size={10} /> {errors.email.message}
              </p>
            )}
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
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'إرسال رابط الاستعادة'}
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
