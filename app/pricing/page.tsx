'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Sparkles,
  Crown,
  Building2,
  Zap,
  ArrowRight,
  Calendar,
  Users,
  Package,
  Plus,
} from 'lucide-react';
import {
  getAllPlans,
  getAllEventPackages,
  getAllAddons,
  getYearlySavings,
  type BillingInterval,
} from '@/lib/billing/plans';
import Navbar from '@/components/Navbar';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const planIcons: Record<string, React.ReactNode> = {
  free: <Zap className="w-6 h-6" />,
  starter: <Sparkles className="w-6 h-6" />,
  pro: <Crown className="w-6 h-6" />,
  enterprise: <Building2 className="w-6 h-6" />,
};

type PricingTab = 'subscriptions' | 'single_event' | 'addons';

const faqs = [
  {
    q: 'هل يمكنني تغيير باقتي لاحقاً؟',
    a: 'بالتأكيد، يمكنك الترقية أو تخفيض باقتك في أي وقت. سيتم احتساب الفرق بشكل تناسبي.',
  },
  {
    q: 'ما الفرق بين الاشتراك وباقة الفعالية الواحدة؟',
    a: 'الاشتراك يناسب المنظمين اللي عندهم فعاليات متكررة. باقة الفعالية الواحدة تناسب اللي عنده مناسبة واحدة فقط (زواج، تخرج، مؤتمر) بدون التزام شهري.',
  },
  {
    q: 'هل توجد فترة تجريبية؟',
    a: 'الباقة المجانية متاحة دائماً بدون حدود زمنية. كما نوفر 14 يوم تجربة مجانية لجميع الباقات المدفوعة.',
  },
  {
    q: 'هل يمكنني إلغاء اشتراكي؟',
    a: 'نعم، يمكنك الإلغاء في أي وقت. ستستمر باقتك حتى نهاية دورة الفوترة الحالية.',
  },
  {
    q: 'هل يمكنني شراء إضافات مع باقة الفعالية الواحدة؟',
    a: 'نعم! الإضافات متاحة لجميع الباقات. يمكنك إضافة رسائل واتساب أو ضيوف إضافيين حسب حاجتك.',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PricingPage() {
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [activeTab, setActiveTab] = useState<PricingTab>('subscriptions');
  const plans = getAllPlans();
  const eventPackages = getAllEventPackages();
  const addons = getAllAddons();
  const isYearly = interval === 'yearly';

  return (
    <main
      className="min-h-screen bg-[#0F0F12] text-white selection:bg-blue-500/30"
      dir="rtl"
    >
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" aria-hidden="true" />
        <div className="absolute top-20 right-1/4 w-[300px] h-[300px] rounded-full bg-[#C19D65]/10 blur-[100px] pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-sm font-bold text-[#C19D65] bg-[#C19D65]/10 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            باقات مرنة تناسب الجميع
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            اختر الباقة التي{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-400 to-blue-600">
              تناسب فعالياتك
            </span>
          </h1>
          <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            اشتراك شهري للمنظمين المحترفين، أو باقة فعالية واحدة بدون التزام.
          </p>
        </div>
      </section>

      {/* Pricing Tabs */}
      <section className="pb-8 px-6">
        <div className="flex items-center justify-center">
          <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-1.5 flex flex-wrap items-center gap-1 justify-center">
            {([
              { id: 'subscriptions' as PricingTab, label: 'اشتراكات شهرية', icon: <Calendar className="w-4 h-4" /> },
              { id: 'single_event' as PricingTab, label: 'فعالية واحدة', icon: <Users className="w-4 h-4" /> },
              { id: 'addons' as PricingTab, label: 'إضافات', icon: <Package className="w-4 h-4" /> },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* تاب الاشتراكات                               */}
      {/* ============================================ */}
      {activeTab === 'subscriptions' && (
        <>
          {/* Billing Toggle */}
          <section className="pb-12 px-6">
            <div className="flex items-center justify-center gap-4">
              <div className="relative bg-white/[0.05] border border-white/10 rounded-2xl p-1.5 flex items-center">
                <button
                  onClick={() => setInterval('monthly')}
                  className={`relative z-10 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                    !isYearly ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  شهري
                </button>
                <button
                  onClick={() => setInterval('yearly')}
                  className={`relative z-10 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                    isYearly ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  سنوي
                </button>
              </div>
              {isYearly && (
                <span className="text-xs font-bold bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full animate-pulse">
                  وفّر حتى {getYearlySavings('pro')}%
                </span>
              )}
            </div>
          </section>

          {/* Plans Grid */}
          <section className="pb-24 px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
              {plans.map((plan) => {
                const isPopular = plan.popular === true;
                const isEnterprise = plan.id === 'enterprise';
                const isFree = plan.id === 'free';
                const savings = getYearlySavings(plan.id);
                const price = plan.price[interval];

                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-[2rem] transition-all duration-500 ${
                      isPopular
                        ? 'p-[2px] bg-gradient-to-b from-blue-500 via-blue-600 to-transparent shadow-2xl shadow-blue-500/20 scale-[1.02] z-10'
                        : ''
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                        <div className="bg-blue-500 text-white text-xs font-black px-5 py-1.5 rounded-full shadow-lg shadow-blue-500/40 whitespace-nowrap">
                          الأكثر طلباً
                        </div>
                      </div>
                    )}

                    <div className={`flex flex-col h-full p-8 rounded-[1.9rem] ${
                      isPopular ? 'bg-[#121215]' : 'bg-white/[0.03] border border-white/[0.06]'
                    }`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2.5 rounded-xl ${
                          isPopular ? 'bg-blue-500/20 text-blue-400'
                            : isEnterprise ? 'bg-[#C19D65]/20 text-[#C19D65]'
                            : 'bg-white/10 text-white/60'
                        }`}>
                          {planIcons[plan.id]}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{plan.nameAr}</h3>
                          <p className="text-xs text-white/40">{plan.name}</p>
                        </div>
                      </div>

                      <p className="text-sm text-white/50 mb-6 leading-relaxed">{plan.description}</p>

                      <div className="mb-8">
                        {isEnterprise ? (
                          <span className="text-3xl font-black text-[#C19D65]">تواصل معنا</span>
                        ) : isFree ? (
                          <span className="text-5xl font-black text-white">مجاناً</span>
                        ) : (
                          <div className="flex items-baseline gap-2">
                            <span className={`text-5xl font-black ${isPopular ? 'text-blue-500' : 'text-white'}`}>
                              {isYearly ? Math.round(price / 12) : price}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-sm text-white/40 font-bold">ريال / شهر</span>
                              {isYearly && <span className="text-xs text-white/30">يُدفع {price} ريال سنوياً</span>}
                            </div>
                            {isYearly && savings > 0 && (
                              <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded-full mr-2">وفّر {savings}%</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="border-t border-white/[0.06] mb-6" />

                      <ul className="space-y-3 flex-1 mb-8">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm">
                            <Check className="w-4 h-4 text-blue-500 shrink-0" />
                            <span className="text-white/70">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {isEnterprise ? (
                        <Link href="/contact" className="block w-full py-4 rounded-2xl text-center font-bold transition-all duration-300 bg-[#C19D65]/20 text-[#C19D65] border border-[#C19D65]/30 hover:bg-[#C19D65]/30 hover:border-[#C19D65]/50">
                          تواصل معنا
                        </Link>
                      ) : isPopular ? (
                        <Link href="/dashboard" className="block w-full py-4 rounded-2xl text-center font-black text-lg transition-all duration-300 bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30">
                          اشترك الآن
                        </Link>
                      ) : (
                        <Link href="/dashboard" className="block w-full py-4 rounded-2xl text-center font-bold transition-all duration-300 border border-white/10 text-white/60 hover:bg-white/5 hover:text-white">
                          {isFree ? 'ابدأ مجاناً' : 'اشترك الآن'}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* ============================================ */}
      {/* تاب باقات الفعالية الواحدة                    */}
      {/* ============================================ */}
      {activeTab === 'single_event' && (
        <section className="pb-24 px-6 pt-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-3 text-white">عندك فعالية واحدة فقط؟</h2>
              <p className="text-white/50 max-w-lg mx-auto">
                باقات بدفعة واحدة بدون اشتراك شهري. مثالية لحفلات الزواج، التخرج، المؤتمرات، والمعارض.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {eventPackages.map((pkg, index) => {
                const isMiddle = index === 1;
                return (
                  <div
                    key={pkg.id}
                    className={`relative flex flex-col rounded-[2rem] transition-all duration-500 ${
                      isMiddle ? 'p-[2px] bg-gradient-to-b from-blue-500 via-blue-600 to-transparent shadow-2xl shadow-blue-500/20 scale-[1.02] z-10' : ''
                    }`}
                  >
                    {isMiddle && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                        <div className="bg-blue-500 text-white text-xs font-black px-5 py-1.5 rounded-full shadow-lg shadow-blue-500/40 whitespace-nowrap">الأكثر طلباً</div>
                      </div>
                    )}

                    <div className={`flex flex-col h-full p-8 rounded-[1.9rem] ${isMiddle ? 'bg-[#121215]' : 'bg-white/[0.03] border border-white/[0.06]'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2.5 rounded-xl ${isMiddle ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/60'}`}>
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{pkg.nameAr}</h3>
                          <p className="text-xs text-white/40">{pkg.name}</p>
                        </div>
                      </div>

                      <p className="text-sm text-white/50 mb-6">{pkg.description}</p>

                      <div className="mb-6">
                        <div className="flex items-baseline gap-2">
                          <span className={`text-5xl font-black ${isMiddle ? 'text-blue-500' : 'text-white'}`}>{pkg.price}</span>
                          <div className="flex flex-col">
                            <span className="text-sm text-white/40 font-bold">ريال</span>
                            <span className="text-xs text-white/30">دفعة واحدة</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-6 text-xs flex-wrap">
                        <span className="bg-[#C19D65]/10 text-[#C19D65] px-3 py-1 rounded-full font-bold border border-[#C19D65]/20">
                          حتى {pkg.maxGuests.toLocaleString('ar-SA')} ضيف
                        </span>
                        <span className="bg-white/5 text-white/50 px-3 py-1 rounded-full font-bold border border-white/10">
                          صلاحية {pkg.validDays} يوم
                        </span>
                      </div>

                      <div className="border-t border-white/[0.06] mb-6" />

                      <ul className="space-y-3 flex-1 mb-8">
                        {pkg.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm">
                            <Check className="w-4 h-4 text-blue-500 shrink-0" />
                            <span className="text-white/70">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Link
                        href="/dashboard"
                        className={`block w-full py-4 rounded-2xl text-center font-bold transition-all duration-300 ${
                          isMiddle
                            ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30 font-black text-lg'
                            : 'border border-white/10 text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        اشتر الآن
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-8 text-center text-white/30 text-sm">
              * جميع باقات الفعالية الواحدة تشمل ماسح QR بدون إنترنت ودعم فني كامل
            </p>
          </div>
        </section>
      )}

      {/* ============================================ */}
      {/* تاب الإضافات                                  */}
      {/* ============================================ */}
      {activeTab === 'addons' && (
        <section className="pb-24 px-6 pt-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-3 text-white">إضافات حسب حاجتك</h2>
              <p className="text-white/50 max-w-lg mx-auto">
                وسّع إمكانيات باقتك بإضافات مرنة. متاحة لجميع الباقات المدفوعة وباقات الفعالية الواحدة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addons.map((addon) => (
                <div
                  key={addon.id}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.05] transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{addon.nameAr}</h3>
                      <p className="text-sm text-white/50">{addon.description}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400 group-hover:bg-blue-600/20 transition-colors">
                      <Plus className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">{addon.price}</span>
                    <span className="text-sm text-white/40 font-bold">ريال</span>
                    <span className="text-xs text-white/30">/ {addon.quantity} {addon.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'تشفير كامل', icon: '🔒' },
              { label: 'دعم فني عربي', icon: '💬' },
              { label: 'بدون عقود', icon: '📄' },
              { label: 'إلغاء في أي وقت', icon: '✓' },
            ].map((item, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-center">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-sm font-bold text-white/60">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-32 px-6 border-t border-white/5 pt-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-white">الأسئلة الشائعة</h2>
          <p className="text-white/40 text-center mb-16 max-w-lg mx-auto">
            كل ما تحتاج معرفته عن باقات مِراس والاشتراكات
          </p>
          <div className="space-y-8">
            {faqs.map((faq, i) => (
              <div key={i} className="group cursor-pointer">
                <h4 className="text-lg font-bold mb-3 transition-colors group-hover:text-blue-500 text-white">{faq.q}</h4>
                <p className="text-white/50 text-sm leading-relaxed border-r-2 border-white/10 pr-4">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-32 px-6">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-b from-blue-600/10 to-transparent border border-blue-500/20 rounded-[2.5rem] p-12 md:p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" aria-hidden="true" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-white">جاهز لتنظيم فعاليتك؟</h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              انضم لأكثر من 500 منظم يستخدمون مِراس لإدارة فعالياتهم ومؤتمراتهم بكل احترافية.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white bg-blue-500 hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30">
                ابدأ مجاناً الآن
                <ArrowRight className="w-4 h-4 rotate-180" />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all">
                تواصل مع المبيعات
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <p className="text-white/20 text-xs">
          &copy; {new Date().getFullYear()} مِـراس. المنصة الأولى لتنظيم فعاليات الأعمال والمؤتمرات في المملكة.
        </p>
      </footer>
    </main>
  );
}
