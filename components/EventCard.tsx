import { Calendar, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EventProps {
  id: string;
  name: string;
  date: string;
  location: string;
}

export default function EventCard({ id, name, date, location }: EventProps) {
  return (
    <div className="group relative bg-white/[0.03] backdrop-blur-xl p-6 rounded-2xl border border-white/5 hover:border-primary-500/30 transition-all duration-500 hover:-translate-y-1 shadow-2xl">
      <div className="flex justify-between items-center">
        <div className="space-y-3 text-right">
          {/* اسم الفعالية باللون الأبيض */}
          <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
            {name}
          </h3>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Calendar size={16} className="text-primary-500" />
              <span>{new Date(date).toLocaleDateString('ar-SA')}</span>
            </div>
            
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <MapPin size={16} className="text-primary-500" />
              <span>{location || 'موقع غير محدد'}</span>
            </div>
          </div>
        </div>

        {/* زر السهم بتصميم ذهبي */}
        <Link 
          href={`/dashboard/events/${id}`}
          className="bg-primary-500/10 text-primary-500 p-3 rounded-xl border border-primary-500/20 hover:bg-primary-500 hover:text-white transition-all duration-300"
        >
          <ArrowLeft size={20} />
        </Link>
      </div>
    </div>
  );
}