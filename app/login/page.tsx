'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Briefcase, PartyPopper, Chrome, ArrowLeft, Eye, EyeOff, ChevronRight, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  SignUpSchema, type SignUpInput,
  LoginPasswordSchema, type LoginPasswordInput,
  OtpRequestSchema, type OtpRequestInput,
  OtpVerifySchema, type OtpVerifyInput,
} from '@/lib/schemas';

// بيانات الدول
const GULF_COUNTRIES = [
  { name: 'السعودية', code: '+966', flag: '🇸🇦', iso: 'SA', digits: 9, placeholder: '5xxxxxxxx' },
  { name: 'الإمارات', code: '+971', flag: '🇦🇪', iso: 'AE', digits: 9, placeholder: '5xxxxxxxx' },
  { name: 'الكويت', code: '+965', flag: '🇰🇼', iso: 'KW', digits: 8, placeholder: 'xxxxxxxx' },
  { name: 'قطر', code: '+974', flag: '🇶🇦', iso: 'QA', digits: 8, placeholder: 'xxxxxxxx' },
  { name: 'عمان', code: '+968', flag: '🇴🇲', iso: 'OM', digits: 8, placeholder: 'xxxxxxxx' },
  { name: 'البحرين', code: '+973', flag: '🇧🇭', iso: 'BH', digits: 8, placeholder: 'xxxxxxxx' },
];

