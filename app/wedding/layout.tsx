import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'باقات حفلات الزفاف | مِراس',
  description:
    'باقات متكاملة لحفلات الزفاف في السعودية — دعوات رقمية احترافية، تتبع حضور لحظي عبر QR، تصاميم ذهبية فاخرة، ورسائل واتساب. تبدأ من 149 ريال.',
  keywords: [
    'حفل زفاف',
    'دعوات زفاف رقمية',
    'تنظيم حفل زفاف',
    'دعوات الكترونية زفاف',
    'باقات زفاف السعودية',
    'تتبع حضور زفاف',
    'QR كود زفاف',
    'مِراس زفاف',
  ],
  openGraph: {
    title: 'باقات حفلات الزفاف | مِراس',
    description:
      'نظّم حفل زفافك بكل سهولة — دعوات رقمية، تتبع حضور، تصاميم ذهبية احترافية.',
    url: 'https://merasapp.com/wedding',
    locale: 'ar_SA',
    type: 'website',
  },
};

export default function WeddingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
