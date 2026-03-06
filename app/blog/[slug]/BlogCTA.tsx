import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function BlogCTA() {
    return (
        <div className="bg-gradient-to-b from-[#3B82F6]/10 to-[#0A0A0C] border border-[#3B82F6]/20 rounded-[2rem] p-8 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent opacity-50"></div>

            <h3 className="text-2xl font-black mb-4 text-white">طبق ما قرأت!</h3>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                ابدأ الآن بتنظيم فعاليتك أو مناسبتك مع مِراس — مجاناً وبدون التزام.
            </p>

            <ul className="space-y-3 mb-8">
                {['دعوات رقمية وتسجيل حضور بـ QR', 'رسائل واتساب تلقائية', 'لوحة تحكم وتحليلات ذكية'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                        <CheckCircle2 size={18} className="text-[#3B82F6]" /> {item}
                    </li>
                ))}
            </ul>

            <Link href="/login" className="block w-full py-4 rounded-xl bg-[#3B82F6] text-black font-black text-center text-lg hover:bg-[#2563EB] transition-all shadow-lg shadow-[#3B82F6]/20 transform group-hover:scale-[1.02]">
                ابدأ التجربة المجانية
            </Link>
        </div>
    );
}