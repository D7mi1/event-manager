'use client';
import { useState, useRef } from 'react';
import readXlsxFile from 'read-excel-file';
import { useEventStore } from '@/lib/stores/eventStore';
import { X, UploadCloud, AlertTriangle, CheckCircle, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { normalizePhone, isValidPhone } from '@/lib/utils/phone';
import { detectColumns, guessColumnFromData, getColumnLabel, type ColumnMapping, type ColumnType } from '@/lib/utils/column-detector';

export function ImportGuestsModal() {
  const { isImportModalOpen, toggleImportModal, bulkAddGuests } = useEventStore();
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping | null>(null);
  const [showMappingUI, setShowMappingUI] = useState(false);
  const [rawRows, setRawRows] = useState<any[][]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isImportModalOpen) return null;

  // ============================================
  // معالجة الملف
  // ============================================

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();

    try {
      let rows: any[][];

      if (fileName.endsWith('.csv')) {
        // قراءة CSV
        rows = await parseCSV(file);
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        // قراءة Excel
        rows = await readXlsxFile(file);
      } else {
        setErrors(['صيغة غير مدعومة. يُرجى رفع ملف .xlsx أو .csv']);
        return;
      }

      if (rows.length < 2) {
        setErrors(['الملف فارغ أو لا يحتوي على بيانات كافية']);
        return;
      }

      // الصف الأول = عناوين الأعمدة
      const headerRow = rows[0].map((h: any) => (h || '').toString());
      const dataRows = rows.slice(1);

      setHeaders(headerRow);
      setRawRows(dataRows);

      // كشف الأعمدة تلقائياً
      const detection = detectColumns(headerRow);

      // إذا فشل الكشف بالعناوين، نحاول بالبيانات
      if (!detection.mapping.name && dataRows.length > 0) {
        for (let i = 0; i < headerRow.length; i++) {
          const colData = dataRows.map((r: any) => (r[i] || '').toString());
          const guessed = guessColumnFromData(colData);
          if (guessed === 'name' && detection.mapping.name === null) {
            detection.mapping.name = i;
          } else if (guessed === 'phone' && detection.mapping.phone === null) {
            detection.mapping.phone = i;
          } else if (guessed === 'category' && detection.mapping.category === null) {
            detection.mapping.category = i;
          }
        }
      }

      setColumnMapping(detection.mapping);

      // إذا الثقة منخفضة: نعرض واجهة ربط يدوي
      if (detection.confidence === 'low') {
        setShowMappingUI(true);
        setErrors(detection.suggestions);
        return;
      }

      // تحويل البيانات حسب الربط المكتشف
      applyMapping(detection.mapping, dataRows);

    } catch (err) {
      console.error(err);
      setErrors(['حدث خطأ في قراءة الملف. تأكد أنه ملف Excel (.xlsx) أو CSV (.csv) صالح.']);
    }
  };

  // ============================================
  // تطبيق الربط
  // ============================================

  const applyMapping = (mapping: ColumnMapping, rows: any[][]) => {
    const data = rows.map((row: any) => {
      const nameIdx = mapping.name ?? 0;
      const phoneIdx = mapping.phone ?? 1;
      const catIdx = mapping.category;

      const name = (row[nameIdx] || '').toString().trim();
      const rawPhone = (row[phoneIdx] || '').toString().trim();
      const categoryRaw = catIdx !== null ? (row[catIdx] || '').toString().toUpperCase() : 'GENERAL';
      const category = ['VIP', 'FAMILY', 'GENERAL'].includes(categoryRaw) ? categoryRaw : 'GENERAL';
      const phone = normalizePhone(rawPhone);

      return {
        name,
        phone,
        originalPhone: rawPhone,
        category,
        isValid: name.length > 2 && phone.length >= 9,
      };
    });

    setPreviewData(data);
    setShowMappingUI(false);

    const invalidCount = data.filter((d: any) => !d.isValid).length;
    if (invalidCount > 0) setErrors([`يوجد ${invalidCount} صف يحتوي على بيانات ناقصة.`]);
    else setErrors([]);
  };

  // ============================================
  // ربط يدوي
  // ============================================

  const handleManualMapping = (type: ColumnType, colIndex: number | null) => {
    if (!columnMapping) return;
    const updated = { ...columnMapping, [type]: colIndex };
    setColumnMapping(updated);
  };

  const confirmManualMapping = () => {
    if (!columnMapping || rawRows.length === 0) return;
    applyMapping(columnMapping, rawRows);
  };

  // ============================================
  // قراءة CSV
  // ============================================

  const parseCSV = (file: File): Promise<any[][]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split(/\r?\n/).filter((l) => l.trim());
          const rows = lines.map((line) => {
            // دعم CSV مع أو بدون علامات اقتباس
            const result: string[] = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if ((char === ',' || char === ';' || char === '\t') && !inQuotes) {
                result.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            result.push(current.trim());
            return result;
          });
          resolve(rows);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file, 'UTF-8');
    });
  };

  // ============================================
  // الاستيراد
  // ============================================

  const handleImport = async () => {
    const validGuests = previewData.filter(d => d.isValid).map(({ name, phone, category }) => ({
      name, phone, category
    }));
    if (validGuests.length === 0) return toast.warning('لا توجد بيانات صالحة');

    setIsSubmitting(true);
    await bulkAddGuests(validGuests);
    setIsSubmitting(false);
    setPreviewData([]);
    setHeaders([]);
    setColumnMapping(null);
    setRawRows([]);
  };

  const handleReset = () => {
    setPreviewData([]);
    setErrors([]);
    setHeaders([]);
    setColumnMapping(null);
    setShowMappingUI(false);
    setRawRows([]);
  };

  // ============================================
  // واجهة الربط اليدوي
  // ============================================

  const MappingUI = () => {
    if (!columnMapping) return null;

    const requiredFields: ColumnType[] = ['name', 'phone', 'category'];

    return (
      <div className="space-y-4">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-sm text-yellow-400">
          <AlertTriangle size={14} className="inline ml-1" />
          لم يتم التعرف على بعض الأعمدة. يرجى ربطها يدوياً:
        </div>

        <div className="space-y-3">
          {requiredFields.map((field) => (
            <div key={field} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
              <span className="text-sm font-bold min-w-[70px]">{getColumnLabel(field)}</span>
              <div className="relative flex-1">
                <select
                  value={columnMapping[field] ?? ''}
                  onChange={(e) =>
                    handleManualMapping(field, e.target.value === '' ? null : parseInt(e.target.value))
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#C19D65]"
                >
                  <option value="">— لم يُحدد —</option>
                  {headers.map((h, i) => (
                    <option key={i} value={i}>
                      عمود {i + 1}: {h || `(بدون عنوان)`}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>

        {/* معاينة سريعة للبيانات */}
        {rawRows.length > 0 && (
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <div className="text-xs text-white/40 p-2 bg-white/5">معاينة أول 3 صفوف:</div>
            <table className="w-full text-right text-xs">
              <thead className="bg-white/10 text-white/60">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="p-2 truncate max-w-[120px]">{h || `عمود ${i+1}`}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rawRows.slice(0, 3).map((row, idx) => (
                  <tr key={idx}>
                    {row.map((cell: any, i: number) => (
                      <td key={i} className="p-2 truncate max-w-[120px] text-white/70">
                        {(cell || '').toString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={confirmManualMapping}
            disabled={columnMapping.name === null}
            className="flex-1 bg-[#C19D65] text-black font-bold py-3 rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            تطبيق الربط
          </button>
          <button onClick={handleReset} className="px-6 bg-white/10 rounded-xl hover:bg-white/20">
            ملف آخر
          </button>
        </div>
      </div>
    );
  };

  // ============================================
  // الواجهة
  // ============================================

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#18181B] w-full max-w-2xl rounded-3xl border border-white/10 p-6 animate-in zoom-in relative flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-xl font-bold flex items-center gap-2"><FileSpreadsheet className="text-[#107C41]"/> استيراد من Excel / CSV</h3>
           <button onClick={() => { toggleImportModal(false); handleReset(); }} className="text-white/40 hover:text-white"><X size={20}/></button>
        </div>

        {/* واجهة الربط اليدوي */}
        {showMappingUI ? (
          <MappingUI />
        ) : previewData.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-all"
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx,.xls,.csv" className="hidden" />
            <div className="w-16 h-16 bg-[#C19D65]/10 text-[#C19D65] rounded-full flex items-center justify-center mb-4">
               <UploadCloud size={32} />
            </div>
            <p className="font-bold text-lg">اضغط لرفع ملف Excel أو CSV</p>
            <p className="text-sm text-white/40 mt-2">يدعم: .xlsx, .csv — يكتشف الأعمدة تلقائياً</p>
            <p className="text-xs text-white/20 mt-1">الأعمدة: الاسم، الجوال، الفئة (اختياري)</p>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
             {/* شارة الكشف التلقائي */}
             {columnMapping && (
               <div className="mb-3 flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">
                 <CheckCircle size={12} />
                 تم التعرف على الأعمدة تلقائياً
                 {columnMapping.name !== null && <span className="text-white/50">| الاسم: عمود {(columnMapping.name ?? 0) + 1}</span>}
                 {columnMapping.phone !== null && <span className="text-white/50">| الجوال: عمود {(columnMapping.phone ?? 0) + 1}</span>}
               </div>
             )}

             <div className="flex justify-between items-center mb-4 bg-white/5 p-3 rounded-xl">
                <div className="text-sm">
                   <span className="text-white/40">الإجمالي:</span> <b>{previewData.length}</b>
                   <span className="mx-2 text-white/20">|</span>
                   <span className="text-green-400">صالح: <b>{previewData.filter(d => d.isValid).length}</b></span>
                   <span className="mx-2 text-white/20">|</span>
                   <span className="text-red-400">أخطاء: <b>{previewData.filter(d => !d.isValid).length}</b></span>
                </div>
                <button onClick={handleReset} className="text-xs underline text-white/50 hover:text-white">ملف آخر</button>
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
                       <td className="p-3 font-mono text-[11px]" dir="ltr">{row.phone}</td>
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
                <button onClick={() => { toggleImportModal(false); handleReset(); }} className="px-6 bg-white/10 rounded-xl hover:bg-white/20">إلغاء</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
