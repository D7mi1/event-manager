import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الأسعار والباقات',
  description:
    'اختر الباقة المناسبة لحجم فعالياتك. باقات شفافة تبدأ مجاناً مع منصة مِراس لتنظيم المناسبات والفعاليات في السعودية.',
  openGraph: {
    title: 'الأسعار والباقات | منصة مِراس',
    description:
      'باقات مرنة تبدأ مجاناً لتنظيم المناسبات والفعاليات. اختر ما يناسبك وابدأ فوراً.',
    url: 'https://merasapp.com/pricing',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
