import { Calendar, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// هذا تعريف لنوع البيانات التي تقبلها البطاقة
interface EventProps {
  id: string;
  name: string;
  date: string;
  location: string;
}

export default function EventCard({ id, name, date, location }: EventProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
          
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Calendar size={16} />
            {/* تنسيق التاريخ ليظهر بشكل مقروء */}
            <span>{new Date(date).toLocaleDateString('ar-SA')}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <MapPin size={16} />
            <span>{location || 'موقع غير محدد'}</span>
          </div>
        </div>

        <Link 
          href={`/events/${id}`}
          className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition"
        >
          <ArrowLeft size={20} />
        </Link>
      </div>
    </div>
  );
}