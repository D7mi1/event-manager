'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // إغلاق القائمة عند تغيير الصفحة
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // تأثير الشفافية عند التمرير
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // منع التمرير عند فتح القائمة
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: '/wedding', label: 'حفلات الزفاف', highlight: true },
    { href: '/pricing', label: 'الأسعار', highlight: false },
    { href: '/about', label: 'من نحن', highlight: false },
    { href: '/contact', label: 'تواصل معنا', highlight: false },
    { href: '/blog', label: 'المدونة', highlight: false },
  ];

  return (
    <>
      <nav
        aria-label="القائمة الرئيسية"
        className={`fixed top-0 w-full z-50 border-b transition-all duration-500 h-20 flex items-center ${
          scrolled
            ? 'bg-[#0F0F12]/95 backdrop-blur-xl border-white/[0.08] shadow-lg shadow-black/20'
            : 'bg-[#0F0F12]/80 backdrop-blur-xl border-white/[0.04]'
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">

          {/* الشعار */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl text-white shadow-lg transition-all duration-500 bg-blue-600 shadow-blue-600/20 group-hover:shadow-blue-600/40">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">مِـراس</span>
          </Link>

          {/* الروابط - سطح المكتب */}
          <div className="hidden md:flex gap-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-bold transition-colors ${
                  pathname === link.href
                    ? link.highlight ? 'text-[#C19D65]' : 'text-blue-400'
                    : link.highlight ? 'text-[#C19D65]/70 hover:text-[#C19D65]' : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="w-px h-6 bg-white/10" />

            <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
              تسجيل دخول
            </Link>

            <Link href="/login" className="text-sm font-bold px-6 py-3 rounded-full transition-all duration-300 text-white bg-blue-600 hover:bg-blue-700 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]">
              ابدأ الآن
            </Link>
          </div>

          {/* زر القائمة - الجوال */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </nav>

      {/* Backdrop overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* قائمة الجوال */}
      <div
        className={`md:hidden fixed top-20 left-0 right-0 z-50 bg-[#0F0F12] border-b border-white/10 transition-all duration-300 ${
          mobileMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
        role="menu"
      >
        <div className="container mx-auto px-6 py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              className={`block w-full py-4 transition-colors text-sm font-bold border-b border-white/5 ${
                pathname === link.href
                  ? link.highlight ? 'text-[#C19D65]' : 'text-blue-400'
                  : link.highlight ? 'text-[#C19D65]/70 hover:text-[#C19D65]' : 'text-white/60 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/login"
            role="menuitem"
            className="block w-full py-4 text-white/60 hover:text-white transition-colors text-sm font-bold border-b border-white/5"
          >
            تسجيل دخول
          </Link>

          <div className="py-4">
            <Link
              href="/login"
              role="menuitem"
              className="block w-full text-center text-sm font-bold px-6 py-4 rounded-2xl transition-all duration-300 text-white bg-blue-600 hover:bg-blue-700 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              ابدأ الآن
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
