/**
 * Apple Wallet + Google Wallet Pass
 * ========================================
 * أنواع ومساعدات لتوليد Wallet Passes
 * يعمل على Server-Side فقط
 */

export interface WalletPassData {
  /** معرف التذكرة */
  ticketId: string;
  /** اسم الضيف */
  guestName: string;
  /** اسم الفعالية */
  eventName: string;
  /** تاريخ ووقت الفعالية */
  eventDate: string;
  /** مكان الفعالية */
  eventLocation: string;
  /** إحداثيات المكان */
  coordinates?: { lat: number; lng: number };
  /** رقم المقعد (اختياري) */
  seatNumber?: string;
  /** التصنيف (VIP, عام, إلخ) */
  category?: string;
  /** رابط QR code */
  qrData: string;
  /** لون الخلفية (hex) */
  backgroundColor?: string;
  /** لون النص (hex) */
  foregroundColor?: string;
}

export interface WalletPassConfig {
  apple: {
    teamId: string;
    passTypeId: string;
    /** مسار ملف الشهادة .pem */
    certPath: string;
    /** مسار ملف المفتاح الخاص .pem */
    keyPath: string;
    /** كلمة مرور المفتاح (اختياري) */
    keyPassword?: string;
  };
  google: {
    issuerId: string;
    classId: string;
    /** بيانات Service Account JSON */
    credentials: string;
  };
}

/**
 * إنشاء Apple Wallet Pass
 * يحتاج: Apple Developer Account + Pass Type ID + شهادات
 */
export async function generateApplePass(data: WalletPassData): Promise<Buffer> {
  // Dynamic import لأن passkit-generator يعمل server-side فقط
  const { PKPass } = await import('passkit-generator');

  const pass = new PKPass(
    {},
    {
      wwdr: process.env.APPLE_WWDR_CERT_PATH || '',
      signerCert: process.env.APPLE_PASS_CERT_PATH || '',
      signerKey: process.env.APPLE_PASS_KEY_PATH || '',
      signerKeyPassphrase: process.env.APPLE_PASS_KEY_PASSWORD,
    },
    {
      serialNumber: data.ticketId,
      description: `تذكرة ${data.eventName}`,
      organizationName: 'مِراس - Meras',
      passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID || '',
      teamIdentifier: process.env.APPLE_TEAM_ID || '',
      foregroundColor: data.foregroundColor || 'rgb(255, 255, 255)',
      backgroundColor: data.backgroundColor || 'rgb(15, 15, 18)',
      labelColor: 'rgb(193, 157, 101)',
    }
  );

  // نوع التذكرة: eventTicket
  pass.type = 'eventTicket';

  // Header fields
  pass.headerFields.push({
    key: 'category',
    label: 'التصنيف',
    value: data.category || 'عام',
  });

  // Primary fields
  pass.primaryFields.push({
    key: 'eventName',
    label: 'الفعالية',
    value: data.eventName,
  });

  // Secondary fields
  pass.secondaryFields.push(
    {
      key: 'guestName',
      label: 'اسم الضيف',
      value: data.guestName,
    },
    {
      key: 'date',
      label: 'التاريخ',
      value: data.eventDate,
    }
  );

  // Auxiliary fields
  if (data.eventLocation) {
    pass.auxiliaryFields.push({
      key: 'location',
      label: 'المكان',
      value: data.eventLocation,
    });
  }

  if (data.seatNumber) {
    pass.auxiliaryFields.push({
      key: 'seat',
      label: 'المقعد',
      value: data.seatNumber,
    });
  }

  // Barcode
  pass.setBarcodes({
    format: 'PKBarcodeFormatQR',
    message: data.qrData,
    messageEncoding: 'iso-8859-1',
  });

  // Location (إذا توفرت الإحداثيات)
  if (data.coordinates) {
    pass.setLocations({
      latitude: data.coordinates.lat,
      longitude: data.coordinates.lng,
      relevantText: `أنت بالقرب من ${data.eventLocation}`,
    });
  }

  // Relevance date
  if (data.eventDate) {
    try {
      pass.setRelevantDate(new Date(data.eventDate));
    } catch {
      // تجاهل إذا كان التاريخ غير صالح
    }
  }

  return pass.getAsBuffer();
}

/**
 * إنشاء Google Wallet Pass URL
 * يحتاج: Google Cloud Console + Service Account
 */
export async function generateGoogleWalletUrl(data: WalletPassData): Promise<string> {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  const classId = process.env.GOOGLE_WALLET_CLASS_ID;

  if (!issuerId || !classId) {
    throw new Error('Google Wallet credentials not configured');
  }

  // بناء JWT payload لـ Google Wallet
  const payload = {
    iss: process.env.GOOGLE_WALLET_SERVICE_EMAIL,
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    origins: [process.env.NEXT_PUBLIC_APP_URL || 'https://meras.app'],
    payload: {
      genericObjects: [
        {
          id: `${issuerId}.${data.ticketId}`,
          classId: `${issuerId}.${classId}`,
          state: 'ACTIVE',
          header: {
            defaultValue: {
              language: 'ar',
              value: data.eventName,
            },
          },
          subheader: {
            defaultValue: {
              language: 'ar',
              value: data.guestName,
            },
          },
          textModulesData: [
            {
              id: 'date',
              header: 'التاريخ',
              body: data.eventDate,
            },
            {
              id: 'location',
              header: 'المكان',
              body: data.eventLocation,
            },
            ...(data.seatNumber
              ? [{ id: 'seat', header: 'المقعد', body: data.seatNumber }]
              : []),
          ],
          barcode: {
            type: 'QR_CODE',
            value: data.qrData,
          },
          hexBackgroundColor: data.backgroundColor || '#0F0F12',
        },
      ],
    },
  };

  // في البيئة الحقيقية: توقيع JWT بـ Service Account key
  // هنا نرجع URL placeholder
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

  return `https://pay.google.com/gp/v/save/${encodedPayload}`;
}
