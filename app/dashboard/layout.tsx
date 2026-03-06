// app/dashboard/layout.tsx
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-[#0A0A0C]">
      <DashboardSidebar />
      {/* المحتوى الرئيسي - يترك مسافة للـ sidebar على الديسكتوب وللـ header على الموبايل */}
      <main className="md:mr-56 lg:mr-64 pt-14 md:pt-0 min-h-screen">
        {children}
      </main>
    </section>
  );
}