// --- مكون حقل الإدخال ---
const InputField = ({ label, error, themeColor, children, inputId }: {
  label: string;
  error?: string;
  themeColor: string;
  children: React.ReactNode;
  inputId?: string;
}) => {
  return (
    <div className="relative group">
      <label htmlFor={inputId} className="text-[10px] text-white/30 absolute -top-2.5 right-4 bg-[#0F0F12] px-2 z-10 font-bold uppercase italic">{label}</label>
      <div className="relative">
        {children}
      </div>
      {error && (
        <p role="alert" className="text-red-400 text-[10px] mt-2 mr-2 font-bold flex items-center gap-1 animate-in slide-in-from-top-1">
          <AlertCircle size={10} aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
};

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [interest, setInterest] = useState<'social' | 'business' | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState(GULF_COUNTRIES[0]);
  const router = useRouter();

  const themeColor = interest === 'business' ? '#3B82F6' : '#C19D65';
  const themeBg = interest === 'business' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(193, 157, 101, 0.1)';

  // --- React Hook Form instances ---
  const signUpForm = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: { fullName: '', email: '', phone: '', password: '', confirmPassword: '' },
    mode: 'onBlur',
  });

  const loginPasswordForm = useForm<LoginPasswordInput>({
    resolver: zodResolver(LoginPasswordSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const otpRequestForm = useForm<OtpRequestInput>({
    resolver: zodResolver(OtpRequestSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  });

  const otpVerifyForm = useForm<OtpVerifyInput>({
    resolver: zodResolver(OtpVerifySchema),
    defaultValues: { email: '', otp: '' },
    mode: 'onBlur',
  });

  // --- العمليات ---
  const handleGoogleLogin = async () => {
    if (isSignUp && !interest) { setServerError("يرجى اختيار نوع اهتمامك أولاً"); return; }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleSignUp = async (data: SignUpInput) => {
    if (!interest) { setServerError("يرجى اختيار نوع الاهتمام"); return; }
    setServerError(null);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone_number: `${selectedCountry.code}${data.phone}`,
            interest
          }
        }
      });
      if (signUpError) {
        if (signUpError.message.includes('User already registered')) throw new Error('هذا البريد الإلكتروني مسجل مسبقاً.');
        throw signUpError;
      }
      router.push(`/auth/verify?email=${encodeURIComponent(data.email)}&interest=${interest}`);
    } catch (err: any) { setServerError(err.message); }
  };

  const handleLoginPassword = async (data: LoginPasswordInput) => {
    setServerError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
        throw signInError;
      }
      router.push('/dashboard');
    } catch (err: any) { setServerError(err.message); }
  };

  const handleOtpRequest = async (data: OtpRequestInput) => {
    setServerError(null);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: { shouldCreateUser: false }
      });
      if (otpError) throw otpError;
      setOtpSent(true);
      otpVerifyForm.setValue('email', data.email);
      toast.success(`تم إرسال الرمز إلى ${data.email}`);
    } catch (err: any) { setServerError(err.message); }
  };

  const handleOtpVerify = async (data: OtpVerifyInput) => {
    setServerError(null);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: data.email,
        token: data.otp,
        type: 'email'
      });
      if (verifyError) throw new Error('الرمز غير صحيح أو منتهي الصلاحية');
      router.push('/dashboard');
    } catch (err: any) { setServerError(err.message); }
  };

  // الحصول على الـ form النشطة
  const getActiveFormState = () => {
    if (isSignUp) return signUpForm.formState;
    if (loginMethod === 'otp') return otpSent ? otpVerifyForm.formState : otpRequestForm.formState;
    return loginPasswordForm.formState;
  };

  const isLoading = getActiveFormState().isSubmitting;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center p-6 text-right font-sans relative overflow-hidden transition-all duration-700" dir="rtl">

      <Link href="/" className="absolute top-8 right-8 z-50 group flex items-center gap-3 transition-all">
        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-[var(--theme-color)] transition-all duration-300 backdrop-blur-md"
             style={{ '--theme-color': themeColor } as React.CSSProperties}>
          <ChevronRight size={18} className="text-white/40 group-hover:text-white transition-colors" />
        </div>
      </Link>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 transition-all duration-1000" style={{ background: `radial-gradient(circle, ${themeColor} 0%, transparent 70%)` }} />

      <div className="w-full max-w-xl bg-[#0F0F12]/90 border border-white/10 rounded-[3.5rem] p-10 backdrop-blur-3xl shadow-2xl relative z-10">

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border transition-all duration-500" style={{ backgroundColor: themeBg, borderColor: `${themeColor}40` }}>
            {loginMethod === 'otp' && !isSignUp ? <KeyRound size={32} style={{ color: themeColor }} /> : <Sparkles size={32} style={{ color: themeColor }} className="animate-pulse" />}
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter mb-2">مِـراس</h1>
          <p style={{ color: themeColor }} className="text-[11px] font-bold tracking-widest transition-colors duration-500 italic">
             {otpSent ? `تم إرسال الرمز إلى ${otpRequestForm.getValues('email')}` : 'ابدأ بتنظيم فعاليتك الأولى في أقل من دقيقتين'}
          </p>
        </div>

        {/* --- اختيار الاهتمام (فقط في التسجيل) --- */}
        {isSignUp && (
          <div className="mb-6 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setInterest('social')} className={`p-4 rounded-2xl border-2 transition-all duration-500 flex flex-col items-center gap-2 ${interest === 'social' ? 'border-[#C19D65] bg-[#C19D65]/10' : 'border-white/5 bg-white/[0.02] hover:border-white/10'}`}>
                <PartyPopper className={interest === 'social' ? 'text-[#C19D65]' : 'text-white/20'} size={24} />
                <span className="text-[10px] font-black uppercase">أفراح ومناسبات ✨</span>
              </button>
              <button type="button" onClick={() => setInterest('business')} className={`p-4 rounded-2xl border-2 transition-all duration-500 flex flex-col items-center gap-2 ${interest === 'business' ? 'border-[#3B82F6] bg-[#3B82F6]/10' : 'border-white/5 bg-white/[0.02] hover:border-white/10'}`}>
                <Briefcase className={interest === 'business' ? 'text-[#3B82F6]' : 'text-white/20'} size={24} />
                <span className="text-[10px] font-black uppercase">أعمال ومؤتمرات 💼</span>
              </button>
            </div>
          </div>
        )}

        {/* --- زر التبديل بين الباسورد و OTP (فقط في تسجيل الدخول) --- */}
        {!isSignUp && (
            <div className="flex bg-white/5 p-1 rounded-2xl mb-6">
                <button
                    type="button"
                    onClick={() => { setLoginMethod('password'); setOtpSent(false); setServerError(null); }}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${loginMethod === 'password' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                >
                    كلمة المرور
                </button>
                <button
                    type="button"
                    onClick={() => { setLoginMethod('otp'); setServerError(null); }}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${loginMethod === 'otp' ? 'bg-[var(--theme-color)] text-black' : 'text-white/40 hover:text-white'}`}
                    style={loginMethod === 'otp' ? { backgroundColor: themeColor } : {}}
                >
                    رمز التحقق (OTP)
                </button>
            </div>
        )}

        {/* ========================================= */}
        {/* === SIGN UP FORM === */}
        {/* ========================================= */}
        {isSignUp && (
          <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4" noValidate>
            <InputField label="الاسم الكامل" error={signUpForm.formState.errors.fullName?.message} themeColor={themeColor} inputId="signup-fullname">
              <input
                id="signup-fullname"
                type="text" placeholder="الاسم الثلاثي" autoComplete="name"
                aria-required="true"
                aria-invalid={!!signUpForm.formState.errors.fullName}
                {...signUpForm.register('fullName')}
                className={`w-full bg-white/[0.02] border rounded-2xl p-5 outline-none font-sans transition-all ${signUpForm.formState.errors.fullName ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[var(--theme-color)]'}`}
                style={{ '--theme-color': themeColor } as React.CSSProperties}
              />
              {signUpForm.formState.touchedFields.fullName && !signUpForm.formState.errors.fullName && signUpForm.watch('fullName') && (
                <CheckCircle2 size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 animate-in zoom-in" />
              )}
            </InputField>

            <InputField label="البريد الإلكتروني" error={signUpForm.formState.errors.email?.message} themeColor={themeColor} inputId="signup-email">
              <input
                id="signup-email"
                type="email" placeholder="name@company.com" autoComplete="email"
                aria-required="true"
                aria-invalid={!!signUpForm.formState.errors.email}
                {...signUpForm.register('email')}
                className={`w-full bg-white/[0.02] border rounded-2xl p-5 outline-none font-sans transition-all ${signUpForm.formState.errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[var(--theme-color)]'}`}
                style={{ '--theme-color': themeColor } as React.CSSProperties}
              />
              {signUpForm.formState.touchedFields.email && !signUpForm.formState.errors.email && signUpForm.watch('email') && (
                <CheckCircle2 size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 animate-in zoom-in" />
              )}
            </InputField>

            {/* رقم الجوال */}
            <div className="relative group">
              <label className="text-[10px] text-white/30 absolute -top-2.5 right-4 bg-[#0F0F12] px-2 z-10 font-bold uppercase italic">رقم الجوال</label>
              <div className="flex flex-row-reverse gap-3">
                <div className="relative w-32 shrink-0">
                  <select onChange={(e) => setSelectedCountry(GULF_COUNTRIES[e.target.selectedIndex])} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-sm appearance-none text-center font-bold outline-none cursor-pointer h-[66px]">
                    {GULF_COUNTRIES.map(c => <option key={c.iso} className="bg-[#0F0F12]">{c.iso} {c.code}</option>)}
                  </select>
                </div>
                <div className="flex-1 relative">
                  <input
                    type="tel" maxLength={selectedCountry.digits} autoComplete="tel"
                    placeholder={selectedCountry.placeholder}
                    {...signUpForm.register('phone')}
                    className={`w-full bg-white/[0.02] border rounded-2xl p-5 outline-none font-sans h-[66px] text-left dir-ltr ${signUpForm.formState.errors.phone ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[var(--theme-color)]'}`}
                    style={{ '--theme-color': themeColor } as React.CSSProperties}
                  />
                </div>
              </div>
              {signUpForm.formState.errors.phone && (
                <p className="text-red-400 text-[10px] mt-2 mr-2 font-bold flex items-center gap-1 animate-in slide-in-from-top-1">
                  <AlertCircle size={10} /> {signUpForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            {/* كلمة المرور */}
            <div className="space-y-4">
              <div className="relative">
                <InputField label="كلمة المرور" error={signUpForm.formState.errors.password?.message} themeColor={themeColor} inputId="signup-password">
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"} autoComplete="new-password"
                    aria-required="true"
                    aria-invalid={!!signUpForm.formState.errors.password}
                    {...signUpForm.register('password')}
                    className={`w-full bg-white/[0.02] border rounded-2xl p-5 outline-none font-sans transition-all ${signUpForm.formState.errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[var(--theme-color)]'}`}
                    style={{ '--theme-color': themeColor } as React.CSSProperties}
                  />
                </InputField>
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} className="absolute left-4 top-5 text-white/20 hover:text-white transition-colors z-20">
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>

              <InputField label="تأكيد كلمة المرور" error={signUpForm.formState.errors.confirmPassword?.message} themeColor={themeColor} inputId="signup-confirm-password">
                <input
                  id="signup-confirm-password"
                  type={showPassword ? "text" : "password"} autoComplete="new-password"
                  aria-required="true"
                  aria-invalid={!!signUpForm.formState.errors.confirmPassword}
                  {...signUpForm.register('confirmPassword')}
                  className={`w-full bg-white/[0.02] border rounded-2xl p-5 outline-none font-sans transition-all ${signUpForm.formState.errors.confirmPassword ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[var(--theme-color)]'}`}
                  style={{ '--theme-color': themeColor } as React.CSSProperties}
                />
              </InputField>
            </div>

            {serverError && <div role="alert" className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[11px] text-center font-bold flex items-center justify-center gap-2 animate-in fade-in"><AlertCircle size={14} aria-hidden="true" /> {serverError}</div>}

            <button
              type="submit" disabled={isLoading}
              style={{ backgroundColor: themeColor, boxShadow: `0 15px 30px ${themeColor}20` }}
              className="w-full text-black py-5 rounded-2xl font-black text-lg hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70 mt-6 shadow-xl"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'أنشئ حسابي الآن'}
            </button>
          </form>
        )}

        {/* ========================================= */}
        {/* === LOGIN PASSWORD FORM === */}
        {/* ========================================= */}
        {!isSignUp && loginMethod === 'password' && (
          <form onSubmit={loginPasswordForm.handleSubmit(handleLoginPassword)} className="space-y-4" noValidate>
            <InputField label="البريد الإلكتروني" error={loginPasswordForm.formState.errors.email?.message} themeColor={themeColor} inputId="login-email">
              <input
                id="login-email"
                type="email" placeholder="name@company.com" autoComplete="email"
                aria-required="true"
                aria-invalid={!!loginPasswordForm.formState.errors.email}
                {...loginPasswordForm.register('email')}
                className={`w-full bg-white/[0.02] border rounded-2xl p-5 outline-none font-sans transition-all ${loginPasswordForm.formState.errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[var(--theme-color)]'}`}
                style={{ '--theme-color': themeColor } as React.CSSProperties}
              />
            </InputField>

            <div className="relative">
              <InputField label="كلمة المرور" error={loginPasswordForm.formState.errors.password?.message} themeColor={themeColor} inputId="login-password">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"} autoComplete="current-password"
                  aria-required="true"
                  aria-invalid={!!loginPasswordForm.formState.errors.password}
                  {...loginPasswordForm.register('password')}
                  className={`w-full bg-white/[0.02] border rounded-2xl p-5 outline-none font-sans transition-all ${loginPasswordForm.formState.errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[var(--theme-color)]'}`}
                  style={{ '--theme-color': themeColor } as React.CSSProperties}
                />
              </InputField>
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} className="absolute left-4 top-5 text-white/20 hover:text-white transition-colors z-20">
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>

            <div className="flex justify-start">
              <Link
                href="/forgot-password"
                className="text-[11px] text-white/30 hover:text-blue-400 transition-colors font-bold"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>

            {serverError && <div role="alert" className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[11px] text-center font-bold flex items-center justify-center gap-2 animate-in fade-in"><AlertCircle size={14} aria-hidden="true" /> {serverError}</div>}

            <button
              type="submit" disabled={isLoading}
              style={{ backgroundColor: themeColor, boxShadow: `0 15px 30px ${themeColor}20` }}
              className="w-full text-black py-5 rounded-2xl font-black text-lg hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70 mt-6 shadow-xl"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'تسجيل الدخول'}
            </button>
          </form>
        )}

        {/* ========================================= */}
        {/* === OTP REQUEST FORM === */}
        {/* ========================================= */}
        {!isSignUp && loginMethod === 'otp' && !otpSent && (
          <form onSubmit={otpRequestForm.handleSubmit(handleOtpRequest)} className="space-y-4" noValidate>
            <InputField label="البريد الإلكتروني" error={otpRequestForm.formState.errors.email?.message} themeColor={themeColor} inputId="otp-email">
              <input
                id="otp-email"
                type="email" placeholder="name@company.com" autoComplete="email"
                aria-required="true"
                aria-invalid={!!otpRequestForm.formState.errors.email}
                {...otpRequestForm.register('email')}
                className={`w-full bg-white/[0.02] border rounded-2xl p-5 outline-none font-sans transition-all ${otpRequestForm.formState.errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[var(--theme-color)]'}`}
                style={{ '--theme-color': themeColor } as React.CSSProperties}
              />
            </InputField>

            {serverError && <div role="alert" className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[11px] text-center font-bold flex items-center justify-center gap-2 animate-in fade-in"><AlertCircle size={14} aria-hidden="true" /> {serverError}</div>}

            <button
              type="submit" disabled={isLoading}
              style={{ backgroundColor: themeColor, boxShadow: `0 15px 30px ${themeColor}20` }}
              className="w-full text-black py-5 rounded-2xl font-black text-lg hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70 mt-6 shadow-xl"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'إرسال الرمز'}
            </button>
          </form>
        )}

        {/* ========================================= */}
        {/* === OTP VERIFY FORM === */}
        {/* ========================================= */}
        {!isSignUp && loginMethod === 'otp' && otpSent && (
          <form onSubmit={otpVerifyForm.handleSubmit(handleOtpVerify)} className="space-y-4 animate-in slide-in-from-bottom-4" noValidate>
            <InputField label="رمز التحقق (6 أرقام)" error={otpVerifyForm.formState.errors.otp?.message} themeColor={themeColor} inputId="otp-code">
              <input
                id="otp-code"
                type="text" placeholder="------" maxLength={6}
                aria-required="true"
                aria-invalid={!!otpVerifyForm.formState.errors.otp}
                {...otpVerifyForm.register('otp')}
                className={`w-full bg-white/[0.02] border rounded-2xl p-5 outline-none font-sans transition-all text-center tracking-[0.5em] text-2xl font-mono ${otpVerifyForm.formState.errors.otp ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[var(--theme-color)]'}`}
                style={{ '--theme-color': themeColor } as React.CSSProperties}
              />
            </InputField>
            <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-white/40 hover:text-white w-full text-center">
              تغيير البريد الإلكتروني؟
            </button>

            {serverError && <div role="alert" className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[11px] text-center font-bold flex items-center justify-center gap-2 animate-in fade-in"><AlertCircle size={14} aria-hidden="true" /> {serverError}</div>}

            <button
              type="submit" disabled={isLoading}
              style={{ backgroundColor: themeColor, boxShadow: `0 15px 30px ${themeColor}20` }}
              className="w-full text-black py-5 rounded-2xl font-black text-lg hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70 mt-6 shadow-xl"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'تحقق ودخول'}
            </button>
          </form>
        )}

        <div className="relative my-8 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <span className="relative bg-[#0F0F12] px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">أو</span>
        </div>

        <button type="button" onClick={handleGoogleLogin} className="w-full bg-white/5 border border-white/10 text-white/70 py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 hover:text-white transition-all font-bold text-sm mb-6 shadow-md">
          <Chrome size={18} /> سجل عبر جوجل
        </button>

        <button onClick={() => { setIsSignUp(!isSignUp); setOtpSent(false); setLoginMethod('password'); setServerError(null); }} className="group flex flex-col items-center gap-1 mx-auto w-full">
          <span className="text-white/30 text-[11px] font-bold uppercase italic">{isSignUp ? 'لديك حساب مسبق؟' : 'انضم لعالم مِراس الجديد'}</span>
          <span style={{ color: themeColor }} className="text-sm font-black flex items-center gap-2 group-hover:underline">
            {isSignUp ? 'تفضل بتسجيل دخولك' : 'ابدأ رحلتك كمنظم الآن'}
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          </span>
        </button>

      </div>
    </div>
  );
}
