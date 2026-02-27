'use client';

/**
 * لوحة تحليلات الفعالية
 * ========================================
 * رسوم بيانية تفاعلية مع Recharts
 * دعم RTL و Dark Mode
 */

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
  LineChart, Line, Legend,
} from 'recharts';
import { Users, TrendingUp, Clock, CheckCircle2, XCircle, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

// ========================================
// أنواع البيانات
// ========================================

export interface AnalyticsData {
  totalGuests: number;
  attended: number;
  confirmed: number;
  declined: number;
  pending: number;
  attendanceRate: number;
  confirmationRate: number;

  /** حضور بالساعة */
  hourlyAttendance: Array<{ hour: string; count: number }>;
  /** حضور حسب التصنيف */
  categoryBreakdown: Array<{ name: string; value: number }>;
  /** حضور حسب الحالة */
  statusBreakdown: Array<{ name: string; value: number; color: string }>;
  /** اتجاه التأكيدات عبر الأيام */
  dailyTrend?: Array<{ date: string; confirmed: number; declined: number }>;
}

interface EventAnalyticsProps {
  data: AnalyticsData;
  className?: string;
}

// ========================================
// ألوان
// ========================================

const GOLD = '#C19D65';
const COLORS = ['#C19D65', '#3B82F6', '#22C55E', '#EF4444', '#A855F7', '#EC4899', '#F97316'];
const STATUS_COLORS = {
  attended: '#22C55E',
  confirmed: '#3B82F6',
  declined: '#EF4444',
  pending: '#6B7280',
};

// ========================================
// Tooltip مخصص
// ========================================

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1A1D] border border-white/10 rounded-xl p-3 shadow-xl" dir="rtl">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      {payload.map((item: any, i: number) => (
        <p key={i} className="text-sm font-bold" style={{ color: item.color || GOLD }}>
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

// ========================================
// المكون الرئيسي
// ========================================

export function EventAnalytics({ data, className = '' }: EventAnalyticsProps) {
  return (
    <div className={`space-y-6 ${className}`} dir="rtl">
      {/* بطاقات KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          icon={Users}
          label="إجمالي المدعوين"
          value={data.totalGuests}
          color="text-white"
        />
        <KPICard
          icon={CheckCircle2}
          label="حضروا"
          value={data.attended}
          subtitle={`${data.attendanceRate.toFixed(1)}%`}
          color="text-green-400"
        />
        <KPICard
          icon={TrendingUp}
          label="مؤكدين"
          value={data.confirmed}
          subtitle={`${data.confirmationRate.toFixed(1)}%`}
          color="text-blue-400"
        />
        <KPICard
          icon={XCircle}
          label="معتذرين"
          value={data.declined}
          color="text-red-400"
        />
      </div>

      {/* الصف الأول: رسم الحضور بالساعة + التوزيع */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* حضور بالساعة */}
        <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-[#C19D65]" />
            <h3 className="font-bold text-sm">الحضور بالساعة</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.hourlyAttendance}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fill: '#666', fontSize: 11 }} />
              <YAxis tick={{ fill: '#666', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                name="الحضور"
                stroke={GOLD}
                fill="url(#goldGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* توزيع الحالات (Pie) */}
        <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon size={16} className="text-[#C19D65]" />
            <h3 className="font-bold text-sm">توزيع الحالات</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.statusBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {data.statusBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span className="text-xs text-white/60">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* الصف الثاني: حسب التصنيف + اتجاه يومي */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* حسب التصنيف */}
        <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-[#C19D65]" />
            <h3 className="font-bold text-sm">المدعوون حسب التصنيف</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.categoryBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: '#666', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#999', fontSize: 11 }} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="العدد" radius={[0, 4, 4, 0]}>
                {data.categoryBreakdown.map((_, index) => (
                  <Cell key={`cat-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* اتجاه يومي */}
        {data.dailyTrend && data.dailyTrend.length > 0 && (
          <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-[#C19D65]" />
              <h3 className="font-bold text-sm">اتجاه التأكيدات</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 10 }} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="confirmed"
                  name="مؤكدين"
                  stroke={STATUS_COLORS.confirmed}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="declined"
                  name="معتذرين"
                  stroke={STATUS_COLORS.declined}
                  strokeWidth={2}
                  dot={false}
                />
                <Legend
                  formatter={(value) => <span className="text-xs text-white/60">{value}</span>}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

// ========================================
// بطاقة KPI
// ========================================

function KPICard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  subtitle?: string;
  color: string;
}) {
  return (
    <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className={color} />
        <span className="text-[10px] text-white/40 font-bold">{label}</span>
      </div>
      <p className={`text-3xl font-black ${color}`}>
        {value.toLocaleString('ar-SA')}
      </p>
      {subtitle && (
        <p className="text-xs text-white/30 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

// ========================================
// Helper: بناء بيانات التحليلات من الضيوف
// ========================================

export function buildAnalyticsData(
  attendees: Array<{
    name: string;
    status: string;
    attended: boolean;
    category: string;
    updated_at: string;
  }>
): AnalyticsData {
  const total = attendees.length;
  const attended = attendees.filter((a) => a.attended);
  const confirmed = attendees.filter((a) => a.status === 'confirmed');
  const declined = attendees.filter((a) => a.status === 'declined');
  const pending = total - confirmed.length - declined.length;

  // حضور بالساعة
  const hourMap = new Map<string, number>();
  attended.forEach((a) => {
    const hour = new Date(a.updated_at).getHours();
    const label = `${hour}:00`;
    hourMap.set(label, (hourMap.get(label) || 0) + 1);
  });
  const hourlyAttendance = Array.from(hourMap.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

  // حسب التصنيف
  const catMap = new Map<string, number>();
  attendees.forEach((a) => {
    const cat = a.category || 'عام';
    catMap.set(cat, (catMap.get(cat) || 0) + 1);
  });
  const categoryBreakdown = Array.from(catMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // توزيع الحالات
  const statusBreakdown = [
    { name: 'حضروا', value: attended.length, color: '#22C55E' },
    { name: 'مؤكدين', value: confirmed.length - attended.length, color: '#3B82F6' },
    { name: 'معتذرين', value: declined.length, color: '#EF4444' },
    { name: 'معلّقين', value: pending, color: '#6B7280' },
  ].filter((s) => s.value > 0);

  return {
    totalGuests: total,
    attended: attended.length,
    confirmed: confirmed.length,
    declined: declined.length,
    pending,
    attendanceRate: total > 0 ? (attended.length / total) * 100 : 0,
    confirmationRate: total > 0 ? (confirmed.length / total) * 100 : 0,
    hourlyAttendance,
    categoryBreakdown,
    statusBreakdown,
  };
}
