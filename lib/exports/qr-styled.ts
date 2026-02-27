/**
 * QR Code مخصص مع لوقو وألوان
 * ========================================
 * يستخدم qr-code-styling لتوليد QR codes
 * مع تصميم مخصص يطابق هوية الفعالية
 */

import QRCodeStyling, { type Options } from 'qr-code-styling';

export interface StyledQROptions {
  /** البيانات المراد ترميزها */
  data: string;
  /** حجم QR بالبكسل (افتراضي: 300) */
  size?: number;
  /** رابط صورة اللوقو في المنتصف */
  logoUrl?: string;
  /** لون النقاط (افتراضي: ذهبي مِراس) */
  dotsColor?: string;
  /** لون الخلفية (افتراضي: شفاف) */
  bgColor?: string;
  /** شكل النقاط */
  dotsType?: 'rounded' | 'classy' | 'classy-rounded' | 'square' | 'dots' | 'extra-rounded';
  /** شكل زوايا المربعات */
  cornerSquareType?: 'dot' | 'square' | 'extra-rounded';
  /** لون زوايا المربعات */
  cornerSquareColor?: string;
  /** لون النقاط الداخلية للزوايا */
  cornerDotColor?: string;
}

// ألوان مِراس الافتراضية
const MERAS_GOLD = '#C19D65';
const MERAS_DARK = '#0F0F12';

/**
 * إنشاء QR Code مخصص
 */
export function createStyledQR(options: StyledQROptions): QRCodeStyling {
  const {
    data,
    size = 300,
    logoUrl,
    dotsColor = MERAS_GOLD,
    bgColor = 'transparent',
    dotsType = 'rounded',
    cornerSquareType = 'extra-rounded',
    cornerSquareColor = dotsColor,
    cornerDotColor = MERAS_DARK,
  } = options;

  const qrOptions: Options = {
    width: size,
    height: size,
    data,
    type: 'svg',
    dotsOptions: {
      color: dotsColor,
      type: dotsType,
    },
    backgroundOptions: {
      color: bgColor,
    },
    cornersSquareOptions: {
      type: cornerSquareType,
      color: cornerSquareColor,
    },
    cornersDotOptions: {
      type: 'dot',
      color: cornerDotColor,
    },
    qrOptions: {
      errorCorrectionLevel: 'M',
    },
  };

  // إضافة اللوقو إذا كان موجوداً
  if (logoUrl) {
    qrOptions.image = logoUrl;
    qrOptions.imageOptions = {
      crossOrigin: 'anonymous',
      margin: 8,
      imageSize: 0.35,
    };
    // عند وجود لوقو نحتاج error correction أعلى
    if (qrOptions.qrOptions) {
      qrOptions.qrOptions.errorCorrectionLevel = 'H';
    }
  }

  return new QRCodeStyling(qrOptions);
}

/**
 * تحميل QR كصورة PNG
 */
export async function downloadQRAsPng(
  qrCode: QRCodeStyling,
  filename: string = 'qr-code'
): Promise<void> {
  await qrCode.download({
    name: filename,
    extension: 'png',
  });
}

/**
 * تحميل QR كصورة SVG
 */
export async function downloadQRAsSvg(
  qrCode: QRCodeStyling,
  filename: string = 'qr-code'
): Promise<void> {
  await qrCode.download({
    name: filename,
    extension: 'svg',
  });
}

/**
 * الحصول على QR كـ Data URL (للعرض أو الإرسال)
 */
export async function getQRAsDataUrl(options: StyledQROptions): Promise<string> {
  const qr = createStyledQR({ ...options, size: options.size || 400 });

  // استخدام canvas لتوليد data URL
  const canvas = document.createElement('canvas');
  canvas.width = options.size || 400;
  canvas.height = options.size || 400;

  const container = document.createElement('div');
  container.style.display = 'none';
  document.body.appendChild(container);

  qr.append(container);

  // انتظار الرسم
  await new Promise((resolve) => setTimeout(resolve, 200));

  const svgElement = container.querySelector('svg');
  if (!svgElement) {
    document.body.removeChild(container);
    throw new Error('Failed to generate QR code');
  }

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  document.body.removeChild(container);

  return url;
}

/**
 * ثيمات QR جاهزة
 */
export const QR_THEMES = {
  /** الثيم الذهبي الافتراضي لمِراس */
  merasGold: {
    dotsColor: MERAS_GOLD,
    bgColor: 'transparent',
    dotsType: 'rounded' as const,
    cornerSquareColor: MERAS_GOLD,
    cornerDotColor: MERAS_DARK,
  },
  /** ثيم داكن أنيق */
  darkElegant: {
    dotsColor: '#FFFFFF',
    bgColor: MERAS_DARK,
    dotsType: 'classy-rounded' as const,
    cornerSquareColor: MERAS_GOLD,
    cornerDotColor: '#FFFFFF',
  },
  /** ثيم كلاسيكي */
  classic: {
    dotsColor: '#1A1A2E',
    bgColor: '#FFFFFF',
    dotsType: 'square' as const,
    cornerSquareColor: '#1A1A2E',
    cornerDotColor: '#1A1A2E',
  },
  /** ثيم ملكي */
  royal: {
    dotsColor: '#6B21A8',
    bgColor: 'transparent',
    dotsType: 'dots' as const,
    cornerSquareColor: MERAS_GOLD,
    cornerDotColor: '#6B21A8',
  },
} as const;
