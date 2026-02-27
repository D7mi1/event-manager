import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogPosts } from '../posts';
import { ArrowRight, Calendar, Tag, Clock, MessageCircle } from 'lucide-react'; // تأكد من الاستيرادات
import { Metadata } from 'next';
import BlogCTA from './BlogCTA'; // 👈 استيراد المكون الجديد

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);
    if (!post) return {};
    return {
        title: `${post.title} | مدونة مِراس`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: [post.image],
            type: 'article',
        },
    };
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) notFound();

    const shareUrl = `https://wa.me/?text=${encodeURIComponent(post.title + '\n' + `https://meras.sa/blog/${post.slug}`)}`;

    return (
        <main className="min-h-screen bg-[#0A0A0C] text-white font-sans selection:bg-[#C19D65] selection:text-black" dir="rtl">

            {/* --- منطقة الهيرو (صورة الغلاف) --- */}
            <div className="relative h-[50vh] md:h-[60vh] w-full group">
                <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    priority
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/80 to-transparent"></div>

                <div className="absolute bottom-0 w-full px-6 pb-12">
                    <div className="max-w-4xl mx-auto">
                        <Link href="/blog" className="inline-flex items-center text-white/60 hover:text-[#C19D65] transition-colors mb-8 text-sm font-bold bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:border-[#C19D65]/50">
                            <ArrowRight className="ml-2" size={16} /> العودة للمدونة
                        </Link>

                        <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm font-bold text-[#C19D65] mb-6 animate-in slide-in-from-bottom-4 duration-700">
                            <span className="bg-[#C19D65]/10 px-3 py-1 rounded-full border border-[#C19D65]/20 flex items-center gap-2">
                                <Tag size={14} /> {post.category}
                            </span>
                            <span className="text-white/60 flex items-center gap-2">
                                <Calendar size={14} /> {post.date}
                            </span>
                            <span className="text-white/60 flex items-center gap-2">
                                <Clock size={14} /> {post.readTime}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black leading-tight text-white mb-4 drop-shadow-2xl animate-in slide-in-from-bottom-6 duration-1000 delay-100">
                            {post.title}
                        </h1>
                    </div>
                </div>
            </div>

            {/* --- منطقة المحتوى --- */}
            <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-20 relative">

                {/* العمود الأيمن: المقال */}
                <article className="animate-in fade-in duration-1000 delay-300">

                    {/* جدول المحتويات (للجوال فقط) */}
                    {post.tableOfContents && post.tableOfContents.length > 0 && (
                        <div className="lg:hidden mb-12 p-6 bg-white/[0.03] border border-white/10 rounded-2xl">
                            <h3 className="font-bold text-[#C19D65] mb-4 text-sm uppercase tracking-widest">فهرس المحتوى</h3>
                            <ul className="space-y-4">
                                {post.tableOfContents.map((item) => (
                                    <li key={item.id}>
                                        <a href={`#${item.id}`} className="text-white/70 text-sm hover:text-white flex items-center gap-2 transition-colors">
                                            <span className="w-1.5 h-1.5 bg-[#C19D65] rounded-full"></span> {item.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* محتوى المقال */}
                    <div
                        className="prose prose-invert prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.content || '' }}
                    />

                    {/* 🔥 هنا الإضافة: بطاقة CTA تظهر في الجوال فقط (أو دائماً أسفل المقال) */}
                    <div className="mt-16 lg:hidden">
                        <BlogCTA />
                    </div>

                    {/* صندوق "هل استفدت؟" */}
                    <div className="mt-20 p-10 bg-white/[0.02] border border-white/10 rounded-3xl text-center backdrop-blur-sm">
                        <h4 className="text-white text-xl font-bold mb-3">هل استفدت من هذا المحتوى؟</h4>
                        <p className="text-white/50 text-base mb-8">شاركه مع فريق عملك أو المهتمين بقطاع الفعاليات.</p>
                        <div className="flex justify-center">
                            <a href={shareUrl} target="_blank" className="flex items-center gap-3 px-8 py-4 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#128C7E] transition-all transform hover:-translate-y-1 shadow-lg shadow-[#25D366]/20">
                                <MessageCircle size={20} /> مشاركة عبر واتساب
                            </a>
                        </div>
                    </div>
                </article>

                {/* العمود الأيسر: الشريط الجانبي (يختفي في الجوال) */}
                <aside className="hidden lg:block space-y-10 h-fit sticky top-32 animate-in slide-in-from-left-8 duration-1000 delay-500">

                    {/* جدول المحتويات (Desktop) */}
                    {post.tableOfContents && post.tableOfContents.length > 0 && (
                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                            <h3 className="text-xs font-bold text-[#C19D65] uppercase tracking-[0.2em] mb-6">في هذا المقال</h3>
                            <ul className="space-y-4 border-r-2 border-white/5 mr-1 pr-6 relative">
                                {post.tableOfContents.map((item) => (
                                    <li key={item.id}>
                                        <a href={`#${item.id}`} className="block text-sm text-gray-400 hover:text-white hover:translate-x-[-5px] transition-all duration-300">
                                            {item.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* 🔥 بطاقة CTA (تظهر فقط في الديسك توب) */}
                    <BlogCTA />

                </aside>

            </div>

            {/* زر المشاركة العائم */}
            <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-8 left-8 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#128C7E] transition-all hover:scale-110 flex items-center gap-2 group border border-white/10"
            >
                <MessageCircle size={28} />
            </a>

        </main>
    );
}