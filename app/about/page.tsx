'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { supabase } from '@/lib/supabase/client';
import { Building2, Users, Trophy, Target } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
    const [eventCount, setEventCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch dynamic stats for Social Proof
    useEffect(() => {
        const fetchStats = async () => {
            // Get count of all events (this is just an approximation for social proof)
            const { count, error } = await supabase
                .from('events')
                .select('*', { count: 'exact', head: true });

            if (!error && count !== null) {
                setEventCount(count);
            }
            setLoading(false);
        };

        fetchStats();
    }, []);

    // Format number (e.g., 50+)
    const displayCount = eventCount ? (eventCount > 50 ? `+${eventCount}` : eventCount) : '+100';

    return (
        <main className="min-h-screen bg-[#0F0F12] text-white relative overflow-hidden" dir="rtl">

            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" aria-hidden="true"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" aria-hidden="true"></div>

            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">

                {/* Header Section */}
                <section className="text-center mb-20 animate-in fade-in slide-in-from-bottom duration-1000">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-600/10 text-blue-500 text-sm font-bold mb-6 border border-blue-500/20">
                        من نحن
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                        مِـراس.. المنصة الأولى <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-300">لتنظيم الفعاليات والمناسبات</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
                        نقدم حلاً تقنياً متكاملاً لتنظيم حفلات الزفاف والتخرّج والمؤتمرات والمعارض بأعلى معايير الاحترافية والأمان.
                    </p>
                </section>

                {/* Main Content & Story */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">

                    {/* Right: Text Content */}
                    <section className="space-y-8">
                        <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/[0.05] transition-colors">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <Target className="text-blue-500" />
                                رؤيتنا
                            </h2>
                            <p className="text-white/70 leading-relaxed text-justify">
                                نحن في <strong>مِراس</strong>، نؤمن بأن كل فعالية هي قصة تستحق أن تُروى بدقة واحترافية. انطلقنا من قلب المملكة العربية السعودية لنقدم حلاً تقنياً متكاملاً لإدارة وتنظيم الفعاليات، مدمجين خبراتنا في الإدارة اللوجستية مع أحدث تقنيات البرمجة والذكاء الاصطناعي.
                            </p>
                        </div>

                        <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/[0.05] transition-colors">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <Users className="text-blue-500" />
                                مهمتنا
                            </h2>
                            <p className="text-white/70 leading-relaxed text-justify">
                                نركز على تمكين الأفراد والشركات من تنظيم مناسباتهم وفعالياتهم بكفاءة عالية — من حفلات الزفاف والتخرّج إلى المؤتمرات والمعارض — عبر أدوات تسجيل ذكية، إدارة حضور سلسة، وتحليلات بيانات دقيقة.
                            </p>
                        </div>
                    </section>

                    {/* Left: Visuals & Stats */}
                    <div className="relative">
                        {/* Stats Card - Dynamic */}
                        <div className="absolute -top-10 -left-10 z-20 bg-gradient-to-br from-[#3B82F6] to-[#8E7040] p-8 rounded-[2rem] shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
                            <div className="text-5xl font-black text-black mb-2 flex items-baseline gap-1">
                                {loading ? <span className="animate-pulse">...</span> : displayCount}
                                <span className="text-lg opacity-60">فعالية</span>
                            </div>
                            <p className="text-black/80 font-bold text-sm">تم تنظيمها عبر منصتنا <br />بنجاح ولله الحمد.</p>
                        </div>

                        {/* Image Placeholder / Graphic */}
                        <div className="w-full aspect-square rounded-[3rem] overflow-hidden border border-white/10 relative group">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                            {/* Abstract tech visualization */}
                            <div className="w-full h-full bg-[#1A1A1E] flex items-center justify-center relative">
                                <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                                <div className="w-32 h-32 border-4 border-blue-500 rounded-full flex items-center justify-center animate-pulse">
                                    <Trophy size={64} className="text-blue-500" />
                                </div>
                            </div>

                            <div className="absolute bottom-8 right-8 z-20">
                                <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Vision 2030 Compatible</p>
                                <p className="text-white font-bold text-xl">متوافقون مع تطلعات <br />الرؤية السعودية</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* قيمنا الأساسية */}
                <section className="mb-32">
                    <h2 className="text-3xl font-bold text-center mb-12">قيمنا الأساسية</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: '🔒', title: 'الأمان أولاً', desc: 'حماية بيانات ضيوفك وفعالياتك بأعلى معايير التشفير والأمان' },
                            { icon: '⚡', title: 'السرعة والأداء', desc: 'منصة سريعة الاستجابة تعمل بسلاسة حتى مع آلاف الضيوف' },
                            { icon: '🎨', title: 'تجربة مستخدم راقية', desc: 'واجهة أنيقة وبسيطة مصممة للمنظم العربي' },
                            { icon: '🤝', title: 'دعم مستمر', desc: 'فريق دعم فني متاح لمساعدتك في كل خطوة' },
                        ].map((value, i) => (
                            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-center hover:bg-white/[0.05] transition-colors">
                                <div className="text-4xl mb-4" aria-hidden="true">{value.icon}</div>
                                <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Commitment Section (Footer-like) */}
                <section className="text-center max-w-3xl mx-auto bg-gradient-to-b from-white/[0.05] to-transparent p-12 rounded-[3rem] border border-white/5">
                    <Building2 size={48} className="mx-auto text-white/20 mb-6" aria-hidden="true" />
                    <p className="text-xl text-white/80 font-medium leading-relaxed mb-8">
                        التزامنا هو تقديم تجربة مستخدم سريعة، آمنة، ومتوافقة مع تطلعات رؤية السعودية 2030 في التحول الرقمي لقطاع الفعاليات.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/dashboard" className="inline-flex items-center justify-center py-4 px-8 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors">
                            ابدأ رحلتك معنا
                        </Link>
                        <Link href="/pricing" className="inline-flex items-center justify-center py-4 px-8 rounded-xl bg-white/5 border border-white/10 text-white/70 font-bold hover:bg-white/10 transition-colors">
                            تعرف على الباقات
                        </Link>
                    </div>
                </section>

            </div>
        </main>
    );
}
