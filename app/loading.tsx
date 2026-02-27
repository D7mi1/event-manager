export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center" dir="rtl">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-white/40 text-sm font-bold">جاري التحميل...</p>
      </div>
    </div>
  );
}
