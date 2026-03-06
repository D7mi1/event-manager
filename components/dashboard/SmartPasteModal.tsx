'use client';

import { useState, useCallback } from 'react';
import { useEventStore } from '@/lib/stores/eventStore';
import {
  X,
  Wand2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  ClipboardPaste,
  Trash2,
  Pencil,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ParsedGuest } from '@/lib/utils/guest-parser';

// ============================================
// الأنواع المحلية
// ============================================

interface EditableGuest extends ParsedGuest {
  selected: boolean;
  isEditing: boolean;
  editName: string;
  editPhone: string;
  editCategory: 'GENERAL' | 'VIP' | 'FAMILY';
}

// ============================================
// المكون الرئيسي
// ============================================

export function SmartPasteModal() {
  const { isSmartPasteOpen, toggleSmartPaste, bulkAddGuests, eventId } = useEventStore();

  // حالات المكون
  const [rawText, setRawText] = useState('');
  const [guests, setGuests] = useState<EditableGuest[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [stats, setStats] = useState({ totalLines: 0, parsedCount: 0, skippedCount: 0 });
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [step, setStep] = useState<'input' | 'preview'>('input');

  if (!isSmartPasteOpen) return null;

  // ============================================
  // التحليل
  // ============================================

  const handleParse = async () => {
    if (!rawText.trim()) {
      toast.error('الرجاء لصق النص أولاً');
      return;
    }

    if (rawText.trim().length < 3) {
      toast.error('النص قصير جداً');
      return;
    }

    setIsParsing(true);

    try {
      const res = await fetch('/api/ai/parse-guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, eventId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'فشل التحليل');
        setIsParsing(false);
        return;
      }

      // تحويل إلى EditableGuest
      const editableGuests: EditableGuest[] = (data.guests || []).map((g: ParsedGuest) => ({
        ...g,
        selected: g.confidence !== 'low' || g.phone !== '',
        isEditing: false,
        editName: g.name,
        editPhone: g.phone,
        editCategory: g.category,
      }));

      setGuests(editableGuests);
      setWarnings(data.warnings || []);
      setStats({
        totalLines: data.totalLines || 0,
        parsedCount: data.parsedCount || 0,
        skippedCount: data.skippedCount || 0,
      });
      setStep('preview');
    } catch {
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setIsParsing(false);
    }
  };

  // ============================================
  // الاستيراد
  // ============================================

  const handleImport = async () => {
    const selectedGuests = guests.filter((g) => g.selected);
    if (selectedGuests.length === 0) {
      toast.warning('لم يتم اختيار أي ضيف');
      return;
    }

    setIsImporting(true);

    const formattedGuests = selectedGuests.map((g) => ({
      name: g.isEditing ? g.editName : g.name,
      phone: g.isEditing ? g.editPhone : g.phone,
      category: g.isEditing ? g.editCategory : g.category,
    }));

    await bulkAddGuests(formattedGuests);
    setIsImporting(false);

    toast.success(`تم استيراد ${formattedGuests.length} ضيف بنجاح`);
    handleClose();
  };

  // ============================================
  // دوال مساعدة
  // ============================================

  const handleClose = () => {
    setRawText('');
    setGuests([]);
    setWarnings([]);
    setStats({ totalLines: 0, parsedCount: 0, skippedCount: 0 });
    setStep('input');
    toggleSmartPaste(false);
  };

  const toggleSelectAll = () => {
    const allSelected = guests.every((g) => g.selected);
    setGuests(guests.map((g) => ({ ...g, selected: !allSelected })));
  };

  const toggleSelect = (idx: number) => {
    setGuests(guests.map((g, i) => (i === idx ? { ...g, selected: !g.selected } : g)));
  };

  const startEdit = (idx: number) => {
    setGuests(
      guests.map((g, i) =>
        i === idx
          ? { ...g, isEditing: true, editName: g.name, editPhone: g.phone, editCategory: g.category }
          : g
      )
    );
  };

  const saveEdit = (idx: number) => {
    setGuests(
      guests.map((g, i) =>
        i === idx
          ? {
              ...g,
              name: g.editName,
              phone: g.editPhone,
              category: g.editCategory,
              isEditing: false,
            }
          : g
      )
    );
  };

  const cancelEdit = (idx: number) => {
    setGuests(guests.map((g, i) => (i === idx ? { ...g, isEditing: false } : g)));
  };

  const removeGuest = (idx: number) => {
    setGuests(guests.filter((_, i) => i !== idx));
  };

  const updateEditField = (idx: number, field: 'editName' | 'editPhone' | 'editCategory', value: string) => {
    setGuests(
      guests.map((g, i) => (i === idx ? { ...g, [field]: value } : g))
    );
  };

  const selectedCount = guests.filter((g) => g.selected).length;

  // ============================================
  // أيقونة الثقة
  // ============================================

  const ConfidenceIcon = ({ level }: { level: string }) => {
    if (level === 'high')
      return <span title="ثقة عالية"><CheckCircle size={14} className="text-green-500" /></span>;
    if (level === 'medium')
      return <span title="ثقة متوسطة"><AlertTriangle size={14} className="text-yellow-500" /></span>;
    return <span title="ثقة منخفضة"><XCircle size={14} className="text-red-500" /></span>;
  };

  // ============================================
  // شارة الفئة
  // ============================================

  const CategoryBadge = ({ category }: { category: string }) => {
    const styles: Record<string, string> = {
      VIP: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      FAMILY: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      GENERAL: 'bg-white/10 text-white/60 border-white/10',
    };
    const labels: Record<string, string> = {
      VIP: 'VIP',
      FAMILY: 'عائلة',
      GENERAL: 'عام',
    };
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${styles[category] || styles.GENERAL}`}>
        {labels[category] || category}
      </span>
    );
  };

  // ============================================
  // الواجهة
  // ============================================

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#18181B] w-full max-w-3xl rounded-3xl border border-white/10 p-6 animate-in zoom-in relative flex flex-col max-h-[90vh]">
        {/* العنوان */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Wand2 className="text-[#C19D65]" size={22} />
            لصق ذكي
          </h3>
          <button
            onClick={handleClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ===== المرحلة 1: الإدخال ===== */}
        {step === 'input' && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#C19D65]/10 border border-[#C19D65]/20 rounded-2xl p-4 text-sm text-[#C19D65]">
              <p className="font-bold mb-1">الصق قائمة الضيوف من أي مصدر:</p>
              <p className="text-[#C19D65]/70 text-xs leading-relaxed">
                واتساب، ملاحظات، أو أي نص يحتوي أسماء وأرقام. النظام يتعرف تلقائياً على الأسماء والأرقام (عربية وإنجليزية) والفئات (VIP / عائلة).
              </p>
            </div>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`مثال:\nمحمد الأحمد 0551234567\nفهد ٠٥٥١٢٣٤٥٦٨\nعبدالله العتيبي - 966501234567\nسعد 0551234569 VIP\nأم خالد ٠٥٠٠٠٠٠٠٠٠ عائلة\nأحمد بن سعيد`}
              className="w-full h-64 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-[#C19D65]/50 transition-colors font-mono leading-relaxed"
              dir="rtl"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-white/30">
                {rawText.split('\n').filter((l) => l.trim()).length} سطر
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 bg-white/10 rounded-xl text-sm hover:bg-white/20 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleParse}
                  disabled={isParsing || !rawText.trim()}
                  className="px-6 py-2.5 bg-[#C19D65] text-black font-bold rounded-xl text-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                  {isParsing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      جاري التحليل...
                    </>
                  ) : (
                    <>
                      <ClipboardPaste size={16} />
                      تحليل النص
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== المرحلة 2: المعاينة ===== */}
        {step === 'preview' && (
          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {/* إحصائيات */}
            <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl">
              <div className="text-sm flex items-center gap-3 flex-wrap">
                <span className="text-white/40">
                  الأسطر: <b className="text-white">{stats.totalLines}</b>
                </span>
                <span className="text-white/10">|</span>
                <span className="text-green-400">
                  تم التعرف: <b>{stats.parsedCount}</b>
                </span>
                <span className="text-white/10">|</span>
                <span className="text-red-400">
                  تم تجاهل: <b>{stats.skippedCount}</b>
                </span>
                <span className="text-white/10">|</span>
                <span className="text-[#C19D65]">
                  محدد: <b>{selectedCount}</b>
                </span>
              </div>
              <button
                onClick={() => {
                  setStep('input');
                  setGuests([]);
                  setWarnings([]);
                }}
                className="text-xs underline text-white/50 hover:text-white transition-colors"
              >
                نص آخر
              </button>
            </div>

            {/* تحذيرات */}
            {warnings.length > 0 && (
              <details className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                <summary className="text-xs text-yellow-400 cursor-pointer flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {warnings.length} تنبيه — اضغط للتفاصيل
                </summary>
                <ul className="mt-2 space-y-1 text-xs text-yellow-400/70 max-h-24 overflow-y-auto">
                  {warnings.slice(0, 10).map((w, i) => (
                    <li key={i} className="truncate">
                      {w}
                    </li>
                  ))}
                  {warnings.length > 10 && (
                    <li className="text-yellow-500">... و {warnings.length - 10} تنبيهات أخرى</li>
                  )}
                </ul>
              </details>
            )}

            {/* زر تحديد الكل */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="text-xs text-white/50 hover:text-white underline transition-colors"
              >
                {guests.every((g) => g.selected) ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
              </button>
            </div>

            {/* جدول المعاينة */}
            <div className="flex-1 overflow-y-auto border border-white/10 rounded-xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-white/10 text-white/60 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 w-8">
                      <input
                        type="checkbox"
                        checked={guests.length > 0 && guests.every((g) => g.selected)}
                        onChange={toggleSelectAll}
                        className="accent-[#C19D65] cursor-pointer"
                      />
                    </th>
                    <th className="p-3">الاسم</th>
                    <th className="p-3">الجوال</th>
                    <th className="p-3">الفئة</th>
                    <th className="p-3 text-center">الحالة</th>
                    <th className="p-3 text-center w-20">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {guests.map((guest, idx) => (
                    <tr
                      key={idx}
                      className={`${
                        !guest.selected ? 'opacity-40' : ''
                      } ${
                        guest.confidence === 'low' ? 'bg-red-500/5' : ''
                      } hover:bg-white/5 transition-colors`}
                    >
                      {/* Checkbox */}
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={guest.selected}
                          onChange={() => toggleSelect(idx)}
                          className="accent-[#C19D65] cursor-pointer"
                        />
                      </td>

                      {/* الاسم */}
                      <td className="p-3">
                        {guest.isEditing ? (
                          <input
                            value={guest.editName}
                            onChange={(e) => updateEditField(idx, 'editName', e.target.value)}
                            className="bg-black/40 border border-[#C19D65]/30 rounded px-2 py-1 text-xs w-full focus:outline-none focus:border-[#C19D65]"
                            dir="rtl"
                          />
                        ) : (
                          <span className="text-white">{guest.name}</span>
                        )}
                      </td>

                      {/* الجوال */}
                      <td className="p-3 font-mono text-[11px]" dir="ltr">
                        {guest.isEditing ? (
                          <input
                            value={guest.editPhone}
                            onChange={(e) => updateEditField(idx, 'editPhone', e.target.value)}
                            className="bg-black/40 border border-[#C19D65]/30 rounded px-2 py-1 text-xs w-full focus:outline-none focus:border-[#C19D65]"
                            dir="ltr"
                          />
                        ) : (
                          <span className={guest.phone ? 'text-white/70' : 'text-red-400'}>
                            {guest.phone || 'بدون رقم'}
                          </span>
                        )}
                      </td>

                      {/* الفئة */}
                      <td className="p-3">
                        {guest.isEditing ? (
                          <select
                            value={guest.editCategory}
                            onChange={(e) =>
                              updateEditField(idx, 'editCategory', e.target.value)
                            }
                            className="bg-black/40 border border-[#C19D65]/30 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#C19D65]"
                          >
                            <option value="GENERAL">عام</option>
                            <option value="VIP">VIP</option>
                            <option value="FAMILY">عائلة</option>
                          </select>
                        ) : (
                          <CategoryBadge category={guest.category} />
                        )}
                      </td>

                      {/* الحالة */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <ConfidenceIcon level={guest.confidence} />
                          {guest.warning && (
                            <span
                              className="text-[10px] text-yellow-500 truncate max-w-[100px]"
                              title={guest.warning}
                            >
                              {guest.warning}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* إجراءات */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {guest.isEditing ? (
                            <>
                              <button
                                onClick={() => saveEdit(idx)}
                                className="p-1 text-green-500 hover:bg-green-500/20 rounded transition-colors"
                                title="حفظ"
                              >
                                <CheckCircle size={14} />
                              </button>
                              <button
                                onClick={() => cancelEdit(idx)}
                                className="p-1 text-red-500 hover:bg-red-500/20 rounded transition-colors"
                                title="إلغاء"
                              >
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(idx)}
                                className="p-1 text-white/40 hover:text-[#C19D65] hover:bg-white/10 rounded transition-colors"
                                title="تعديل"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => removeGuest(idx)}
                                className="p-1 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                title="حذف"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {guests.length === 0 && (
                <div className="p-8 text-center text-white/30 text-sm">
                  لم يتم التعرف على أي ضيف في النص
                </div>
              )}
            </div>

            {/* أزرار الإجراء */}
            <div className="flex gap-3">
              <button
                onClick={handleImport}
                disabled={isImporting || selectedCount === 0}
                className="flex-1 bg-[#C19D65] text-black font-bold py-3 rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {isImporting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    جاري الاستيراد...
                  </>
                ) : (
                  <>
                    <Users size={16} />
                    استيراد {selectedCount} ضيف
                  </>
                )}
              </button>
              <button
                onClick={handleClose}
                className="px-6 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
