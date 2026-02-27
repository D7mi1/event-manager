/* eslint-disable */
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
// تأكد أن المسار لملف posts صحيح (قد تحتاج لتعديله حسب مكان الملف عندك)
import { blogPosts } from '../posts';
import { ArrowRight, Calendar, Tag, Clock, CheckCircle2, MessageCircle } from 'lucide-react';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 1. توليد الميتا داتا ديناميكياً لمحركات البحث (SEO)
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

  // البحث عن المقال بناءً على الرابط
  const post = blogPosts.find((p) => p.slug === slug);

  // إذا لم نجد المقال، نحول المستخدم لصفحة 404
  if (!post) {
    notFound();
  }

  // رابط المشاركة عبر واتساب
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(post.title + '\n' + `https://meras.sa/blog/${post.slug}`)}`;

  return (
    <main className="min-h-screen bg-[#0A0A0C] text-white font-sans selection:bg-[#3B82F6] selection:text-black" dir="rtl">
      {/* --- منطقة الهيرو (صورة الغلاف) --- */}
      <div className="relative h-[50vh] md:h-[60vh] w-full group">
        <Image
          src={post.image}
          alt={post.title}
          fill
          priority
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/80 to-transparent" />

        <div className="absolute bottom-0 w-full px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            {/* زر العودة */}
            <Link href="/blog" className="inline-flex items-center text-white/60 hover:text-[#3B82F6] transition-colors mb-8 text-sm font-bold bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:border-[#3B82F6]/50">
              <ArrowRight className="ml-2" size={16} /> العودة للمدونة
            </Link>

            {/* المعلومات الوصفية */}
            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm font-bold text-[#3B82F6] mb-6 animate-in slide-in-from-bottom-4 duration-700">
              <span className="bg-[#3B82F6]/10 px-3 py-1 rounded-full border border-[#3B82F6]/20 flex items-center gap-2">
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
    <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-16 relative">

      {/* العمود الأيمن: نص المقال */}
      <article className="animate-in fade-in duration-1000 delay-300">
        {/* جدول المحتويات (يظهر في الجوال فقط) */}
        {post.tableOfContents && post.tableOfContents.length > 0 && (
          <div className="lg:hidden mb-10 p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h3 className="font-bold text-[#3B82F6] mb-4 text-sm">محتويات المقال</h3>
            <ul className="space-y-3">
              {post.tableOfContents.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="text-white/70 text-sm hover:text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                    {item.title}
                  </a>
                </li>
                ))
  }
  </ul>
    </div>
          )
}

{/* محتوى المقال (Render HTML) */ }
<div 
            className="prose prose-invert prose-lg max-w-none 
prose - headings: font - bold prose - headings: text - white prose - headings: mb - 4 prose - headings: mt - 10 prose - headings: scroll - mt - 24
prose - h3: text - 2xl prose - h3: text - [#3B82F6]
prose - p: text - white / 80 prose - p: leading - relaxed prose - p: text - lg prose - p: mb - 6
prose - a: text - [#3B82F6] prose - a: no - underline hover: prose - a: underline
prose - strong: text - white prose - strong: font - black
prose - ul: list - disc prose - ul: pr - 5 prose - li: text - white / 80 prose - li: mb - 2 prose - li: marker: text - [#3B82F6]
prose - ol: list - decimal prose - ol: pr - 5"
dangerouslySetInnerHTML = {{ __html: post.content || '' }} 
          />

{/* صندوق المشاركة أسفل المقال */ }
<div className="mt-16 p-8 bg-white/5 border border-white/10 rounded-3xl text-center" >
  <h4 className="text-white font-bold mb-2" > أعجبك المقال؟</h4>
    < p className = "text-white/50 text-sm mb-6" > ساهم في نشر المعرفة التقنية.</p>
      < div className = "flex justify-center gap-3" >
        <a href={ shareUrl } target = "_blank" className = "flex items-center gap-2 px-6 py-3 bg-[#25D366]/20 text-[#25D366] rounded-xl font-bold hover:bg-[#25D366]/30 transition-all text-sm" >
          <MessageCircle size={ 18 } /> مشاركة عبر واتساب
            </a>
            </div>
            </div>
            </article>

{/* العمود الأيسر: الشريط الجانبي (مثبت Sticky) */ }
<aside className="hidden lg:block space-y-8 h-fit sticky top-24 animate-in slide-in-from-left-8 duration-1000 delay-500" >

  {/* جدول المحتويات (للشاشات الكبيرة) */ }
{
  post.tableOfContents && post.tableOfContents.length > 0 && (
    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-sm" >
      <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4" > في هذا المقال </h3>
        < ul className = "space-y-1 border-r border-white/10 mr-1 pr-4" >
        {
          post.tableOfContents.map((item) => (
            <li key= { item.id } >
            <a href={`#${item.id}`} className = "block py-2 text-sm text-white/60 hover:text-[#3B82F6] hover:translate-x-[-5px] transition-all" >
              { item.title }
              </a>
              </li>
                  ))
}
</ul>
  </div>
          )}

{/* بطاقة دعوة للتجربة (Call to Action) */ }
<div className="bg-gradient-to-b from-[#3B82F6]/20 to-[#0A0A0C] border border-[#3B82F6]/30 rounded-[2rem] p-8 backdrop-blur-md relative overflow-hidden group shadow-2xl" >
  <div className="absolute top-0 left-0 w-full h-1 bg-[#3B82F6]" > </div>

    < h3 className = "text-xl font-black mb-4 text-white" > ابدأ رحلتك الآن </h3>
      < p className = "text-sm text-white/70 mb-6 leading-relaxed" >
        نظام مِراس هو الحل الأمثل لتطبيق ما قرأته في هذا المقال على أرض الواقع.
            </p>

          < ul className = "space-y-3 mb-8" >
          {
            ['إصدار تذاكر فوري', 'دخول آمن ومشفر', 'لوحة تحكم ذكية'].map((item, i) => (
              <li key= { i } className = "flex items-center gap-2 text-sm text-white/80" >
              <CheckCircle2 size={ 16} className = "text-[#3B82F6]" /> { item }
              </li>
            ))
          }
            </ul>

            < Link href = "/register" className = "block w-full py-4 rounded-xl bg-[#3B82F6] text-black font-black text-center text-lg hover:bg-[#2563EB] transition-all transform group-hover:scale-[1.02]" >
              تجربة مجانية
                </Link>
                </div>

                </aside>

                </div>

{/* زر عائم للمشاركة (يظهر دائماً أسفل الشاشة) */ }
<a 
        href={ shareUrl }
target = "_blank"
rel = "noopener noreferrer"
className = "fixed bottom-6 left-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#128C7E] transition-all hover:scale-110 flex items-center gap-2 group border border-white/10"
title = "شارك عبر واتساب"
  >
  <MessageCircle size={ 24 } />
    </a>

    </main>
  );
}