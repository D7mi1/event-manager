'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Heart,
  QrCode,
  Send,
  LayoutGrid,
  Check,
  ArrowRight,
  Sparkles,
  Users,
  Loader2,
  ShieldCheck,
  Smartphone,
  Clock,
} from 'lucide-react';
import {
  getAllEventPackages,
  type EventPackageId,
} from '@/lib/billing/plans';
import { createEventPackageCheckout } from '@/app/actions/billingActions';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';

// ============================================
// Wedding Landing Page - صفحة حفلات الزفاف
// ============================================

const weddingFeatures = [
  {
    icon: Heart,
    title: 'دعوات رقمية فاخرة',
    description: 'تصاميم ذهبية احترافية تليق بليلة العمر. أرسلها واتساب أو رابط مباشر.',
  },
  {
    icon: QrCode,
    title: 'تسجيل حضور بـ QR',
    description: 'كل ضيف يحصل على باركود فريد. امسحه عند الباب وتابع الحضور لحظياً.',
  },
  {
    icon: Send,
    title: 'إرسال واتساب جماعي',
    description: 'أرسل الدعوات لكل ضيوفك دفعة واحدة عبر واتساب. سريع وسهل.',
  },
  {
    icon: LayoutGrid,
    title: 'خريطة مقاعد ذكية',
    description: 'رتّب طاولات الضيوف بسهولة. كل ضيف يعرف مكانه من التذكرة.',
  },
];

const steps = [
  {
    number: '01',
    title: 'اختر باقتك',
    description: 'اختر الباقة المناسبة لعدد ضيوفك. من 100 إلى 2,000 ضيف.',
  },
  {
    number: '02',
    title: 'أضف الضيوف وأرسل الدعوات',
    description: 'أضف أسماء ضيوفك وأرسل لهم دعوات رقمية فورية عبر واتساب.',
  },
  {
    number: '03',
    title: 'تابع الحضور يوم الزفاف',
    description: 'يوم الحفل، امسح الباركود عند الباب وشوف كل شيء لحظياً من جوالك.',
  },
];

const faqs = [
  {
    q: 'هل أقدر أخصص تصميم الدعوة؟',
    a: 'نعم! نوفر تصاميم ذهبية واحترافية جاهزة. كما يمكنك تخصيص النصوص والألوان واسم العريس والعروس.',
  },
  {
    q: 'كيف يستلم الضيوف الدعوة؟',
    a: 'ترسل لهم رابط الدعوة عبر واتساب أو رسالة نصية. الضيف يفتح الرابط ويشوف الدعوة مع الباركود الخاص فيه.',
  },
  {
    q: 'هل أقدر أتابع مين حضر ومين ما حضر؟',
    a: 'بالتأكيد! لوحة التحكم تعطيك إحصائيات لحظية: عدد الحاضرين، المتبقين، ووقت وصول كل ضيف.',
  },
  {
    q: 'ايش يصير بعد ما تنتهي صلاحية الباقة؟',
    a: 'بياناتك وإحصائياتك تبقى محفوظة. الباقة تغطي فترة الفعالية (60 أو 90 يوم) وهي كافية لتنظيم وإدارة الحفل.',
  },
  {
    q: 'هل يشتغل بدون إنترنت يوم الحفل؟',
    a: 'نعم! الماسح الضوئي يعمل أوفلاين. البيانات تتزامن تلقائياً لما يرجع الاتصال.',
  },
];

