'use client';

import { useState, useRef } from 'react';
import { useEventStore } from '@/lib/stores/eventStore';
import { X, UploadCloud, Search, Users, CheckCircle, AlertTriangle, Loader2, Contact } from 'lucide-react';
import { toast } from 'sonner';
import { parseVCardFile, type ParsedContact } from '@/lib/utils/vcard-parser';

export function ContactImportModal() {
  const { isContactImportOpen, toggleContactImport, bulkAddGuests } = useEventStore();

  const [contacts, setContacts] = useState<ParsedContact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, valid: 0, skipped: 0 });
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isContactImportOpen) return null;

  // ============================================
  // معالجة الملف
  // ============================================

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.vcf')) {
      toast.error('يُرجى رفع ملف جهات اتصال بصيغة .vcf');
      return;
    }

    try {
      const text = await file.text();
      const result = parseVCardFile(text);

      setContacts(result.contacts);
      setWarnings(result.warnings);
      setStats({
        total: result.totalCards,
        valid: result.validCount,
        skipped: result.skippedCount,
      });

      if (result.contacts.length === 0) {
        toast.warning('لم يتم العثور على جهات اتصال في الملف');
      }
    } catch {
      toast.error('حدث خطأ في قراءة الملف');
    }
  };

  // ============================================
  // التحديد
  // ============================================

  const toggleSelect = (idx: number) => {
    setContacts(contacts.map((c, i) => (i === idx ? { ...c, selected: !c.selected } : c)));
  };

  const toggleSelectAll = () => {
    const allSelected = filteredContacts.every((c) => c.selected);
    const filteredNames = new Set(filteredContacts.map((c) => c.name));
    setContacts(
      contacts.map((c) =>
        filteredNames.has(c.name) ? { ...c, selected: !allSelected } : c
      )
    );
  };

  // ============================================
  // الفلترة
  // ============================================

  const filteredContacts = contacts.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.primaryPhone.includes(term) ||
      c.phones.some((p) => p.includes(term))
    );
  });

  const selectedCount = contacts.filter((c) => c.selected).length;

  // ============================================
  // الاستيراد
  // ============================================

  const handleImport = async () => {
    const selected = contacts.filter((c) => c.selected);
    if (selected.length === 0) {
      toast.warning('لم يتم اختيار أي جهة اتصال');
      return;
    }

    setIsImporting(true);

    const guests = selected.map((c) => ({
      name: c.name,
      phone: c.primaryPhone,
      category: 'GENERAL',
    }));

    await bulkAddGuests(guests);
    setIsImporting(false);

    toast.success(`تم استيراد ${guests.length} ضيف بنجاح`);
    handleClose();
  };

  // ============================================
  // إغلاق
  // ============================================

  const handleClose = () => {
    setContacts([]);
    setSearchTerm('');
    setWarnings([]);
    setStats({ total: 0, valid: 0, skipped: 0 });
    toggleContactImport(false);
  };

  // ============================================
  // الواجهة
  // ============================================

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#18181B] w-full max-w-2xl rounded-3xl border border-white/10 p-6 animate-in zoom-in relative flex flex-col max-h-[90vh]">
        {/* العنوان */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Contact className="text-blue-400" size={22} />
            استيراد جهات الاتصال
          </h3>
          <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {contacts.length === 0 ? (
          /* ===== مرحلة الرفع ===== */
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-sm text-blue-400">
              <p className="font-bold mb-1">كيف تصدّر جهات الاتصال؟</p>
              <ul className="text-xs text-blue-400/70 space-y-1 mt-2">
                <li>• <b>iPhone:</b> الإعدادات → جهات الاتصال → تصدير → ملف .vcf</li>
                <li>• <b>Android:</b> جهات الاتصال → القائمة → تصدير → .vcf</li>
                <li>• <b>Google:</b> contacts.google.com → تصدير → vCard</li>
              </ul>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-all"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".vcf"
                className="hidden"
              />
              <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mb-4">
                <UploadCloud size={32} />
              </div>
              <p className="font-bold text-lg">اضغط لرفع ملف .vcf</p>
              <p className="text-sm text-white/40 mt-2">ملف جهات اتصال بصيغة vCard</p>
            </div>
          </div>
        ) : (
          /* ===== مرحلة الاختيار ===== */
          <div className="flex-1 overflow-hidden flex flex-col gap-3">
            {/* إحصائيات */}
            <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl">
              <div className="text-sm flex items-center gap-3 flex-wrap">
                <span className="text-white/40">
                  إجمالي: <b className="text-white">{stats.total}</b>
                </span>
                <span className="text-white/10">|</span>
                <span className="text-green-400">
                  صالح: <b>{stats.valid}</b>
                </span>
                <span className="text-white/10">|</span>
                <span className="text-blue-400">
                  محدد: <b>{selectedCount}</b>
                </span>
              </div>
              <button
                onClick={() => {
                  setContacts([]);
                  setWarnings([]);
                }}
                className="text-xs underline text-white/50 hover:text-white"
              >
                ملف آخر
              </button>
            </div>

            {/* بحث */}
            <div className="relative">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالاسم أو الرقم..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C19D65]/50"
                dir="rtl"
              />
            </div>

            {/* زر تحديد الكل */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="text-xs text-white/50 hover:text-white underline"
              >
                {filteredContacts.every((c) => c.selected) ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
              </button>
              <span className="text-xs text-white/30">
                ({filteredContacts.length} جهة اتصال)
              </span>
            </div>

            {/* قائمة جهات الاتصال */}
            <div className="flex-1 overflow-y-auto border border-white/10 rounded-xl divide-y divide-white/5">
              {filteredContacts.map((contact, idx) => {
                const realIdx = contacts.indexOf(contact);
                return (
                  <div
                    key={realIdx}
                    onClick={() => toggleSelect(realIdx)}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 transition-colors ${
                      contact.selected ? 'bg-blue-500/5' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={contact.selected}
                      onChange={() => toggleSelect(realIdx)}
                      className="accent-[#C19D65] cursor-pointer shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{contact.name}</div>
                      <div className="text-xs text-white/50 font-mono" dir="ltr">
                        {contact.primaryPhone || 'بدون رقم'}
                        {contact.phones.length > 1 && (
                          <span className="text-white/30 mr-2">
                            (+{contact.phones.length - 1} أرقام أخرى)
                          </span>
                        )}
                      </div>
                    </div>

                    {contact.organization && (
                      <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded hidden sm:inline">
                        {contact.organization}
                      </span>
                    )}

                    {!contact.primaryPhone && (
                      <span className="shrink-0">
                        <AlertTriangle size={14} className="text-yellow-500" />
                      </span>
                    )}
                  </div>
                );
              })}

              {filteredContacts.length === 0 && (
                <div className="p-8 text-center text-white/30 text-sm">
                  {searchTerm ? 'لا توجد نتائج' : 'لا توجد جهات اتصال'}
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
                    استيراد {selectedCount} جهة اتصال
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
