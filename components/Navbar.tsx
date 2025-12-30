import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Navbar({ isWedding }: { isWedding: boolean }) {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/[0.08] bg-[#0F0F12]/80 backdrop-blur-xl h-20 flex items-center transition-all duration-500">
      <div className="container mx-auto px-6 flex justify-between items-center">
        
        {/* الشعار - يتغير بين الذهبي والأزرق */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className={`p-2 rounded-xl text-white shadow-lg transition-all duration-500 ${
            isWedding 
              ? 'bg-[#C19D65] shadow-[#C19D65]/20' 
              : 'bg-blue-600 shadow-blue-600/20'
          }`}>
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">مِـراس</span>
        </Link>

        {/* الروابط والأزرار */}
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
            تسجيل دخول
          </Link>
          
          {/* زر ابدأ الآن - ذهبي في الأفراح وأزرق في الأعمال */}
          <Link href="/dashboard" className={`text-sm font-bold px-6 py-3 rounded-full transition-all duration-500 text-white ${
            isWedding 
              ? 'bg-[#C19D65] hover:bg-[#A4824E] shadow-[0_0_20px_rgba(193,157,101,0.3)]' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_20px_rgba(37,99,235,0.3)]'
          }`}>
            ابدأ الآن
          </Link>
        </div>
      </div>
    </nav>
  );
}