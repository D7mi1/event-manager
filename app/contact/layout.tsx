import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "تواصل معنا | مِراس - منصة إدارة الفعاليات",
    description: "تواصل مع فريق مِراس للاستفسارات، الدعم الفني، أو الشراكات. نحن جاهزون لمساعدتك في تنظيم فعالياتك باحترافية.",
    openGraph: {
        title: "تواصل معنا | مِراس (Meras)",
        description: "فريقنا جاهز لمساعدتك. أرسل رسالتك وسنرد عليك خلال 24 ساعة عمل.",
    },
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
