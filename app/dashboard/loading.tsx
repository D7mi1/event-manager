export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white p-6 pt-24 pb-20 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 w-64 bg-white/5 rounded-xl" />
          <div className="h-10 w-32 bg-white/5 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white/5 rounded-[2rem]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-64 bg-white/5 rounded-[2.5rem]" />
          <div className="h-64 bg-white/5 rounded-[2.5rem]" />
        </div>
      </div>
    </div>
  );
}
