import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center p-6 relative overflow-hidden"
      dir="rtl"
    >
      {/* التوهج الخلفي */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] opacity-10 bg-blue-600 pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* الرقم 404 */}
        <div className="relative mb-8">
          <span aria-hidden="true" className="text-[10rem] md:text-[14rem] font-black leading-none text-white/[0.03] select-none block">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div role="img" aria-label="صفحة غير موجودة" className="w-24 h-24 rounded-3xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
              <Search className="w-12 h-12 text-blue-400" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* النص */}
        <h1 className="text-3xl font-black mb-4">
          الصفحة غير موجودة
        </h1>
        <p className="text-white/40 text-sm leading-relaxed mb-10 max-w-md mx-auto">
          يبدو أن الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          تأكد من صحة الرابط أو عُد للصفحة الرئيسية.
        </p>

        {/* الأزرار */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-all duration-300 shadow-[0_15px_30px_rgba(37,99,235,0.2)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-5 h-5" />
            الصفحة الرئيسية
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/[0.05] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.1] font-bold transition-all duration-300"
          >
            لوحة التحكم
          </Link>
        </div>
      </div>
    </div>
  );
}
