'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail, Phone, MapPin, Send,
  MessageCircle, Clock, CheckCircle2, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const subjects = [
    { value: 'general', label: 'استفسار عام' },
    { value: 'sales', label: 'المبيعات والاشتراكات' },
    { value: 'support', label: 'الدعم الفني' },
    { value: 'enterprise', label: 'باقة المؤسسات' },
    { value: 'partnership', label: 'شراكات وتعاون' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.warning('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    setSending(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'فشل الإرسال');
      }

      setSent(true);
      toast.success('تم إرسال رسالتك بنجاح! سنرد عليك خلال 24 ساعة.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الإرسال. حاول مرة أخرى.');
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0F0F12] text-white relative overflow-hidden" dir="rtl">
      {/* خلفية */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" aria-hidden="true" />

      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20 relative z-10">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block py-1.5 px-4 rounded-full bg-blue-600/10 text-blue-400 text-xs font-bold mb-6 border border-blue-500/20">
            <MessageCircle size={12} className="inline ml-1" />
            تواصل معنا
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            كيف نقدر <span className="text-blue-500">نساعدك</span>؟
          </h1>
          <p className="text-white/50 max-w-lg mx-auto">
            فريقنا جاهز لمساعدتك. أرسل رسالتك وسنرد عليك بأسرع وقت.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* معلومات التواصل */}
          <div className="space-y-6">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.05] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mb-4">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-bold mb-1">البريد الإلكتروني</h3>
              <a href="mailto:hello@merasapp.com" className="text-white/50 text-sm hover:text-blue-400 transition-colors" dir="ltr">
                hello@merasapp.com
              </a>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.05] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-green-600/10 border border-green-600/20 flex items-center justify-center mb-4">
                <Phone className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-bold mb-1">واتساب</h3>
              <a href="https://wa.me/966550000000" className="text-white/50 text-sm hover:text-green-400 transition-colors" dir="ltr">
                +966 55 000 0000
              </a>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.05] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#C19D65]/10 border border-[#C19D65]/20 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5 text-[#C19D65]" />
              </div>
              <h3 className="font-bold mb-1">الموقع</h3>
              <p className="text-white/50 text-sm">المملكة العربية السعودية</p>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.05] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-600/20 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-bold mb-1">أوقات العمل</h3>
              <p className="text-white/50 text-sm">الأحد - الخميس: 9 ص - 6 م</p>
              <p className="text-white/30 text-xs mt-1">نرد على الرسائل خلال 24 ساعة</p>
            </div>
          </div>

          {/* نموذج التواصل */}
          <div className="lg:col-span-2">
            {sent ? (
              <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-2xl font-black mb-3">تم الإرسال بنجاح!</h2>
                <p className="text-white/50 mb-8 max-w-md">
                  شكراً لتواصلك معنا. سيقوم فريقنا بالرد على رسالتك خلال 24 ساعة عمل.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => { setSent(false); setFormData({ name: '', email: '', subject: 'general', message: '' }); }}
                    className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 font-bold hover:bg-white/10 transition-colors text-sm"
                  >
                    إرسال رسالة أخرى
                  </button>
                  <Link
                    href="/"
                    className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors text-sm"
                  >
                    العودة للرئيسية
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-8">
                <h2 className="text-xl font-bold mb-6">أرسل لنا رسالة</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="contact-name" className="text-xs font-bold text-white/50 block mb-2">
                      الاسم <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      aria-required="true"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 transition-colors text-sm"
                      placeholder="اسمك الكامل"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="text-xs font-bold text-white/50 block mb-2">
                      البريد الإلكتروني <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      aria-required="true"
                      dir="ltr"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 transition-colors text-sm text-left"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="contact-subject" className="text-xs font-bold text-white/50 block mb-2">
                    الموضوع
                  </label>
                  <select
                    id="contact-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 transition-colors text-sm appearance-none"
                  >
                    {subjects.map(s => (
                      <option key={s.value} value={s.value} className="bg-[#0F0F12]">{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label htmlFor="contact-message" className="text-xs font-bold text-white/50 block mb-2">
                    الرسالة <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    required
                    aria-required="true"
                    rows={6}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 transition-colors text-sm resize-none"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {sending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
