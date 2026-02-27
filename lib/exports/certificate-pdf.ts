/**
 * شهادات حضور PDF بالعربي
 * ========================================
 * يستخدم pdfmake مع دعم RTL كامل
 * شهادات احترافية مع QR code وتوقيع
 */

import type { TDocumentDefinitions, Content, StyleDictionary } from 'pdfmake/interfaces';

export interface CertificateData {
  /** اسم الحاضر */
  attendeeName: string;
  /** اسم الفعالية */
  eventName: string;
  /** تاريخ الفعالية */
  eventDate: string;
  /** مكان الفعالية */
  eventLocation?: string;
  /** اسم المنظم */
  organizerName?: string;
  /** رقم الشهادة */
  certificateNumber?: string;
  /** رابط التحقق (QR) */
  verificationUrl?: string;
  /** نوع الشهادة */
  type?: 'attendance' | 'participation' | 'completion';
}

const CERTIFICATE_TYPES = {
  attendance: 'شهادة حضور',
  participation: 'شهادة مشاركة',
  completion: 'شهادة إتمام',
} as const;

/**
 * توليد شهادة حضور PDF
 * يعمل على Client-Side فقط
 */
export async function generateCertificatePDF(data: CertificateData): Promise<void> {
  // Dynamic import لـ pdfmake (client-side only)
  const pdfMakeModule = await import('pdfmake/build/pdfmake');
  const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

  // تسجيل الخطوط - استخدام any لأن الأنواع لا تشمل vfs
  const pdfMake = pdfMakeModule.default as any;
  const pdfFonts = (pdfFontsModule as any).default || pdfFontsModule;
  if (pdfFonts?.pdfMake?.vfs) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  } else if (typeof pdfFonts === 'object' && pdfFonts.vfs) {
    pdfMake.vfs = pdfFonts.vfs;
  }

  const certType = data.type || 'attendance';
  const certTitle = CERTIFICATE_TYPES[certType];
  const certNumber = data.certificateNumber || `MERAS-${Date.now().toString(36).toUpperCase()}`;

  // محتوى الشهادة
  const content: Content[] = [
    // إطار علوي ذهبي
    {
      canvas: [
        {
          type: 'rect',
          x: 0,
          y: 0,
          w: 515,
          h: 4,
          color: '#C19D65',
        },
      ],
      margin: [0, 0, 0, 30] as [number, number, number, number],
    },

    // شعار مِراس
    {
      text: 'مِـــــراس',
      style: 'brand',
      alignment: 'center' as const,
      margin: [0, 0, 0, 5] as [number, number, number, number],
    },
    {
      text: 'MERAS',
      style: 'brandEn',
      alignment: 'center' as const,
      margin: [0, 0, 0, 30] as [number, number, number, number],
    },

    // عنوان الشهادة
    {
      text: certTitle,
      style: 'title',
      alignment: 'center' as const,
      margin: [0, 0, 0, 30] as [number, number, number, number],
    },

    // نص الشهادة
    {
      text: 'تشهد إدارة الفعالية بأن',
      style: 'body',
      alignment: 'center' as const,
      margin: [0, 0, 0, 10] as [number, number, number, number],
    },

    // اسم الحاضر
    {
      text: data.attendeeName,
      style: 'attendeeName',
      alignment: 'center' as const,
      margin: [0, 0, 0, 15] as [number, number, number, number],
    },

    // خط زخرفي
    {
      canvas: [
        {
          type: 'line',
          x1: 150,
          y1: 0,
          x2: 365,
          y2: 0,
          lineWidth: 1,
          lineColor: '#C19D65',
        },
      ],
      margin: [0, 0, 0, 15] as [number, number, number, number],
    },

    // تفاصيل الحضور
    {
      text: `قد ${certType === 'attendance' ? 'حضر' : certType === 'participation' ? 'شارك في' : 'أتم'}`,
      style: 'body',
      alignment: 'center' as const,
      margin: [0, 0, 0, 10] as [number, number, number, number],
    },

    // اسم الفعالية
    {
      text: data.eventName,
      style: 'eventName',
      alignment: 'center' as const,
      margin: [0, 0, 0, 20] as [number, number, number, number],
    },

    // التاريخ والمكان
    {
      text: `بتاريخ: ${data.eventDate}`,
      style: 'details',
      alignment: 'center' as const,
      margin: [0, 0, 0, 5] as [number, number, number, number],
    },
  ];

  // المكان (اختياري)
  if (data.eventLocation) {
    content.push({
      text: `المكان: ${data.eventLocation}`,
      style: 'details',
      alignment: 'center' as const,
      margin: [0, 0, 0, 5] as [number, number, number, number],
    });
  }

  // مسافة قبل التوقيع
  content.push({
    text: '',
    margin: [0, 30, 0, 0] as [number, number, number, number],
  });

  // المنظم والتوقيع
  if (data.organizerName) {
    content.push(
      {
        text: data.organizerName,
        style: 'organizer',
        alignment: 'center' as const,
        margin: [0, 0, 0, 5] as [number, number, number, number],
      },
      {
        text: 'منظم الفعالية',
        style: 'details',
        alignment: 'center' as const,
        margin: [0, 0, 0, 0] as [number, number, number, number],
      }
    );
  }

  // QR Code للتحقق
  if (data.verificationUrl) {
    content.push({
      text: '',
      margin: [0, 20, 0, 0] as [number, number, number, number],
    });
    content.push({
      qr: data.verificationUrl,
      fit: 80,
      alignment: 'center' as const,
      margin: [0, 0, 0, 5] as [number, number, number, number],
    } as Content);
    content.push({
      text: 'امسح للتحقق من صحة الشهادة',
      style: 'qrLabel',
      alignment: 'center' as const,
    });
  }

  // رقم الشهادة
  content.push({
    text: `رقم الشهادة: ${certNumber}`,
    style: 'certNumber',
    alignment: 'center' as const,
    margin: [0, 20, 0, 0] as [number, number, number, number],
  });

  // إطار سفلي
  content.push({
    canvas: [
      {
        type: 'rect',
        x: 0,
        y: 0,
        w: 515,
        h: 4,
        color: '#C19D65',
      },
    ],
    margin: [0, 30, 0, 0] as [number, number, number, number],
  });

  // الأنماط
  const styles: StyleDictionary = {
    brand: {
      fontSize: 28,
      bold: true,
      color: '#C19D65',
    },
    brandEn: {
      fontSize: 10,
      color: '#999999',
      characterSpacing: 6,
    },
    title: {
      fontSize: 24,
      bold: true,
      color: '#1A1A2E',
    },
    body: {
      fontSize: 14,
      color: '#444444',
      lineHeight: 1.8,
    },
    attendeeName: {
      fontSize: 26,
      bold: true,
      color: '#1A1A2E',
    },
    eventName: {
      fontSize: 18,
      bold: true,
      color: '#C19D65',
    },
    details: {
      fontSize: 12,
      color: '#666666',
    },
    organizer: {
      fontSize: 14,
      bold: true,
      color: '#333333',
    },
    qrLabel: {
      fontSize: 8,
      color: '#999999',
    },
    certNumber: {
      fontSize: 8,
      color: '#BBBBBB',
      characterSpacing: 2,
    },
  };

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [40, 40, 40, 40],
    content,
    styles,
    defaultStyle: {
      font: 'Roboto',
    },
    info: {
      title: `${certTitle} - ${data.attendeeName}`,
      author: 'Meras - مِراس',
      subject: certTitle,
    },
  };

  pdfMake.createPdf(docDefinition).download(
    `شهادة_${data.attendeeName.replace(/\s/g, '_')}.pdf`
  );
}

/**
 * توليد شهادات جماعية (لجميع الحضور)
 */
export async function generateBulkCertificates(
  attendees: Array<{ name: string; id: string }>,
  eventInfo: {
    eventName: string;
    eventDate: string;
    eventLocation?: string;
    organizerName?: string;
    baseVerificationUrl?: string;
  }
): Promise<void> {
  for (const attendee of attendees) {
    await generateCertificatePDF({
      attendeeName: attendee.name,
      eventName: eventInfo.eventName,
      eventDate: eventInfo.eventDate,
      eventLocation: eventInfo.eventLocation,
      organizerName: eventInfo.organizerName,
      verificationUrl: eventInfo.baseVerificationUrl
        ? `${eventInfo.baseVerificationUrl}?cert=${attendee.id}`
        : undefined,
      type: 'attendance',
    });

    // تأخير بسيط بين كل شهادة لتجنب مشاكل المتصفح
    await new Promise((r) => setTimeout(r, 500));
  }
}
