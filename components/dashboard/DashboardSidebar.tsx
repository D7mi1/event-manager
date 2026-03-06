'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
  LayoutDashboard, Calendar, Settings, LogOut,
  Menu, X, Sparkles, ChevronLeft
} from 'lucide-react';
import { toast } from 'sonner';

const navItems = [
  {
    href: '/dashboard',
    label: 'لوحة التحكم',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/dashboard/settings',
    label: 'الإعدادات',
    icon: Settings,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // هل نحن داخل صفحة فعالية فرعية؟
  const eventMatch = pathname.match(/^\/dashboard\/events\/([^/]+)/);
  const isInEventSubpage = eventMatch && !pathname.endsWith('/new');

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch {
      toast.error('حدث خطأ أثناء تسجيل الخروج');
      setLoggingOut(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 px-4 py-5 border-b border-white/5">
        <Sparkles className="w-5 h-5 text-blue-400" />
        <span className="text-lg font-bold text-white">مِراس</span>
      </Link>

      {/* Back to event button (if in sub-page) */}
      {isInEventSubpage && (
        <Link
          href={`/dashboard/events/${eventMatch[1]}`}
          className="flex items-center gap-2 px-4 py-3 mx-3 mt-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          <span>العودة للفعالية</span>
        </Link>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all disabled:opacity-50"
        >
          <LogOut className="w-5 h-5" />
          <span>{loggingOut ? 'جارٍ الخروج...' : 'تسجيل الخروج'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-56 lg:w-64 flex-shrink-0 flex-col bg-[#0A0A0C] border-l border-white/5 fixed top-0 right-0 h-screen z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 right-0 left-0 z-50 bg-[#0A0A0C]/95 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span className="text-lg font-bold text-white">مِراس</span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5"
            aria-label={mobileOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed top-0 right-0 h-full w-64 bg-[#0A0A0C] border-l border-white/5 z-50 animate-in slide-in-from-right duration-200">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
