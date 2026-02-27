import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الأسعار والباقات',
  description:
    'اختر الباقة المناسبة لحجم فعالياتك. باقات شفافة تبدأ مجاناً مع منصة مِراس لإدارة الفعاليات والمؤتمرات في السعودية.',
  openGraph: {
    title: 'الأسعار والباقات | منصة مِراس',
    description:
      'باقات مرنة تبدأ مجاناً لإدارة الفعاليات والمؤتمرات. اختر ما يناسبك وابدأ فوراً.',
    url: 'https://meras.sa/pricing',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
