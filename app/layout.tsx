import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar"; // استدعاء قطعة الناف بار

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "نظام إدارة الفعاليات",
  description: "نظام ذكي لإدارة الدعوات عبر الواتساب",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl"> 
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {/* وضعنا الناف بار هنا ليظهر في كل مكان */}
        <Navbar />
        
        {/* هذا هو محتوى الصفحة المتغير */}
        <main className="max-w-7xl mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  );
}