export default function WeddingPage() {
  const eventPackages = getAllEventPackages();
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);

  const handleBuyPackage = async (packageId: EventPackageId) => {
    setPurchaseLoading(packageId);
    try {
      const result = await createEventPackageCheckout(packageId);
      if (result.success) {
        window.location.href = result.data.checkoutUrl;
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('يرجى تسجيل الدخول أولاً');
    } finally {
      setPurchaseLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#0F0F12] text-white selection:bg-[#C19D65]/30" dir="rtl">
      <Navbar />

      {/* ============================================ */}
      {/* Hero Section                                 */}
      {/* ============================================ */}
      <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#C19D65]/10 blur-[120px] pointer-events-none" aria-hidden="true" />
        <div className="absolute top-20 right-1/4 w-[300px] h-[300px] rounded-full bg-[#C19D65]/5 blur-[100px] pointer-events-none" aria-hidden="true" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 text-sm font-bold text-[#C19D65] bg-[#C19D65]/10 px-4 py-2 rounded-full mb-6 border border-[#C19D65]/20">
            <Heart className="w-4 h-4" />
            حفلات الزفاف
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            اجعل{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#C19D65] to-[#d4b07a]">
              ليلة العمر
            </span>
            {' '}لا تُنسى
          </h1>

          <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            دعوات رقمية احترافية، تتبع حضور لحظي، وتصاميم ذهبية فاخرة.
            كل شيء تحتاجه لتنظيم حفل زفافك من جوالك.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-black bg-[#C19D65] hover:bg-[#d4b07a] transition-all shadow-lg shadow-[#C19D65]/20 text-lg"
            >
              اختر باقتك
              <ArrowRight className="w-5 h-5 rotate-180" />
            </a>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              جرّب مجاناً
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ============================================ */}
      {/* Features - مميزات الزفاف                      */}
      {/* ============================================ */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              كل ما تحتاجه لحفل <span className="text-[#C19D65]">مثالي</span>
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">
              أدوات ذكية تساعدك في تنظيم وإدارة حفل زفافك بكل سهولة واحترافية
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {weddingFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.05] transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#C19D65]/10 text-[#C19D65] flex items-center justify-center mb-4 group-hover:bg-[#C19D65]/20 transition-colors">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{feature.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* How It Works - كيف يعمل                       */}
      {/* ============================================ */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              <span className="text-[#C19D65]">3</span> خطوات فقط
            </h2>
            <p className="text-white/40">من التسجيل إلى يوم الحفل</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="text-5xl font-black text-[#C19D65]/20 mb-4">{step.number}</div>
                <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* Pricing - باقات الزفاف                        */}
      {/* ============================================ */}
      <section id="pricing" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              باقات <span className="text-[#C19D65]">حفلات الزفاف</span>
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">
              دفعة واحدة بدون اشتراك شهري. اختر الباقة المناسبة لعدد ضيوفك.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {eventPackages.map((pkg, index) => {
              const isMiddle = index === 1;
              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex flex-col rounded-[2rem] transition-all duration-500 ${
                    isMiddle
                      ? 'p-[2px] bg-gradient-to-b from-[#C19D65] via-[#C19D65]/50 to-transparent shadow-2xl shadow-[#C19D65]/20 scale-[1.02] z-10'
                      : ''
                  }`}
                >
                  {isMiddle && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                      <div className="bg-[#C19D65] text-black text-xs font-black px-5 py-1.5 rounded-full shadow-lg shadow-[#C19D65]/40 whitespace-nowrap">
                        الأكثر طلباً
                      </div>
                    </div>
                  )}

                  <div className={`flex flex-col h-full p-8 rounded-[1.9rem] ${
                    isMiddle ? 'bg-[#121215]' : 'bg-white/[0.03] border border-white/[0.06]'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2.5 rounded-xl ${
                        isMiddle ? 'bg-[#C19D65]/20 text-[#C19D65]' : 'bg-white/10 text-white/60'
                      }`}>
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
                        <span className={`text-5xl font-black ${isMiddle ? 'text-[#C19D65]' : 'text-white'}`}>
                          {pkg.price}
                        </span>
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
                          <Check className="w-4 h-4 text-[#C19D65] shrink-0" />
                          <span className="text-white/70">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleBuyPackage(pkg.id as EventPackageId)}
                      disabled={purchaseLoading === pkg.id}
                      className={`block w-full py-4 rounded-2xl text-center font-bold transition-all duration-300 disabled:opacity-50 ${
                        isMiddle
                          ? 'bg-[#C19D65] text-black hover:bg-[#d4b07a] shadow-lg shadow-[#C19D65]/30 font-black text-lg'
                          : 'border border-white/10 text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {purchaseLoading === pkg.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" /> جاري التحويل...
                        </span>
                      ) : 'اشتر الآن'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <p className="mt-8 text-center text-white/30 text-sm">
            * جميع الباقات تشمل ماسح QR بدون إنترنت ودعم فني كامل
          </p>
        </div>
      </section>

      {/* ============================================ */}
      {/* Trust Badges                                  */}
      {/* ============================================ */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'تشفير كامل', icon: ShieldCheck },
              { label: 'يعمل بدون نت', icon: Smartphone },
              { label: 'دعم فني عربي', icon: Send },
              { label: 'تفعيل فوري', icon: Clock },
            ].map((item, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center">
                <item.icon className="w-6 h-6 text-[#C19D65] mx-auto mb-2" />
                <p className="text-sm font-bold text-white/60">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FAQ - أسئلة شائعة                             */}
      {/* ============================================ */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-white">أسئلة شائعة</h2>
          <p className="text-white/40 text-center mb-16 max-w-lg mx-auto">
            كل ما تحتاج معرفته عن تنظيم حفل زفافك مع مِراس
          </p>
          <div className="space-y-8">
            {faqs.map((faq, i) => (
              <div key={i} className="group">
                <h4 className="text-lg font-bold mb-3 transition-colors group-hover:text-[#C19D65] text-white">
                  {faq.q}
                </h4>
                <p className="text-white/50 text-sm leading-relaxed border-r-2 border-[#C19D65]/30 pr-4">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* Bottom CTA                                    */}
      {/* ============================================ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-b from-[#C19D65]/10 to-transparent border border-[#C19D65]/20 rounded-[2.5rem] p-12 md:p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" aria-hidden="true" />
          <div className="relative z-10">
            <Heart className="w-10 h-10 text-[#C19D65] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-white">
              جاهز لتنظيم حفل زفافك؟
            </h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              انضم لمئات العرسان اللي نظّموا حفلاتهم باحترافية مع مِراس.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-black bg-[#C19D65] hover:bg-[#d4b07a] transition-all shadow-lg shadow-[#C19D65]/20"
              >
                اختر باقتك الآن
                <ArrowRight className="w-4 h-4 rotate-180" />
              </a>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                ابدأ مجاناً
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <p className="text-white/20 text-xs">
          &copy; {new Date().getFullYear()} مِـراس. المنصة الأولى لتنظيم حفلات الزفاف والمناسبات في المملكة.
        </p>
      </footer>
    </main>
  );
}
