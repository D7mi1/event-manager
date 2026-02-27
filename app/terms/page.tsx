import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FileText, Shield, Users, AlertTriangle, Scale, RefreshCw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'شروط الاستخدام | مِراس',
  description: 'شروط وأحكام استخدام منصة مِراس لتنظيم الفعاليات والمؤتمرات.',
};

const sections = [
  {
    icon: FileText,
    title: 'القبول بالشروط',
    content: `باستخدامك لمنصة مِراس، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة. نحتفظ بالحق في تعديل هذه الشروط في أي وقت، وسنقوم بإشعارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار على المنصة.`,
  },
  {
    icon: Users,
    title: 'وصف الخدمة',
    content: `مِراس هي منصة إلكترونية لإدارة وتنظيم الفعاليات والمؤتمرات، تتيح لك إنشاء الفعاليات، إدارة قوائم الحضور، إرسال الدعوات والتذاكر الإلكترونية، وتنظيم ترتيبات الجلوس. تشمل الخدمة أيضاً أدوات الذكاء الاصطناعي لتوليد المحتوى والتصاميم، وخدمات التواصل عبر الواتساب والبريد الإلكتروني.`,
  },
  {
    icon: Shield,
    title: 'حسابات المستخدمين',
    content: `عند إنشاء حساب في مِراس، تتعهد بتقديم معلومات صحيحة ودقيقة وحديثة. أنت مسؤول عن الحفاظ على سرية بيانات حسابك وكلمة المرور الخاصة بك. يجب إخطارنا فوراً في حال اكتشافك أي استخدام غير مصرح به لحسابك. لا يجوز لك مشاركة حسابك مع أطراف ثالثة أو استخدام حسابات الآخرين.`,
  },
  {
    icon: AlertTriangle,
    title: 'الاستخدام المقبول',
    content: `تتعهد بعدم استخدام المنصة في أي نشاط مخالف للأنظمة المعمول بها في المملكة العربية السعودية. يُحظر استخدام المنصة لإرسال رسائل مزعجة أو غير مرغوب فيها، أو محاولة الوصول غير المصرح به إلى أنظمتنا، أو انتهاك حقوق الملكية الفكرية للآخرين، أو نشر محتوى مسيء أو غير لائق، أو استخدام أدوات الذكاء الاصطناعي لتوليد محتوى ضار أو مخالف.`,
  },
  {
    icon: Scale,
    title: 'حدود المسؤولية',
    content: `تُقدَّم منصة مِراس "كما هي" دون أي ضمانات صريحة أو ضمنية. لا نتحمل المسؤولية عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام المنصة أو عدم القدرة على استخدامها. نبذل قصارى جهدنا لضمان استمرارية الخدمة، لكننا لا نضمن عدم حدوث انقطاعات فنية مؤقتة. تقع مسؤولية المحتوى المنشور عبر المنصة على المستخدم وحده.`,
  },
  {
    icon: RefreshCw,
    title: 'الإنهاء والإلغاء',
    content: `يحق لك إلغاء حسابك في أي وقت من خلال إعدادات الحساب. نحتفظ بالحق في تعليق أو إنهاء حسابك في حالة مخالفة هذه الشروط. عند إلغاء الحساب، قد يتم حذف بياناتك وفقاً لسياسة الخصوصية الخاصة بنا. الفعاليات النشطة والتذاكر المُصدرة قد تبقى متاحة حتى انتهاء الفعالية لضمان حقوق الحضور المسجلين.`,
  },
];

export default function TermsPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            شروط الاستخدام
          </h1>
          <p className="text-white/50 text-lg">
            آخر تحديث: {new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
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
                <p className="text-white/60 leading-[2] text-[1.05rem] pr-16">
                  {section.content}
                </p>
              </section>
            );
          })}
        </div>

        {/* Additional Terms */}
        <div className="mt-12 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">7. القانون الحاكم</h2>
          <p className="text-white/60 leading-[2] text-[1.05rem] mb-6">
            تخضع هذه الشروط وتُفسَّر وفقاً لأنظمة وقوانين المملكة العربية السعودية. أي نزاع ينشأ عن استخدام المنصة أو يتعلق بهذه الشروط يخضع للاختصاص القضائي للمحاكم المختصة في المملكة العربية السعودية.
          </p>

          <h2 className="text-xl font-bold mb-6">8. التواصل معنا</h2>
          <p className="text-white/60 leading-[2] text-[1.05rem]">
            إذا كانت لديك أي أسئلة أو استفسارات حول شروط الاستخدام، يمكنك التواصل معنا عبر البريد الإلكتروني أو من خلال نموذج التواصل المتاح على المنصة.
          </p>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/privacy"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/[0.05] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.1] transition-all duration-300 text-sm font-bold"
          >
            <Shield className="w-4 h-4" />
            سياسة الخصوصية
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
