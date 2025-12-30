'use client';
import { useState, useRef } from 'react';
import readXlsxFile from 'read-excel-file';
import { useEventStore } from '@/store/eventStore';
import { X, UploadCloud, AlertTriangle, CheckCircle, FileSpreadsheet } from 'lucide-react';

export function ImportGuestsModal() {
  const { isImportModalOpen, toggleImportModal, bulkAddGuests } = useEventStore();
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isImportModalOpen) return null;

  // تنظيف وتنسيق رقم الجوال (تخصيص للسعودية)
  const cleanPhone = (phone: any) => {
    if (!phone) return '';
    let p = String(phone).replace(/[^0-9]/g, '');
    if (p.startsWith('05')) p = '966' + p.substring(1);
    else if (p.startsWith('5')) p = '966' + p;
    return p;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const rows = await readXlsxFile(file);
      // نفترض أن الصف الأول عناوين، نبدأ من الصف الثاني
      const data = rows.slice(1).map((row: any) => {
        const name = row[0]?.toString() || '';
        const rawPhone = row[1]?.toString() || '';
        const categoryRaw = row[2]?.toString().toUpperCase() || 'GENERAL';
        const category = ['VIP', 'FAMILY', 'GENERAL'].includes(categoryRaw) ? categoryRaw : 'GENERAL';

        return {
          name,
          phone: cleanPhone(rawPhone),
          originalPhone: rawPhone,
          category,
          isValid: name.length > 2 && cleanPhone(rawPhone).length >= 9
        };
      });

      setPreviewData(data);
      const invalidCount = data.filter((d: any) => !d.isValid).length;
      if (invalidCount > 0) setErrors([`يوجد ${invalidCount} صفوف تحتوي على بيانات ناقصة.`]);
      else setErrors([]);

    } catch (err) {
      console.error(err);
      setErrors(['حدث خطأ في قراءة الملف. تأكد أنه ملف Excel (.xlsx) صالح.']);
    }
  };

  const handleImport = async () => {
    const validGuests = previewData.filter(d => d.isValid).map(({ name, phone, category }) => ({
      name, phone, category
    }));
    if (validGuests.length === 0) return alert('لا توجد بيانات صالحة');

    setIsSubmitting(true);
    await bulkAddGuests(validGuests);
    setIsSubmitting(false);
    setPreviewData([]);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#18181B] w-full max-w-2xl rounded-3xl border border-white/10 p-6 animate-in zoom-in relative flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-xl font-bold flex items-center gap-2"><FileSpreadsheet className="text-[#107C41]"/> استيراد من Excel</h3>
           <button onClick={() => toggleImportModal(false)} className="text-white/40 hover:text-white"><X size={20}/></button>
        </div>

        {previewData.length === 0 ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-all"
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx" className="hidden" />
            <div className="w-16 h-16 bg-[#C19D65]/10 text-[#C19D65] rounded-full flex items-center justify-center mb-4">
               <UploadCloud size={32} />
            </div>
            <p className="font-bold text-lg">اضغط لرفع ملف Excel</p>
            <p className="text-sm text-white/40 mt-2">الأعمدة المطلوبة: الاسم، الجوال، الفئة</p>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
             <div className="flex justify-between items-center mb-4 bg-white/5 p-3 rounded-xl">
                <div className="text-sm">
                   <span className="text-white/40">الإجمالي:</span> <b>{previewData.length}</b>
                   <span className="mx-2 text-white/20">|</span>
                   <span className="text-green-400">صالح: <b>{previewData.filter(d => d.isValid).length}</b></span>
                   <span className="mx-2 text-white/20">|</span>
                   <span className="text-red-400">أخطاء: <b>{previewData.filter(d => !d.isValid).length}</b></span>
                </div>
                <button onClick={() => {setPreviewData([]); setErrors([]);}} className="text-xs underline text-white/50 hover:text-white">ملف آخر</button>
             </div>

             <div className="flex-1 overflow-y-auto border border-white/10 rounded-xl">
               <table className="w-full text-right text-xs">
                 <thead className="bg-white/10 text-white/60 sticky top-0">
                   <tr><th className="p-3">الاسم</th><th className="p-3">الجوال</th><th className="p-3">الفئة</th><th className="p-3 text-center">الحالة</th></tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {previewData.map((row, idx) => (
                     <tr key={idx} className={!row.isValid ? 'bg-red-500/10' : ''}>
                       <td className="p-3">{row.name}</td>
                       <td className="p-3">{row.phone}</td>
                       <td className="p-3"><span className="bg-white/10 px-2 py-0.5 rounded">{row.category}</span></td>
                       <td className="p-3 text-center">{row.isValid ? <CheckCircle size={14} className="text-green-500 mx-auto"/> : <AlertTriangle size={14} className="text-red-500 mx-auto"/>}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>

             <div className="mt-6 flex gap-3">
                <button onClick={handleImport} disabled={isSubmitting || previewData.filter(d => d.isValid).length === 0}
                  className="flex-1 bg-[#C19D65] text-black font-bold py-3 rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? 'جاري الحفظ...' : `تأكيد الاستيراد`}
                </button>
                <button onClick={() => toggleImportModal(false)} className="px-6 bg-white/10 rounded-xl hover:bg-white/20">إلغاء</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}