'use client';

import { WifiOff, RefreshCw, Briefcase } from 'lucide-react';

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[#0F0F12] text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="text-center max-w-md mx-auto">
        {/* الشعار */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="p-2 rounded-xl text-white bg-blue-600 shadow-lg shadow-blue-600/20">
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">مِـراس</span>
        </div>

        {/* الأيقونة */}
        <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
          <WifiOff className="w-12 h-12 text-white/40" />
        </div>

        <h1 className="text-3xl font-black mb-4">
          لا يوجد اتصال بالإنترنت
        </h1>

        <p className="text-white/50 mb-8 leading-relaxed">
          يبدو أنك غير متصل بالإنترنت. تحقق من اتصالك وحاول مرة أخرى.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            إعادة المحاولة
          </button>

          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <p className="text-xs text-white/30 leading-relaxed">
              💡 <strong className="text-white/50">ملاحظة:</strong> ماسح التذاكر يعمل بدون إنترنت إذا كنت قد فتحته مسبقاً. ستتم مزامنة البيانات تلقائياً عند عودة الاتصال.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
