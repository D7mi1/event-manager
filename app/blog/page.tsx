import Link from 'next/link';
import { blogPosts } from './posts';
import BlogList from './BlogList'; // استيراد المكون التفاعلي
import { ArrowUpLeft } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'مدونة مِراس | نصائح وأفكار لتنظيم المناسبات والفعاليات',
    description: 'مقالات متخصصة في تنظيم حفلات الزفاف، المؤتمرات، والفعاليات. نصائح عملية، تقنيات حديثة، وأفكار ملهمة للمنظمين.',
};

export default function BlogIndex() {
    return (
        <div className="min-h-screen bg-[#0A0A0C] text-white font-sans selection:bg-[#C19D65] selection:text-black" dir="rtl">

            {/* خلفية جمالية */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#C19D65] blur-[150px] opacity-[0.08] pointer-events-none"></div>

            {/* الرأس (Header) */}
            <div className="relative pt-24 pb-8 px-6 max-w-7xl mx-auto text-center">
                <Link href="/" className="absolute top-10 right-6 md:right-0 text-white/40 hover:text-white flex items-center gap-2 transition-colors text-sm font-bold">
                    الرئيسية <ArrowUpLeft className="rotate-45" size={16} />
                </Link>

                <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                    مدونة <span className="text-[#C19D65]">مِراس</span>
                </h1>
                <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                    نصائح وأفكار لتنظيم حفلات الزفاف والتخرّج والمؤتمرات والمعارض. كل ما يحتاجه المنظم السعودي في مكان واحد.
                </p>
            </div>

            {/* استدعاء قائمة المقالات (الجزء التفاعلي) */}
            <BlogList posts={blogPosts} />

        </div>
    );
}