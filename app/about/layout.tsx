import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "من نحن | مِراس - رواد تنظيم الفعاليات في السعودية",
    description: "نحن في مِراس، نؤمن بأن كل فعالية هي قصة تروى بدقة. انطلقنا من المملكة العربية السعودية لنقدم حلولاً تقنية متكاملة لإدارة الفعاليات، متوافقين مع رؤية 2030.",
    openGraph: {
        title: "من نحن | مِراس (Meras)",
        description: "تعرف على مِراس، المنصة السعودية الرائدة في دمج الأصالة بالابتكار التقني لتنظيم الفعاليات والمؤتمرات.",
    }
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
