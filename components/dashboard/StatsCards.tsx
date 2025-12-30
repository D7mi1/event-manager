'use client';
import { useEventStore } from '@/store/eventStore';
import { Users, CheckCircle2 } from 'lucide-react';

const DonutChart = ({ percentage, color }: { percentage: number, color: string }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/10" />
        <circle cx="32" cy="32" r={radius} stroke={color} strokeWidth="6" fill="transparent"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <span className="absolute text-[10px] font-bold">{percentage}%</span>
    </div>
  );
};

export function StatsCards() {
  const { attendees } = useEventStore();

  const total = attendees.length;
  const confirmed = attendees.filter(a => a.status === 'confirmed').length;
  const attended = attendees.filter(a => a.attended).length;
  const attendanceRate = total > 0 ? Math.round((attended / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
       {/* البطاقة 1: المسجلين */}
       <div className="bg-[#18181B] p-5 rounded-2xl border border-white/10 flex justify-between items-center">
           <div><p className="text-xs text-white/40 font-bold mb-1">المسجلين</p><h3 className="text-3xl font-black">{total}</h3></div>
           <Users size={24} className="text-white/20"/>
       </div>

       {/* البطاقة 2: الحضور الفعلي (مع الرسم البياني) */}
       <div className="bg-[#18181B] p-5 rounded-2xl border border-white/10 flex justify-between items-center relative overflow-hidden">
           <div className="z-10"><p className="text-xs text-white/40 font-bold mb-1">الحضور الفعلي</p><h3 className="text-3xl font-black text-green-500">{attended}</h3></div>
           <DonutChart percentage={attendanceRate} color="#22c55e" />
       </div>

       {/* البطاقة 3: المؤكدين */}
       <div className="bg-[#18181B] p-5 rounded-2xl border border-white/10 flex justify-between items-center">
           <div><p className="text-xs text-white/40 font-bold mb-1">RSVP مؤكد</p><h3 className="text-3xl font-black text-blue-500">{confirmed}</h3></div>
           <CheckCircle2 size={24} className="text-blue-500/20"/>
       </div>
    </div>
  );
}