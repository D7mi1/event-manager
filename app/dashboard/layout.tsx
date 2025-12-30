// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="min-h-screen bg-[#0A0A0C]">
      {/* هذا الملف يضمن أن صفحة الداشبورد لا ترث أي شريط جانبي من الملفات العليا */}
      {children}
    </section>
  );
}