'use client';

import { useState } from 'react';
import { supabase } from '@/app/utils/supabase/client'; 
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Briefcase, PartyPopper, Chrome, ArrowLeft, Eye, EyeOff, ChevronRight } from 'lucide-react';
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
        {isTouched && !error && props.value && name !== 'password' && name !== 'confirmPassword' && (
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
      default: return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone' && !/^\d*$/.test(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  // 🛠️ تم تعديل دالة التحقق لتناسب حالتي التسجيل والدخول
  const isFormValid = () => {
    const basicValid = !validate('email', formData.email) && !validate('password', formData.password);

    if (!isSignUp) {
      // في حالة تسجيل الدخول، نتحقق من الإيميل والباسورد فقط
      return basicValid;
    }

    // في حالة إنشاء الحساب، نتحقق من باقي الحقول
    return basicValid && 
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
    
    // التحقق من صحة النموذج قبل الإرسال
    if (!isFormValid()) { 
      // تفعيل رسائل الخطأ للحقول المطلوبة فقط
      if (isSignUp) {
        setTouched({ fullName: true, email: true, phone: true, password: true, confirmPassword: true });
      } else {
        setTouched({ email: true, password: true });
      }
      return; 
    }
    
    setLoading(true); setError(null);
    try {
      if (isSignUp) {
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
          if (signUpError.message.includes('User already registered')) {
            throw new Error('هذا البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول.');
          }
          if (signUpError.message.includes('Password should be')) {
            throw new Error('كلمة المرور ضعيفة جداً.');
          }
          throw signUpError;
        }
        
        router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}&interest=${interest}`);
        
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ 
          email: formData.email, 
          password: formData.password 
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
          }
          throw signInError;
        }

        router.push('/dashboard');
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
        <span className="text-xs font-bold text-white/30 group-hover:text-white transition-colors tracking-wide hidden md:block">
          العودة للرئيسية
        </span>
      </Link>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 transition-all duration-1000" style={{ background: `radial-gradient(circle, ${themeColor} 0%, transparent 70%)` }} />

      <div className="w-full max-w-xl bg-[#0F0F12]/90 border border-white/10 rounded-[3.5rem] p-10 backdrop-blur-3xl shadow-2xl relative z-10">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border transition-all duration-500" style={{ backgroundColor: themeBg, borderColor: `${themeColor}40` }}>
            <Sparkles size={32} style={{ color: themeColor }} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter mb-2">مِـراس</h1>
          <p style={{ color: themeColor }} className="text-[11px] font-bold tracking-widest transition-colors duration-500 italic">ابدأ بتنظيم فعاليتك الأولى في أقل من دقيقتين</p>
        </div>

        {isSignUp && (
          <div className="mb-6 space-y-3">
            <label className="text-[10px] text-white/30 mr-2 font-black uppercase tracking-widest">ما هو اهتمامك الأساسي؟</label>
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

        <form onSubmit={handleAuth} className="space-y-4" noValidate>
           {isSignUp && (
             <InputField 
               name="fullName" 
               type="text" 
               label="الاسم الكامل" 
               placeholder="الاسم الثلاثي" 
               autoComplete="name"
               value={formData.fullName}
               onChange={handleChange}
               onBlur={handleBlur}
               error={isSignUp ? validate('fullName', formData.fullName) : ""}
               isTouched={touched.fullName}
               themeColor={themeColor}
             />
           )}
           
           <InputField 
             name="email" 
             type="email" 
             label="البريد الإلكتروني" 
             placeholder="name@company.com" 
             autoComplete="email"
             value={formData.email}
             onChange={handleChange}
             onBlur={handleBlur}
             error={isSignUp ? validate('email', formData.email) : ""}
             isTouched={touched.email}
             themeColor={themeColor}
           />

           {isSignUp && (
             <div className="space-y-1">
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
                        name="phone" type="tel" value={formData.phone} onChange={handleChange} onBlur={handleBlur} 
                        placeholder={selectedCountry.placeholder} maxLength={selectedCountry.digits} autoComplete="tel"
                        className={`w-full bg-white/[0.02] border rounded-2xl p-5 outline-none font-sans h-[66px] text-left dir-ltr ${touched.phone && validate('phone', formData.phone) ? 'border-red-500/50 focus:border-red-500' : 'border-white/10'} ${(!touched.phone || !validate('phone', formData.phone)) && 'focus:border-[var(--theme-color)]'}`}
                        style={{ '--theme-color': themeColor } as React.CSSProperties} />
                    </div>
                 </div>
                 {touched.phone && validate('phone', formData.phone) && <p className="text-red-400 text-[10px] mt-2 mr-2 font-bold flex items-center gap-1 animate-in slide-in-from-top-1"><AlertCircle size={10} /> {validate('phone', formData.phone)}</p>}
               </div>
             </div>
           )}

           <div className="space-y-4">
             <div className="relative">
                <InputField 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  label="كلمة المرور" 
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={isSignUp ? validate('password', formData.password) : ""}
                  isTouched={touched.password}
                  themeColor={themeColor}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-5 text-white/20 hover:text-white transition-colors z-20">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
             </div>
             
             {isSignUp && (
               <InputField 
                 name="confirmPassword" 
                 type={showPassword ? "text" : "password"} 
                 label="تأكيد كلمة المرور" 
                 autoComplete="new-password"
                 value={formData.confirmPassword}
                 onChange={handleChange}
                 onBlur={handleBlur}
                 error={isSignUp ? validate('confirmPassword', formData.confirmPassword) : ""}
                 isTouched={touched.confirmPassword}
                 themeColor={themeColor}
               />
             )}
           </div>

          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[11px] text-center font-bold flex items-center justify-center gap-2 animate-in fade-in"><AlertCircle size={14} /> {error}</div>}

          {/* 🛠️ تمت إضافة type="submit" للتأكد من تفاعل الزر */}
          <button 
            type="submit"
            disabled={loading} 
            style={{ backgroundColor: themeColor, boxShadow: `0 15px 30px ${themeColor}20` }} 
            className="w-full text-black py-5 rounded-2xl font-black text-lg hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70 mt-6 shadow-xl"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'أنشئ حسابي الآن' : 'تسجيل الدخول')}
          </button>
        </form>

        <div className="relative my-8 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <span className="relative bg-[#0F0F12] px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">أو</span>
        </div>

        <button type="button" onClick={handleGoogleLogin} className="w-full bg-white/5 border border-white/10 text-white/70 py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 hover:text-white transition-all font-bold text-sm mb-6 shadow-md">
          <Chrome size={18} /> سجل عبر جوجل
        </button>

        <button onClick={() => setIsSignUp(!isSignUp)} className="group flex flex-col items-center gap-1 mx-auto w-full">
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