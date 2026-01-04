'use client';

import { useState } from 'react';
import { supabase } from '@/app/utils/supabase/client'; 
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Briefcase, PartyPopper, Chrome, ArrowLeft, Eye, EyeOff, ChevronRight, KeyRound, Mail } from 'lucide-react';
import Link from 'next/link';

// بيانات الدول
const GULF_COUNTRIES = [
  { name: 'السعودية', code: '+966', flag: '🇸🇦', iso: 'SA', digits: 9, placeholder: '5xxxxxxxx' },
  { name: 'الإمارات', code: '+971', flag: '🇦🇪', iso: 'AE', digits: 9, placeholder: '5xxxxxxxx' },
  { name: 'الكويت', code: '+965', flag: '🇰🇼', iso: 'KW', digits: 8, placeholder: 'xxxxxxxx' },
  { name: 'قطر', code: '+974', flag: '🇶🇦', iso: 'QA', digits: 8, placeholder: 'xxxxxxxx' },
  { name: 'عمان', code: '+968', flag: '🇴🇲', iso: 'OM', digits: 8, placeholder: 'xxxxxxxx' },
  { name: 'البحرين', code: '+973', flag: '🇧🇭', iso: 'BH', digits: 8, placeholder: 'xxxxxxxx' },
];

// --- تعريف المكون خارج الدالة الرئيسية ---
const InputField = ({ label, error, isTouched, themeColor, name, ...props }: any) => {
  return (
    <div className="relative group">
      <label className="text-[10px] text-white/30 absolute -top-2.5 right-4 bg-[#0F0F12] px-2 z-10 font-bold uppercase italic">{label}</label>
      <div className="relative">
        <input
          name={name}
          className={`w-full bg-white/[0.02] border rounded-2xl p-5 outline-none font-sans transition-all 
            ${isTouched && error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10'} 
            ${(!isTouched || !error) && 'focus:border-[var(--theme-color)]'}`}
          style={{ '--theme-color': themeColor } as React.CSSProperties}
          {...props}
        />
        {isTouched && !error && props.value && name !== 'password' && name !== 'confirmPassword' && name !== 'otp' && (
          <CheckCircle2 size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 animate-in zoom-in" />
        )}
      </div>
      {isTouched && error && (
        <p className="text-red-400 text-[10px] mt-2 mr-2 font-bold flex items-center gap-1 animate-in slide-in-from-top-1">
          <AlertCircle size={10} /> {error}
        </p>
      )}
    </div>
  );
};

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password'); // ✅ جديد: طريقة الدخول
  const [otpSent, setOtpSent] = useState(false); // ✅ جديد: حالة إرسال الرمز
  const [otpCode, setOtpCode] = useState(''); // ✅ جديد: كود الـ OTP
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [interest, setInterest] = useState<'social' | 'business' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState(GULF_COUNTRIES[0]);
  const router = useRouter();

  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const themeColor = interest === 'business' ? '#3B82F6' : '#C19D65';
  const themeBg = interest === 'business' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(193, 157, 101, 0.1)';

  // --- التحقق ---
  const validate = (field: string, value: string) => {
    switch (field) {
      case 'fullName': return !value.trim() ? "لطفاً، زودنا باسمك لنتمكن من تخصيص تجربتك." : "";
      case 'email': return !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(value) ? "عذراً، صيغة البريد الإلكتروني غير صحيحة." : "";
      case 'phone': return (!/^\d+$/.test(value) || value.length !== selectedCountry.digits) ? `رقم الجوال يجب أن يكون ${selectedCountry.digits} أرقام.` : "";
      case 'password': return !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value) ? "كلمة المرور ضعيفة (8 خانات، حرف كبير وصغير ورقم)." : "";
      case 'confirmPassword': return value !== formData.password ? "كلمات المرور غير متطابقة." : "";
      case 'otp': return value.length !== 6 ? "رمز التحقق يجب أن يكون 6 أرقام" : ""; // ✅ جديد
      default: return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone' && !/^\d*$/.test(value)) return;
    if (name === 'otp') { setOtpCode(value); return; } // ✅ معالجة الـ OTP
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const name = e.target.name === 'otp' ? 'otp' : e.target.name;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const isFormValid = () => {
    const emailValid = !validate('email', formData.email);
    
    // 1. حالة تسجيل الدخول عبر OTP
    if (!isSignUp && loginMethod === 'otp') {
        if (otpSent) return emailValid && otpCode.length === 6;
        return emailValid;
    }

    // 2. حالة تسجيل الدخول عبر الباسورد
    if (!isSignUp && loginMethod === 'password') {
       return emailValid && !validate('password', formData.password);
    }

    // 3. حالة إنشاء الحساب
    return emailValid && 
           !validate('password', formData.password) &&
           !validate('fullName', formData.fullName) && 
           !validate('phone', formData.phone) && 
           !validate('confirmPassword', formData.confirmPassword);
  };

  // --- العمليات ---
  const handleGoogleLogin = async () => {
    if (isSignUp && !interest) { setError("يرجى اختيار نوع اهتمامك أولاً"); return; }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && !interest) { setError("يرجى اختيار نوع الاهتمام"); return; }
    
    if (!isFormValid()) { 
      if (isSignUp) {
        setTouched({ fullName: true, email: true, phone: true, password: true, confirmPassword: true });
      } else if (loginMethod === 'otp') {
         setTouched({ email: true, otp: true });
      } else {
        setTouched({ email: true, password: true });
      }
      return; 
    }
    
    setLoading(true); setError(null);
    try {
      if (isSignUp) {
        // --- منطق إنشاء الحساب (كما هو) ---
        const { error: signUpError } = await supabase.auth.signUp({ 
          email: formData.email, 
          password: formData.password,
          options: { 
            data: { 
              full_name: formData.fullName, 
              phone_number: `${selectedCountry.code}${formData.phone}`, 
              interest 
            } 
          }
        });
        
        if (signUpError) {
          if (signUpError.message.includes('User already registered')) throw new Error('هذا البريد الإلكتروني مسجل مسبقاً.');
          throw signUpError;
        }
        router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}&interest=${interest}`);
        
      } else {
        // --- منطق تسجيل الدخول ---
        
        if (loginMethod === 'otp') {
            // A. تسجيل الدخول عبر OTP
            if (!otpSent) {
                // 1. إرسال الرمز
                const { error: otpError } = await supabase.auth.signInWithOtp({
                    email: formData.email,
                    options: { shouldCreateUser: false } // لا تنشئ حساب جديد، فقط دخول
                });
                if (otpError) throw otpError;
                setOtpSent(true);
                alert(`تم إرسال الرمز إلى ${formData.email}`);
            } else {
                // 2. التحقق من الرمز
                const { error: verifyError } = await supabase.auth.verifyOtp({
                    email: formData.email,
                    token: otpCode,
                    type: 'email'
                });
                if (verifyError) throw new Error('الرمز غير صحيح أو منتهي الصلاحية');
                router.push('/dashboard');
            }

        } else {
            // B. تسجيل الدخول عبر كلمة المرور (التقليدي)
            const { error: signInError } = await supabase.auth.signInWithPassword({ 
              email: formData.email, 
              password: formData.password 
            });
    
            if (signInError) {
              if (signInError.message.includes('Invalid login credentials')) throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
              throw signInError;
            }
            router.push('/dashboard');
        }
      }
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

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
            {/* تغيير الأيقونة حسب حالة الـ OTP */}
            {loginMethod === 'otp' && !isSignUp ? <KeyRound size={32} style={{ color: themeColor }} /> : <Sparkles size={32} style={{ color: themeColor }} className="animate-pulse" />}
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter mb-2">مِـراس</h1>
          <p style={{ color: themeColor }} className="text-[11px] font-bold tracking-widest transition-colors duration-500 italic">
             {otpSent ? `تم إرسال الرمز إلى ${formData.email}` : 'ابدأ بتنظيم فعاليتك الأولى في أقل من دقيقتين'}
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
                    onClick={() => { setLoginMethod('password'); setOtpSent(false); setError(null); }}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${loginMethod === 'password' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                >
                    كلمة المرور
                </button>
                <button 
                    type="button"
                    onClick={() => { setLoginMethod('otp'); setError(null); }}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${loginMethod === 'otp' ? 'bg-[var(--theme-color)] text-black' : 'text-white/40 hover:text-white'}`}
                    style={loginMethod === 'otp' ? { backgroundColor: themeColor } : {}}
                >
                    رمز التحقق (OTP)
                </button>
            </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4" noValidate>
           {/* الاسم (فقط تسجيل) */}
           {isSignUp && (
             <InputField 
               name="fullName" type="text" label="الاسم الكامل" placeholder="الاسم الثلاثي" autoComplete="name"
               value={formData.fullName} onChange={handleChange} onBlur={handleBlur}
               error={validate('fullName', formData.fullName)} isTouched={touched.fullName} themeColor={themeColor}
             />
           )}
           
           {/* البريد الإلكتروني (دائماً موجود إلا إذا تم إرسال الرمز في وضع OTP) */}
           {(!otpSent || isSignUp || loginMethod === 'password') && (
               <InputField 
                 name="email" type="email" label="البريد الإلكتروني" placeholder="name@company.com" autoComplete="email"
                 value={formData.email} onChange={handleChange} onBlur={handleBlur}
                 error={validate('email', formData.email)} isTouched={touched.email} themeColor={themeColor}
               />
           )}

           {/* رقم الجوال (فقط تسجيل) */}
           {isSignUp && (
             <div className="relative group">
                {/* ... (نفس كود الجوال السابق لم يتغير) ... */}
                 <label className="text-[10px] text-white/30 absolute -top-2.5 right-4 bg-[#0F0F12] px-2 z-10 font-bold uppercase italic">رقم الجوال</label>
                 <div className="flex flex-row-reverse gap-3">
                    <div className="relative w-32 shrink-0">
                      <select onChange={(e) => setSelectedCountry(GULF_COUNTRIES[e.target.selectedIndex])} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-sm appearance-none text-center font-bold outline-none cursor-pointer h-[66px]">
                        {GULF_COUNTRIES.map(c => <option key={c.iso} className="bg-[#0F0F12]">{c.iso} {c.code}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 relative">
                      <input name="phone" type="tel" value={formData.phone} onChange={handleChange} onBlur={handleBlur} 
                        placeholder={selectedCountry.placeholder} maxLength={selectedCountry.digits} autoComplete="tel"
                        className={`w-full bg-white/[0.02] border rounded-2xl p-5 outline-none font-sans h-[66px] text-left dir-ltr ${touched.phone && validate('phone', formData.phone) ? 'border-red-500/50 focus:border-red-500' : 'border-white/10'} ${(!touched.phone || !validate('phone', formData.phone)) && 'focus:border-[var(--theme-color)]'}`}
                        style={{ '--theme-color': themeColor } as React.CSSProperties} />
                    </div>
                 </div>
             </div>
           )}

           {/* كلمة المرور (في التسجيل أو الدخول بالباسورد) */}
           {(isSignUp || (!isSignUp && loginMethod === 'password')) && (
             <div className="space-y-4">
               <div className="relative">
                 <InputField 
                   name="password" type={showPassword ? "text" : "password"} label="كلمة المرور" autoComplete="new-password"
                   value={formData.password} onChange={handleChange} onBlur={handleBlur}
                   error={isSignUp ? validate('password', formData.password) : ""} isTouched={touched.password} themeColor={themeColor}
                 />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-5 text-white/20 hover:text-white transition-colors z-20">
                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                 </button>
               </div>
               
               {isSignUp && (
                 <InputField 
                   name="confirmPassword" type={showPassword ? "text" : "password"} label="تأكيد كلمة المرور" autoComplete="new-password"
                   value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                   error={validate('confirmPassword', formData.confirmPassword)} isTouched={touched.confirmPassword} themeColor={themeColor}
                 />
               )}
             </div>
           )}

           {/* 🔑 حقل إدخال OTP (يظهر فقط عند الدخول بـ OTP وبعد الإرسال) */}
           {!isSignUp && loginMethod === 'otp' && otpSent && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4">
                  <InputField 
                    name="otp" 
                    type="text" 
                    label="رمز التحقق (6 أرقام)" 
                    placeholder="------" 
                    maxLength={6}
                    value={otpCode} 
                    onChange={handleChange} 
                    onBlur={handleBlur}
                    error={validate('otp', otpCode)} 
                    isTouched={touched.otp} 
                    themeColor={themeColor}
                    className="text-center tracking-[0.5em] text-2xl font-mono" // تنسيق خاص للأرقام
                  />
                  <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-white/40 hover:text-white w-full text-center">
                    تغيير البريد الإلكتروني؟
                  </button>
              </div>
           )}

          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[11px] text-center font-bold flex items-center justify-center gap-2 animate-in fade-in"><AlertCircle size={14} /> {error}</div>}

          <button 
            type="submit"
            disabled={loading} 
            style={{ backgroundColor: themeColor, boxShadow: `0 15px 30px ${themeColor}20` }} 
            className="w-full text-black py-5 rounded-2xl font-black text-lg hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70 mt-6 shadow-xl"
          >
            {loading ? <Loader2 className="animate-spin" /> : 
                (isSignUp ? 'أنشئ حسابي الآن' : 
                 loginMethod === 'otp' ? (otpSent ? 'تحقق ودخول' : 'إرسال الرمز') : 'تسجيل الدخول')
            }
          </button>
        </form>

        <div className="relative my-8 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <span className="relative bg-[#0F0F12] px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">أو</span>
        </div>

        <button type="button" onClick={handleGoogleLogin} className="w-full bg-white/5 border border-white/10 text-white/70 py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 hover:text-white transition-all font-bold text-sm mb-6 shadow-md">
          <Chrome size={18} /> سجل عبر جوجل
        </button>

        <button onClick={() => { setIsSignUp(!isSignUp); setOtpSent(false); setLoginMethod('password'); }} className="group flex flex-col items-center gap-1 mx-auto w-full">
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