'use client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function StickyCTA() {
  return (
    <div className="fixed bottom-8 left-6 right-6 z-50 md:hidden">
      <Link href="/login" className="w-full py-4 rounded-2xl font-bold text-white shadow-2xl flex items-center justify-center gap-3 transition-transform active:scale-95 bg-blue-600">
        <span>ابدأ تنظيم فعاليتك</span>
        <ArrowLeft size={20} />
      </Link>
    </div>
  );
}
