import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Shield, Database, Eye, Lock, Bell, UserCheck, Globe, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | مِراس',
  description: 'سياسة الخصوصية وحماية البيانات الشخصية في منصة مِراس لتنظيم الفعاليات والمؤتمرات.',
};

const sections = [
  {
    icon: Database,
    title: 'البيانات التي نجمعها',
    content: `نجمع المعلومات التالية عند استخدامك لمنصة مِراس:`,
    list: [
      'معلومات الحساب: الاسم، البريد الإلكتروني، ورقم الهاتف عند التسجيل.',
      'بيانات الفعاليات: تفاصيل الفعاليات التي تنشئها، قوائم الحضور، وإعدادات التذاكر.',
      'بيانات الاستخدام: كيفية تفاعلك مع المنصة لتحسين تجربة المستخدم.',
      'معلومات الجهاز: نوع المتصفح ونظام التشغيل لأغراض التوافق.',
    ],
  },
  {
    icon: Eye,
    title: 'كيف نستخدم بياناتك',
    content: `نستخدم المعلومات المجمعة للأغراض التالية:`,
    list: [
      'تقديم وتشغيل خدمات المنصة بما في ذلك إدارة الفعاليات والتذاكر.',
      'إرسال إشعارات ورسائل متعلقة بفعالياتك عبر الواتساب أو البريد الإلكتروني.',
      'تحسين المنصة وتطوير ميزات جديدة بناءً على أنماط الاستخدام.',
      'ضمان أمان المنصة ومنع الاستخدام المسيء أو غير المصرح به.',
      'توفير خدمات الذكاء الاصطناعي لتوليد المحتوى والتصاميم.',
    ],
  },
  {
    icon: Lock,
    title: 'حماية البيانات',
    content: `نلتزم بأعلى معايير أمان المعلومات لحماية بياناتك:`,
    list: [
      'تشفير البيانات أثناء النقل باستخدام بروتوكول TLS/SSL.',
      'تطبيق سياسات أمان المحتوى (CSP) وحماية النقل الصارمة (HSTS).',
      'حماية ضد هجمات XSS وSQL Injection وPath Traversal.',
      'تقييد معدل الطلبات (Rate Limiting) لحماية الخدمة من الاستغلال.',
      'المصادقة الآمنة مع التحقق من البريد الإلكتروني.',
      'المراقبة المستمرة للأنظمة واكتشاف الأنشطة المشبوهة.',
    ],
  },
  {
    icon: UserCheck,
    title: 'مشاركة البيانات',
    content: `نحن نحترم خصوصيتك ولا نبيع بياناتك الشخصية لأي طرف ثالث. قد نشارك بياناتك في الحالات التالية فقط:`,
    list: [
      'مع مزودي الخدمة الضروريين لتشغيل المنصة (مثل خدمات الاستضافة والبريد الإلكتروني).',
      'عند الضرورة للامتثال لأمر قضائي أو طلب رسمي من جهة حكومية مختصة.',
      'لحماية حقوقنا القانونية أو سلامة المستخدمين الآخرين.',
      'بموافقتك الصريحة المسبقة في أي حالة أخرى.',
    ],
  },
  {
    icon: Bell,
    title: 'حقوقك',
    content: `بصفتك مستخدماً لمنصة مِراس، تتمتع بالحقوق التالية:`,
    list: [
      'الحق في الوصول إلى بياناتك الشخصية المخزنة لدينا.',
      'الحق في تصحيح أو تحديث بياناتك الشخصية.',
      'الحق في طلب حذف حسابك وبياناتك.',
      'الحق في الاعتراض على معالجة بياناتك لأغراض تسويقية.',
      'الحق في طلب نسخة من بياناتك بتنسيق قابل للقراءة آلياً.',
    ],
  },
  {
    icon: Globe,
    title: 'ملفات تعريف الارتباط (Cookies)',
    content: `نستخدم ملفات تعريف الارتباط الضرورية فقط لتشغيل المنصة بشكل صحيح. تشمل هذه الملفات:`,
    list: [
      'ملفات الجلسة: للحفاظ على تسجيل دخولك أثناء تصفح المنصة.',
      'ملفات الأمان: لحماية حسابك ومنع الهجمات الإلكترونية.',
      'لا نستخدم ملفات تتبع إعلانية أو ملفات تعريف ارتباط من أطراف ثالثة لأغراض تسويقية.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0F0F12] text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 pt-32 pb-16 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-8"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
              <Shield className="w-7 h-7 text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              سياسة الخصوصية
            </h1>
          </div>
          <p className="text-white/50 text-lg">
            آخر تحديث: {new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Intro */}
      <div className="max-w-4xl mx-auto px-6 mb-12">
        <div className="bg-blue-600/5 border border-blue-600/20 rounded-2xl p-6">
          <p className="text-white/70 leading-[2] text-[1.05rem]">
            في منصة مِراس، نؤمن بأن خصوصية بياناتك حق أساسي. توضح هذه السياسة كيف نجمع ونستخدم ونحمي معلوماتك الشخصية عند استخدامك لخدماتنا. نلتزم بالأنظمة المعمول بها في المملكة العربية السعودية لحماية البيانات الشخصية.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <section
                key={index}
                className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 transition-all duration-500 hover:bg-white/[0.05]"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {index + 1}. {section.title}
                    </h2>
                  </div>
                </div>
                <p className="text-white/60 leading-[2] text-[1.05rem] pr-16 mb-4">
                  {section.content}
                </p>
                {section.list && (
                  <ul className="space-y-3 pr-16">
                    {section.list.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-white/50 text-[0.95rem] leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-2.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        {/* Data Retention & Contact */}
        <div className="mt-12 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">7. الاحتفاظ بالبيانات</h2>
          <p className="text-white/60 leading-[2] text-[1.05rem] mb-8">
            نحتفظ ببياناتك الشخصية طالما أن حسابك نشط أو حسب الحاجة لتقديم خدماتنا. عند حذف حسابك، نقوم بإزالة بياناتك الشخصية خلال فترة معقولة، مع مراعاة أي التزامات قانونية تتطلب الاحتفاظ ببعض البيانات.
          </p>

          <h2 className="text-xl font-bold mb-6">8. التعديلات على هذه السياسة</h2>
          <p className="text-white/60 leading-[2] text-[1.05rem] mb-8">
            قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على المنصة قبل سريان التعديلات.
          </p>

          <h2 className="text-xl font-bold mb-6">9. التواصل معنا</h2>
          <p className="text-white/60 leading-[2] text-[1.05rem]">
            لأي استفسارات تتعلق بخصوصية بياناتك أو لممارسة أي من حقوقك المذكورة أعلاه، يمكنك التواصل معنا عبر البريد الإلكتروني أو من خلال نموذج التواصل المتاح على المنصة.
          </p>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/terms"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/[0.05] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.1] transition-all duration-300 text-sm font-bold"
          >
            <FileText className="w-4 h-4" />
            شروط الاستخدام
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 text-sm font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
