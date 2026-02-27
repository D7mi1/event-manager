'use client';

import { useEffect } from 'react';

/**
 * LiveChat - شات الدعم الفني
 * ===========================
 * يدعم Crisp أو Tawk.to
 *
 * الإعداد:
 * 1. أنشئ حساب في https://crisp.chat أو https://tawk.to
 * 2. أضف NEXT_PUBLIC_CRISP_WEBSITE_ID في .env.local
 *    أو NEXT_PUBLIC_TAWK_PROPERTY_ID و NEXT_PUBLIC_TAWK_WIDGET_ID
 */

declare global {
  interface Window {
    $crisp?: any[];
    CRISP_WEBSITE_ID?: string;
    Tawk_API?: any;
  }
}

export default function LiveChat() {
  const crispId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
  const tawkPropertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
  const tawkWidgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;

  useEffect(() => {
    // لا تحمّل في Development
    if (process.env.NODE_ENV !== 'production') return;

    // Crisp
    if (crispId) {
      window.$crisp = [];
      window.CRISP_WEBSITE_ID = crispId;

      const script = document.createElement('script');
      script.src = 'https://client.crisp.chat/l.js';
      script.async = true;
      document.head.appendChild(script);

      // تخصيص Crisp للعربية
      window.$crisp.push(['set', 'session:data', [['lang', 'ar']]]);

      return () => {
        script.remove();
      };
    }

    // Tawk.to
    if (tawkPropertyId && tawkWidgetId) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}`;
      script.setAttribute('crossorigin', '*');
      document.head.appendChild(script);

      return () => {
        script.remove();
      };
    }
  }, [crispId, tawkPropertyId, tawkWidgetId]);

  // لا يعرض شيء في الـ DOM - السكربت يتحكم بالويدجت
  return null;
}
