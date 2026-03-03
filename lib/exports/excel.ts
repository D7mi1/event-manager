/**
 * تصدير Excel مع دعم RTL والعربية
 * ========================================
 * يستخدم exceljs لتوليد ملفات .xlsx
 * مع اتجاه RTL وتنسيق احترافي
 */

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface ExcelGuest {
  name: string;
  phone: string;
  category?: string;
  status: string;
  attended: boolean;
  updated_at: string;
}

export interface ExcelExportOptions {
  eventName: string;
  eventDate?: string;
  guests: ExcelGuest[];
  includeStats?: boolean;
}

const STATUS_MAP: Record<string, string> = {
  invited: 'مدعو',
  confirmed: 'مؤكد',
  declined: 'معتذر',
  pending: 'معلّق',
};

/**
 * تصدير قائمة الضيوف كملف Excel
 */
export async function exportGuestsToExcel(options: ExcelExportOptions): Promise<void> {
  const { eventName, eventDate, guests, includeStats = true } = options;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'مِراس - Meras';
  workbook.created = new Date();

  // ========== ورقة الضيوف ==========
  const sheet = workbook.addWorksheet('قائمة الضيوف', {
    views: [{ rightToLeft: true }],
  });

  // عنوان الفعالية
  sheet.mergeCells('A1:F1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = `📋 ${eventName}`;
  titleCell.font = { bold: true, size: 16, color: { argb: 'FFC19D65' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F0F12' },
  };
  sheet.getRow(1).height = 40;

  // التاريخ
  if (eventDate) {
    sheet.mergeCells('A2:F2');
    const dateCell = sheet.getCell('A2');
    dateCell.value = `التاريخ: ${eventDate}`;
    dateCell.font = { size: 10, color: { argb: 'FF999999' } };
    dateCell.alignment = { horizontal: 'center' };
  }

  // سطر فارغ
  const headerRow = eventDate ? 4 : 3;

  // رؤوس الأعمدة
  const headers = ['#', 'الاسم', 'رقم الجوال', 'التصنيف', 'الحالة', 'وقت الحضور'];
  const headerRowObj = sheet.getRow(headerRow);
  headers.forEach((h, i) => {
    const cell = headerRowObj.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A1A2E' },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFC19D65' } },
    };
  });
  headerRowObj.height = 30;

  // عرض الأعمدة
  sheet.getColumn(1).width = 6;   // #
  sheet.getColumn(2).width = 28;  // الاسم
  sheet.getColumn(3).width = 18;  // الجوال
  sheet.getColumn(4).width = 16;  // التصنيف
  sheet.getColumn(5).width = 14;  // الحالة
  sheet.getColumn(6).width = 20;  // وقت الحضور

  // البيانات
  guests.forEach((guest, index) => {
    const row = sheet.getRow(headerRow + 1 + index);
    row.getCell(1).value = index + 1;
    row.getCell(2).value = guest.name;
    row.getCell(3).value = guest.phone || '-';
    row.getCell(4).value = guest.category || 'عام';
    row.getCell(5).value = STATUS_MAP[guest.status] || guest.status;
    row.getCell(6).value = guest.attended
      ? new Date(guest.updated_at).toLocaleString('ar-SA', {
          dateStyle: 'short',
          timeStyle: 'short',
        })
      : '-';

    // تنسيق الحالة بألوان
    const statusCell = row.getCell(5);
    if (guest.attended) {
      statusCell.value = '✅ حضر';
      statusCell.font = { color: { argb: 'FF22C55E' }, bold: true };
    } else if (guest.status === 'confirmed') {
      statusCell.font = { color: { argb: 'FF3B82F6' }, bold: true };
    } else if (guest.status === 'declined') {
      statusCell.font = { color: { argb: 'FFEF4444' }, bold: true };
    }

    // تنسيق الصفوف بالتبادل
    if (index % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' },
        };
      });
    }

    row.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // ========== ورقة الإحصائيات ==========
  if (includeStats) {
    const statsSheet = workbook.addWorksheet('الإحصائيات', {
      views: [{ rightToLeft: true }],
    });

    const total = guests.length;
    const attended = guests.filter((g) => g.attended).length;
    const confirmed = guests.filter((g) => g.status === 'confirmed').length;
    const declined = guests.filter((g) => g.status === 'declined').length;
    const pending = total - confirmed - declined;
    const attendanceRate = total > 0 ? ((attended / total) * 100).toFixed(1) : '0';

    // عنوان
    statsSheet.mergeCells('A1:B1');
    const statsTitleCell = statsSheet.getCell('A1');
    statsTitleCell.value = `📊 إحصائيات: ${eventName}`;
    statsTitleCell.font = { bold: true, size: 14, color: { argb: 'FFC19D65' } };
    statsTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F0F12' },
    };
    statsSheet.getRow(1).height = 35;

    statsSheet.getColumn(1).width = 25;
    statsSheet.getColumn(2).width = 20;

    const statsData = [
      ['إجمالي المدعوين', total],
      ['حضروا', attended],
      ['مؤكدين', confirmed],
      ['معتذرين', declined],
      ['معلّقين', pending],
      ['نسبة الحضور', `${attendanceRate}%`],
    ];

    statsData.forEach((item, i) => {
      const row = statsSheet.getRow(3 + i);
      row.getCell(1).value = item[0] as string;
      row.getCell(1).font = { bold: true, size: 11 };
      row.getCell(2).value = item[1];
      row.getCell(2).font = { size: 12, bold: true, color: { argb: 'FFC19D65' } };
      row.getCell(2).alignment = { horizontal: 'center' };
    });

    // إحصائيات حسب التصنيف
    const categories = new Map<string, number>();
    guests.forEach((g) => {
      const cat = g.category || 'عام';
      categories.set(cat, (categories.get(cat) || 0) + 1);
    });

    if (categories.size > 0) {
      const catStartRow = 3 + statsData.length + 2;
      const catHeader = statsSheet.getRow(catStartRow);
      catHeader.getCell(1).value = 'التصنيف';
      catHeader.getCell(2).value = 'العدد';
      catHeader.getCell(1).font = { bold: true, size: 11 };
      catHeader.getCell(2).font = { bold: true, size: 11 };

      let idx = 1;
      categories.forEach((count, cat) => {
        const row = statsSheet.getRow(catStartRow + idx);
        row.getCell(1).value = cat;
        row.getCell(2).value = count;
        row.getCell(2).alignment = { horizontal: 'center' };
        idx++;
      });
    }
  }

  // تصدير
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const safeName = eventName.replace(/[^أ-يa-zA-Z0-9\s]/g, '').trim() || 'export';
  saveAs(blob, `${safeName}_الضيوف.xlsx`);
}
