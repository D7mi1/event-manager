'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpLeft, Calendar, Filter } from 'lucide-react';
import { BlogPost } from './posts'; // تأكد أن الواجهة (interface) مصدرة من ملف posts

export default function BlogList({ posts }: { posts: BlogPost[] }) {
    const categories = ['الكل', 'تقنية', 'حفلات الزفاف', 'إدارة مؤتمرات', 'أمن المعلومات', 'إدارة الحشود', 'رؤية 2030'];
    const [activeCategory, setActiveCategory] = useState('الكل');

    const filteredPosts = activeCategory === 'الكل'
        ? posts
        : posts.filter(post => post.category === activeCategory);

    const featuredPost = filteredPosts.find(p => p.featured) || filteredPosts[0];
    const otherPosts = filteredPosts.filter(p => p.id !== featuredPost?.id);

    return (
        <>
            {/* نظام الفلترة */}
            <div className="flex flex-wrap justify-center gap-3 mt-10 mb-12">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2 rounded-full text-sm font-bold border transition-all duration-300
              ${activeCategory === cat
                                ? 'bg-[#C19D65] text-black border-[#C19D65]'
                                : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:text-white'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* المحتوى */}
            <div className="relative max-w-7xl mx-auto px-6 pb-24">

                {/* حالة عدم وجود مقالات */}
                {filteredPosts.length === 0 && (
                    <div className="text-center py-20 text-white/40">
                        <Filter className="mx-auto mb-4 opacity-50" size={40} />
                        <p>لا توجد مقالات في هذا التصنيف حالياً.</p>
                    </div>
                )}

                {/* المقال المميز */}
                {featuredPost && (
                    <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Link href={`/blog/${featuredPost.slug}`} className="group relative block rounded-[2rem] overflow-hidden border border-white/10 bg-white/[0.02] hover:border-[#C19D65]/30 transition-all duration-500">
                            <div className="grid md:grid-cols-2 gap-0">
                                <div className="relative h-64 md:h-auto overflow-hidden">
                                    <Image src={featuredPost.image} alt={featuredPost.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-transparent to-transparent md:bg-gradient-to-l opacity-80"></div>
                                </div>
                                <div className="p-8 md:p-12 flex flex-col justify-center">
                                    <div className="flex items-center gap-4 text-xs font-bold text-white/40 mb-4">
                                        <span className="bg-white/5 px-3 py-1 rounded-full text-[#C19D65] border border-[#C19D65]/20">{featuredPost.category}</span>
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {featuredPost.date}</span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-tight group-hover:text-[#C19D65] transition-colors">{featuredPost.title}</h3>
                                    <p className="text-white/60 leading-relaxed mb-8 line-clamp-3">{featuredPost.excerpt}</p>
                                    <div className="flex items-center text-sm font-bold text-white group-hover:translate-x-[-10px] transition-transform duration-300">
                                        اقرأ المقال كاملاً <ArrowUpLeft className="mr-2 text-[#C19D65]" size={18} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                )}

                {/* شبكة المقالات */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {otherPosts.map((post) => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden hover:bg-white/[0.04] hover:border-white/20 hover:-translate-y-2 transition-all duration-300">
                            <div className="relative h-56 w-full overflow-hidden">
                                <Image src={post.image} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">{post.category}</div>
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold mb-3 leading-snug group-hover:text-[#C19D65] transition-colors">{post.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed line-clamp-2 mb-6 flex-grow">{post.excerpt}</p>
                                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                                    <span className="text-xs font-bold text-white/40 group-hover:text-white transition-colors">مِراس تِك</span>
                                    <ArrowUpLeft size={16} className="text-[#C19D65] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}