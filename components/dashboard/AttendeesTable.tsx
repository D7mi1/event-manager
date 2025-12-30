'use client';
import { useState } from 'react';
import { useEventStore } from '@/store/eventStore';
import { generateWhatsAppLink } from '@/app/utils/whatsappHelper';
import { Search, Trash2, CheckSquare, Square, MessageCircle, Phone, CheckCircle2 } from 'lucide-react';

export function AttendeesTable() {
  const { attendees, searchTerm, setSearchTerm, filterType, setFilterType, deleteGuest, bulkDelete, toggleAttendance, eventDetails, toggleQueueModal } = useEventStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // التصفية
  const filteredAttendees = attendees.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.phone.includes(searchTerm);
    const matchesFilter = filterType === 'all' ? true :
      filterType === 'attended' ? a.attended :
      filterType === 'confirmed' ? a.status === 'confirmed' : !a.attended;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = attendees.filter(a => a.status === 'confirmed').length;

  // دوال التحديد
  const toggleSelectAll = () => setSelectedIds(prev => prev.size === filteredAttendees.length ? new Set() : new Set(filteredAttendees.map(a => a.id)));
  const toggleSelectOne = (id: string) => { const newSet = new Set(selectedIds); newSet.has(id) ? newSet.delete(id) : newSet.add(id); setSelectedIds(newSet); };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#18181B] p-4 rounded-2xl border border-white/10">
         <div className="flex gap-2">
             {[{id:'all',label:'الكل'}, {id:'confirmed',label:'مؤكد'}, {id:'attended',label:'حاضر'}].map(tab => (
               <button key={tab.id} onClick={() => setFilterType(tab.id)} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${filterType === tab.id ? 'bg-white text-black' : 'bg-white/5 text-white/50 border-transparent'}`}>{tab.label}</button>
             ))}
         </div>
         
         <div className="flex gap-3 w-full md:w-auto">
            {/* 🟢 زر بدء الطابور */}
            {pendingCount > 0 && (
                <button onClick={() => toggleQueueModal(true)} className="px-4 py-2 bg-[#25D366] text-black font-bold rounded-xl flex items-center gap-2 hover:brightness-110 animate-pulse">
                   <MessageCircle size={18} /> <span className="hidden md:inline">إرسال لـ {pendingCount}</span>
                </button>
            )}
            <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input type="text" placeholder="بحث..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pr-10 pl-4 text-sm text-white focus:border-[#C19D65] outline-none" />
            </div>
         </div>
      </div>

      {/* Table */}
      <div className="bg-[#18181B] rounded-[2rem] border border-white/10 overflow-hidden min-h-[400px]">
         <table className="w-full text-right text-sm">
            <thead className="bg-white/5 text-white/40 text-xs">
               <tr>
                  <th className="p-4 w-10"><button onClick={toggleSelectAll}>{selectedIds.size > 0 ? <CheckSquare size={18}/> : <Square size={18}/>}</button></th>
                  <th className="p-4">الضيف</th>
                  <th className="p-4 text-center">الحضور</th>
                  <th className="p-4 text-center">إجراءات</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {filteredAttendees.map(g => (
                  <tr key={g.id} className="hover:bg-white/5 group">
                     <td className="p-4"><button onClick={() => toggleSelectOne(g.id)} className={selectedIds.has(g.id) ? 'text-[#C19D65]' : 'text-white/20'}>{selectedIds.has(g.id) ? <CheckSquare size={18}/> : <Square size={18}/>}</button></td>
                     <td className="p-4">
                        <div className="font-bold">{g.name} <span className="text-[9px] bg-white/10 px-1 rounded ml-2">{g.category}</span></div>
                        <div className="text-xs text-white/40 dir-ltr text-right">{g.phone}</div>
                     </td>
                     <td className="p-4 text-center">
                        <button onClick={() => toggleAttendance(g.id, g.attended)} className={`px-3 py-1 rounded-full text-xs font-bold ${g.attended ? 'bg-green-500 text-black' : 'bg-white/5 text-white/20'}`}>
                           {g.attended ? 'تم الحضور' : 'تسجيل دخول'}
                        </button>
                     </td>
                     <td className="p-4 text-center flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => window.open(generateWhatsAppLink(g.phone, g.name, eventDetails?.name || '', g.id), '_blank')} className="p-2 bg-[#25D366]/10 text-[#25D366] rounded-lg hover:bg-[#25D366] hover:text-white"><MessageCircle size={16}/></button>
                        <button onClick={() => {if(confirm('حذف؟')) deleteGuest(g.id)}} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white"><Trash2 size={16}/></button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}