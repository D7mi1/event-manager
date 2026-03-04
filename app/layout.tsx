import type { Metadata } from "next";
import { Alexandria } from "next/font/google";
import "./globals.css";
import { validateEnvironment } from "@/lib/env-validation";
import { AppProviders } from "@/lib/providers/app-providers";
import Analytics from "@/components/layout/Analytics";
import LiveChat from "@/components/layout/LiveChat";

// ✅ التحقق من متغيرات البيئة عند بدء التطبيق
validateEnvironment();

const alexandria = Alexandria({
  subsets: ["arabic"],
  variable: "--font-alexandria",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "مِراس | نظام إدارة بروتوكول الفعاليات والدخول الذكي",
    template: "%s | منصة مِراس"
  },
  description: "الخيار الأول للجهات الحكومية والخاصة في السعودية لإدارة الحشود، إصدار البطاقات الرقمية، وتنظيم بروتوكول الاستقبال بتقنيات الذكاء الاصطناعي.",
  keywords: ["تنظيم مؤتمرات", "دخول ذكي", "باركود فعاليات", "نظام RSVP سعودي", "إدارة حشود", "منصة تذاكر", "تنظيم فعاليات السعودية", "تنظيم حفلات زفاف", "دعوات زفاف رقمية", "باركود زواج", "تذاكر زواج إلكترونية", "تنظيم زواج السعودية", "بطاقات دعوة إلكترونية"],
  alternates: {
    canonical: "https://merasapp.com",
    languages: {
      'ar-SA': 'https://merasapp.com',
    },
  },
  // Open Graph - للمشاركة في وسائل التواصل
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://merasapp.com',
    siteName: 'مِراس',
    title: 'مِراس | نظام إدارة بروتوكول الفعاليات والدخول الذكي',
    description: 'الخيار الأول للجهات الحكومية والخاصة في السعودية لإدارة الحشود، إصدار البطاقات الرقمية، وتنظيم بروتوكول الاستقبال.',
    images: [
      {
        url: 'https://merasapp.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'منصة مِراس لتنظيم الفعاليات',
      },
    ],
  },
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'مِراس | نظام إدارة بروتوكول الفعاليات والدخول الذكي',
    description: 'الخيار الأول للجهات الحكومية والخاصة في السعودية لإدارة الحشود وإصدار البطاقات الرقمية.',
    images: ['https://merasapp.com/og-image.png'],
  },
  metadataBase: new URL('https://merasapp.com'),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "مِراس (Meras)",
      "url": "https://merasapp.com",
      "logo": "https://merasapp.com/logo.png",
      "description": "منصة سعودية رائدة في تنظيم الفعاليات وإدارة الحضور الرقمي.",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Riyadh",
        "addressCountry": "SA"
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": "Meras Event Manager",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web, iOS, Android",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "SAR"
      },
      "featureList": "Ticket issuance, QR Code scanning, Guest management, WhatsApp integration"
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "هل يوفر التطبيق نظام باركود لتذاكر الزواج والفعاليات؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "نعم، نوفر نظاماً ذكياً لإصدار ومسح تذاكر الزواج، المؤتمرات، وورش العمل لضمان دخول سلس ومُنظم عبر الباركود."
          }
        },
        {
          "@type": "Question",
          "name": "كيف يمكنني استخدام منصة الحضور لإدارة ورش العمل والمؤتمرات؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "عبر لوحة تحكم متكاملة تتيح لك بيع أو توزيع التذاكر، وتتبع الحضور لحظة بلحظة، وتصدير تقارير مفصلة للمنظمين."
          }
        },
        {
          "@type": "Question",
          "name": "هل تدعم المنصة بيع التذاكر للحفلات؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "بالتأكيد، مِراس هي منصة تذاكر متكاملة تدعم بيع التذاكر وإدارة المقاعد للحفلات والفعاليات الترفيهية."
          }
        },
        {
          "@type": "Question",
          "name": "كيف أنظم حفل زفافي باستخدام مِراس؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "اختر باقة الزفاف المناسبة (تبدأ من 149 ريال)، أضف قائمة الضيوف، وأرسل الدعوات الرقمية عبر واتساب. يوم الحفل، استخدم الماسح الذكي لتسجيل الحضور."
          }
        },
        {
          "@type": "Question",
          "name": "هل يمكن إرسال دعوات الزواج عبر الواتساب؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "نعم، مِراس توفر إرسال دعوات زواج رقمية مصممة باحترافية عبر واتساب مع باركود خاص لكل ضيف لتسجيل الحضور."
          }
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${alexandria.variable} bg-background text-white antialiased`}>
        {/* Noise overlay for texture */}
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 bg-noise mix-blend-overlay"></div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Analytics />
        <LiveChat />
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}