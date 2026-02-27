'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User, CreditCard, Shield, Download, Check, Loader2,
  KeyRound, Eye, EyeOff, AlertTriangle, Trash2, LogOut, Mail,
  Zap, ArrowUpLeft, Crown, Sparkles, ExternalLink, Calendar,
  FileSpreadsheet, Award, ClipboardList, Smartphone, BarChart3,
  Layout, MessageCircle, Cpu, Users, Palette, ChevronLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/contexts/auth-context';
import { PLANS, type PlanId } from '@/lib/billing/plans';
import Link from 'next/link';

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, signOut } = useAuth();

  // حقول الملف الشخصي
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // حقول تغيير كلمة المرور
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // حذف الحساب
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteSection, setShowDeleteSection] = useState(false);

  // بيانات الاشتراك (تُجلب من profiles)
  const [currentPlanId, setCurrentPlanId] = useState<PlanId>('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [subscriptionPeriodEnd, setSubscriptionPeriodEnd] = useState<string | null>(null);
  const [polarCustomerId, setPolarCustomerId] = useState<string | null>(null);
  const currentPlan = PLANS[currentPlanId];

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { data } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
        const profileData = data || {};
        setFullName(profileData.full_name || '');
        setCompanyName(profileData.company_name || '');
        setTaxNumber(profileData.tax_number || '');
        // بيانات الاشتراك
        if (profileData.plan_id && profileData.plan_id in PLANS) {
          setCurrentPlanId(profileData.plan_id as PlanId);
        }
        setSubscriptionStatus(profileData.subscription_status || null);
        setSubscriptionPeriodEnd(profileData.subscription_period_end || null);
        setPolarCustomerId(profileData.polar_customer_id || null);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  // التحقق من نجاح الدفع (redirect من Polar)
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('تم تفعيل اشتراكك بنجاح! مرحباً بك 🎉');
    }
  }, [searchParams]);

  // --- حفظ الملف الشخصي ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName.trim(),
          company_name: companyName.trim() || null,
          tax_number: taxNumber.trim() || null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success('تم حفظ بيانات الملف الشخصي بنجاح');
    } catch (err: any) {
      toast.error('فشل حفظ البيانات: ' + (err.message || 'خطأ غير متوقع'));
    } finally {
      setSavingProfile(false);
    }
  };

  // --- تغيير كلمة المرور ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.warning('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      toast.warning('يجب أن تحتوي على حرف كبير واحد على الأقل');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      toast.warning('يجب أن تحتوي على رقم واحد على الأقل');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.warning('كلمتا المرور غير متطابقتين');
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        if (error.message.includes('same_password')) {
          throw new Error('كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية');
        }
        throw error;
      }

      toast.success('تم تغيير كلمة المرور بنجاح');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      toast.error(err.message || 'فشل تغيير كلمة المرور');
    } finally {
      setChangingPassword(false);
    }
  };

  // --- تسجيل الخروج ---
  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C19D65]" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'الملف الشخصي', icon: User },
    { id: 'billing', label: 'الاشتراكات والفواتير', icon: CreditCard },
    { id: 'security', label: 'الأمان', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white p-6 pt-24 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-8">الإعدادات والاشتراكات</h1>

        {/* Tabs Navigation */}
        <div role="tablist" aria-label="إعدادات الحساب" className="flex gap-4 border-b border-white/10 mb-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-4 flex items-center gap-2 font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#C19D65] border-b-2 border-[#C19D65]'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                <Icon size={18} aria-hidden="true" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ========================================= */}
        {/* === Tab: Profile === */}
        {/* ========================================= */}
        {activeTab === 'profile' && (
          <div role="tabpanel" id="tabpanel-profile" aria-labelledby="tab-profile" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-[#0F0F12] border border-white/5 rounded-[2rem] p-8">
              {/* معلومات البريد */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                <div className="w-12 h-12 rounded-xl bg-[#C19D65]/10 border border-[#C19D65]/20 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-[#C19D65]" />
                </div>
                <div>
                  <p className="text-xs text-white/40 font-bold">البريد الإلكتروني</p>
                  <p className="text-white/70 font-mono text-sm" dir="ltr">{user?.email || '—'}</p>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-6">بيانات الحساب</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                <div>
                  <label className="text-xs font-bold text-white/50 block mb-2">الاسم الكامل</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-[#C19D65] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 block mb-2">اسم الشركة / الجهة (للفاتورة)</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="اختياري"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-[#C19D65] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 block mb-2">الرقم الضريبي (VAT Number)</label>
                  <input
                    type="text"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    placeholder="3xxxxxxxxxxxxx"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-[#C19D65] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-[#C19D65] text-black px-8 py-3 rounded-xl font-bold mt-4 hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check size={16} />}
                  حفظ التغييرات
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* === Tab: Billing === */}
        {/* ========================================= */}
        {activeTab === 'billing' && (
          <div role="tabpanel" id="tabpanel-billing" aria-labelledby="tab-billing" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* بطاقة الخطة الحالية */}
            <div className="bg-gradient-to-r from-[#0F0F12] to-[#1A1A1D] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#C19D65]" />
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <p className="text-sm text-white/50 mb-1">الباقة الحالية</p>
                  <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                    {currentPlanId === 'free' && <Zap className="text-[#C19D65]" size={28} />}
                    {currentPlanId === 'starter' && <Sparkles className="text-blue-400" size={28} />}
                    {currentPlanId === 'pro' && <Crown className="text-blue-500" size={28} />}
                    {currentPlanId === 'enterprise' && <Crown className="text-[#C19D65]" size={28} />}
                    {currentPlan.nameAr}
                  </h2>

                  {/* حالة الاشتراك */}
                  {subscriptionStatus === 'active' ? (
                    <p className="text-green-400 text-sm font-bold flex items-center gap-2">
                      <Check size={14} /> فعالة ونشطة
                    </p>
                  ) : subscriptionStatus === 'canceled' ? (
                    <p className="text-orange-400 text-sm font-bold flex items-center gap-2">
                      <AlertTriangle size={14} /> ملغي - فعال حتى نهاية الفترة
                    </p>
                  ) : subscriptionStatus === 'past_due' ? (
                    <p className="text-red-400 text-sm font-bold flex items-center gap-2">
                      <AlertTriangle size={14} /> متأخر الدفع
                    </p>
                  ) : (
                    <p className="text-[#C19D65] text-sm font-bold flex items-center gap-2">
                      <Check size={14} /> {currentPlanId === 'free' ? 'باقة مجانية' : 'فعالة'}
                    </p>
                  )}

                  {currentPlan.price.monthly > 0 && (
                    <p className="text-white/30 text-xs mt-1">{currentPlan.price.monthly} ر.س / شهرياً</p>
                  )}

                  {subscriptionPeriodEnd && (
                    <p className="text-white/20 text-[10px] mt-1 flex items-center gap-1">
                      <Calendar size={10} />
                      {subscriptionStatus === 'canceled' ? 'ينتهي' : 'يتجدد'} في{' '}
                      {new Date(subscriptionPeriodEnd).toLocaleDateString('ar-SA')}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {currentPlanId !== 'enterprise' && (
                    <Link
                      href="/pricing"
                      className="bg-[#C19D65] text-black px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                    >
                      <ArrowUpLeft size={14} />
                      {currentPlanId === 'free' ? 'ترقية الباقة' : 'تغيير الباقة'}
                    </Link>
                  )}
                  {polarCustomerId && (
                    <button
                      onClick={async () => {
                        try {
                          const { getCustomerPortal } = await import('@/app/actions/billingActions');
                          const result = await getCustomerPortal();
                          if (result.success) {
                            window.open(result.data.portalUrl, '_blank');
                          } else {
                            toast.error(result.error ?? 'فشل فتح بوابة إدارة الاشتراك');
                          }
                        } catch {
                          toast.error('حدث خطأ في فتح بوابة الاشتراك');
                        }
                      }}
                      className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all border border-white/10 flex items-center gap-2"
                    >
                      <ExternalLink size={14} />
                      إدارة الاشتراك
                    </button>
                  )}
                </div>
              </div>

              {/* حدود الخطة الحالية - أرقام */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 border-t border-white/5 pt-6">
                {[
                  { label: 'الفعاليات', value: currentPlan.limits.maxEvents, icon: Calendar },
                  { label: 'الضيوف / فعالية', value: currentPlan.limits.maxGuestsPerEvent, icon: Users },
                  { label: 'القوالب', value: currentPlan.limits.maxTemplates, icon: Palette },
                  { label: 'أعضاء الفريق', value: currentPlan.limits.maxTeamMembers, icon: Users },
                  { label: 'رسائل واتساب', value: currentPlan.limits.whatsappMessages, icon: MessageCircle },
                  { label: 'تصميم AI', value: currentPlan.limits.aiGenerations, icon: Cpu },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon size={12} className="text-white/30" />
                        <p className="text-[10px] text-white/40 font-bold">{item.label}</p>
                      </div>
                      <p className="text-lg font-black">
                        {item.value === Infinity ? '∞' : item.value.toLocaleString('ar-SA')}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* ميزات إضافية - badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                {currentPlan.limits.analytics && (
                  <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-bold border border-blue-500/20 flex items-center gap-1">
                    <BarChart3 size={10} /> تحليلات
                  </span>
                )}
                {currentPlan.limits.seatMap && (
                  <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-bold border border-blue-500/20 flex items-center gap-1">
                    <Layout size={10} /> خريطة الجلوس
                  </span>
                )}
                {currentPlan.limits.exportExcel && (
                  <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-lg text-[10px] font-bold border border-green-500/20 flex items-center gap-1">
                    <FileSpreadsheet size={10} /> تصدير Excel
                  </span>
                )}
                {currentPlan.limits.certificates && (
                  <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-lg text-[10px] font-bold border border-purple-500/20 flex items-center gap-1">
                    <Award size={10} /> شهادات حضور
                  </span>
                )}
                {currentPlan.limits.survey && (
                  <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-lg text-[10px] font-bold border border-amber-500/20 flex items-center gap-1">
                    <ClipboardList size={10} /> استبيان
                  </span>
                )}
                {currentPlan.limits.walletPass && (
                  <span className="bg-pink-500/10 text-pink-400 px-3 py-1 rounded-lg text-[10px] font-bold border border-pink-500/20 flex items-center gap-1">
                    <Smartphone size={10} /> Wallet Pass
                  </span>
                )}
                {currentPlan.limits.customBranding && (
                  <span className="bg-[#C19D65]/10 text-[#C19D65] px-3 py-1 rounded-lg text-[10px] font-bold border border-[#C19D65]/20 flex items-center gap-1">
                    <Palette size={10} /> هوية مخصصة
                  </span>
                )}
                {currentPlan.limits.prioritySupport && (
                  <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-lg text-[10px] font-bold border border-green-500/20 flex items-center gap-1">
                    <Zap size={10} /> دعم أولوية
                  </span>
                )}
                {!currentPlan.limits.analytics && !currentPlan.limits.seatMap && !currentPlan.limits.exportExcel && (
                  <span className="text-white/20 text-[10px]">ترقّ لخطة أعلى للحصول على ميزات إضافية</span>
                )}
              </div>
            </div>

            {/* ميزات الباقة */}
            <div className="bg-[#0F0F12] border border-white/5 rounded-[2rem] p-8">
              <h3 className="text-lg font-bold mb-4">ميزات باقتك الحالية</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentPlan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-white/60">
                    <Check size={14} className="text-[#C19D65] shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
              {currentPlanId === 'free' && (
                <div className="mt-6 p-4 bg-[#C19D65]/5 border border-[#C19D65]/10 rounded-xl">
                  <p className="text-sm text-white/60 leading-relaxed">
                    <strong className="text-[#C19D65]">💡 هل تعلم؟</strong>{' '}
                    يمكنك شراء باقة فعالية واحدة إذا كنت تحتاج لفعالية واحدة فقط بدون اشتراك شهري.
                  </p>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-1 text-[#C19D65] text-sm font-bold mt-2 hover:underline"
                  >
                    تصفح باقات الفعالية الواحدة <ChevronLeft size={14} />
                  </Link>
                </div>
              )}
            </div>

            {/* إدارة الفوترة عبر Polar */}
            {polarCustomerId ? (
              <div className="bg-[#0F0F12] border border-white/5 rounded-[2rem] p-8">
                <h3 className="text-lg font-bold mb-4">إدارة الفوترة والفواتير</h3>
                <p className="text-sm text-white/50 mb-4 leading-relaxed">
                  يمكنك إدارة اشتراكك وتحديث بيانات الدفع وتحميل الفواتير من بوابة العميل.
                </p>
                <button
                  onClick={async () => {
                    try {
                      const { getCustomerPortal } = await import('@/app/actions/billingActions');
                      const result = await getCustomerPortal();
                      if (result.success) {
                        window.open(result.data.portalUrl, '_blank');
                      } else {
                        toast.error(result.error ?? 'فشل فتح بوابة إدارة الاشتراك');
                      }
                    } catch {
                      toast.error('حدث خطأ في فتح بوابة الاشتراك');
                    }
                  }}
                  className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all border border-white/10 flex items-center gap-2"
                >
                  <ExternalLink size={16} />
                  فتح بوابة إدارة الاشتراك والفواتير
                </button>
              </div>
            ) : (
              <div className="bg-[#0F0F12] border border-white/5 rounded-[2rem] p-8">
                <h3 className="text-lg font-bold mb-4">الفواتير</h3>
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-white/10 mx-auto mb-3" />
                  <p className="text-sm text-white/30">لا توجد فواتير بعد</p>
                  <p className="text-xs text-white/20 mt-1">ستظهر الفواتير هنا بعد الاشتراك في باقة مدفوعة</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================= */}
        {/* === Tab: Security === */}
        {/* ========================================= */}
        {activeTab === 'security' && (
          <div role="tabpanel" id="tabpanel-security" aria-labelledby="tab-security" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

            {/* تغيير كلمة المرور */}
            <div className="bg-[#0F0F12] border border-white/5 rounded-[2rem] p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
                  <KeyRound className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">تغيير كلمة المرور</h3>
                  <p className="text-xs text-white/40">تأكد من استخدام كلمة مرور قوية ومختلفة</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                <div className="relative">
                  <label className="text-xs font-bold text-white/50 block mb-2">كلمة المرور الجديدة</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute left-4 top-10 text-white/20 hover:text-white transition-colors"
                  >
                    {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-white/50 block mb-2">تأكيد كلمة المرور الجديدة</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* متطلبات كلمة المرور - تفاعلية */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <p className="text-[10px] text-white/30 font-bold mb-2">متطلبات كلمة المرور:</p>
                  <ul className="space-y-1 text-[10px]">
                    <li className={`flex items-center gap-2 ${newPassword.length >= 8 ? 'text-green-400' : 'text-white/40'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 8 ? 'bg-green-400' : 'bg-white/20'}`} />
                      8 أحرف على الأقل
                    </li>
                    <li className={`flex items-center gap-2 ${/[A-Z]/.test(newPassword) ? 'text-green-400' : 'text-white/40'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-green-400' : 'bg-white/20'}`} />
                      حرف كبير واحد على الأقل (A-Z)
                    </li>
                    <li className={`flex items-center gap-2 ${/[0-9]/.test(newPassword) ? 'text-green-400' : 'text-white/40'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-green-400' : 'bg-white/20'}`} />
                      رقم واحد على الأقل (0-9)
                    </li>
                    <li className={`flex items-center gap-2 ${newPassword && newPassword === confirmNewPassword ? 'text-green-400' : 'text-white/40'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${newPassword && newPassword === confirmNewPassword ? 'bg-green-400' : 'bg-white/20'}`} />
                      كلمتا المرور متطابقتان
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={changingPassword || !newPassword || !confirmNewPassword}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold mt-2 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound size={16} />}
                  تغيير كلمة المرور
                </button>
              </form>
            </div>

            {/* إدارة الجلسات */}
            <div className="bg-[#0F0F12] border border-white/5 rounded-[2rem] p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-orange-600/10 border border-orange-600/20 flex items-center justify-center">
                  <LogOut className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">إدارة الجلسات</h3>
                  <p className="text-xs text-white/40">تسجيل الخروج من هذا الجهاز</p>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white/70">الجلسة الحالية</p>
                  <p className="text-[10px] text-white/30">البريد: {user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="bg-white/5 hover:bg-red-600/20 text-white/60 hover:text-red-400 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-white/5 hover:border-red-600/30"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>

            {/* منطقة الخطر - حذف الحساب */}
            <div className="bg-[#0F0F12] border border-red-900/20 rounded-[2rem] p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-400">منطقة الخطر</h3>
                  <p className="text-xs text-white/40">هذه الإجراءات لا يمكن التراجع عنها</p>
                </div>
              </div>

              {!showDeleteSection ? (
                <button
                  onClick={() => setShowDeleteSection(true)}
                  className="bg-white/5 hover:bg-red-600/10 text-white/40 hover:text-red-400 px-6 py-3 rounded-xl text-sm font-bold transition-all border border-white/5 hover:border-red-600/20 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  حذف الحساب نهائيا
                </button>
              ) : (
                <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="bg-red-600/5 border border-red-600/20 rounded-xl p-4">
                    <p className="text-sm text-red-300 leading-relaxed mb-1 font-bold">تحذير: حذف الحساب نهائي ولا يمكن التراجع عنه.</p>
                    <p className="text-xs text-red-300/60 leading-relaxed">
                      سيتم حذف جميع فعالياتك، قوائم الضيوف، التذاكر المُصدرة، والقوالب.
                      الفعاليات النشطة والتذاكر المُصدرة ستتوقف عن العمل فورا.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-red-400/70 block mb-2">
                      {"اكتب \"حذف حسابي\" للتأكيد"}
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="حذف حسابي"
                      className="w-full bg-white/5 border border-red-600/20 rounded-xl p-4 outline-none focus:border-red-500 text-red-300 transition-colors max-w-sm"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      disabled={deleteConfirmText !== 'حذف حسابي'}
                      onClick={() => {
                        toast.error('لحماية بياناتك، يرجى التواصل مع فريق الدعم لإتمام حذف الحساب');
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      تأكيد الحذف النهائي
                    </button>
                    <button
                      onClick={() => { setShowDeleteSection(false); setDeleteConfirmText(''); }}
                      className="bg-white/5 text-white/60 px-6 py-3 rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
