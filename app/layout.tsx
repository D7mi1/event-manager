import type { Metadata } from "next";
import { Alexandria } from "next/font/google";
import "./globals.css";

const alexandria = Alexandria({ 
  subsets: ["arabic"],
  variable: "--font-alexandria",
  display: "swap",
});

export const metadata: Metadata = {
  title: "مِراس | Meras",
  description: "الجيل الجديد من إدارة المناسبات والأعمال",
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
        {children}
      </body>
    </html>
  );
}