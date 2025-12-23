import Link from 'next/link';
import { PartyPopper, LogOut } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between mx-auto max-w-7xl">
        {/* اللوجو واسم الموقع */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <PartyPopper size={24} />
          </div>
          <span className="text-xl font-bold text-gray-800">
            مدير الدعوات
          </span>
        </Link>

        {/* أزرار الجهة اليسرى */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden sm:block">
            مرحباً، المدير
          </span>
          <button className="flex items-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition">
            <LogOut size={18} />
            <span>خروج</span>
          </button>
        </div>
      </div>
    </nav>
  );
}