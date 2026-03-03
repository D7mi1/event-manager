'use client';

import { useEffect } from 'react';

/**
 * LiveChat - شات الدعم الفني
 * ===========================
 * يدعم Chatwoot (الأفضل) أو Crisp أو Tawk.to
 * الأولوية: Chatwoot > Crisp > Tawk.to
 *
 * الإعداد:
 * - Chatwoot: NEXT_PUBLIC_CHATWOOT_BASE_URL و NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN
 * - Crisp: NEXT_PUBLIC_CRISP_WEBSITE_ID
 * - Tawk.to: NEXT_PUBLIC_TAWK_PROPERTY_ID و NEXT_PUBLIC_TAWK_WIDGET_ID
 */

declare global {
  interface Window {
    $crisp?: any[];
    CRISP_WEBSITE_ID?: string;
    Tawk_API?: any;
    chatwootSettings?: any;
    chatwootSDK?: any;
  }
}

export default function LiveChat() {
  // Chatwoot (الخيار الأول - مفتوح المصدر + يدعم واتساب)
  const chatwootBaseUrl = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL;
  const chatwootToken = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN;

  // Crisp (الخيار الثاني)
  const crispId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;

  // Tawk.to (الخيار الثالث)
  const tawkPropertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
  const tawkWidgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;

  useEffect(() => {
    // لا تحمّل في Development
    if (process.env.NODE_ENV !== 'production') return;

    // 1️⃣ Chatwoot (الأفضل - يدعم واتساب + إيميل + شات من inbox واحد)
    if (chatwootBaseUrl && chatwootToken) {
      window.chatwootSettings = {
        hideMessageBubble: false,
        position: 'left', // RTL - الشات على اليسار
        locale: 'ar',
        type: 'standard',
        darkMode: 'auto',
      };

      const script = document.createElement('script');
      script.src = `${chatwootBaseUrl}/packs/js/sdk.js`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.chatwootSDK?.run({
          websiteToken: chatwootToken,
          baseUrl: chatwootBaseUrl,
        });
      };
      document.head.appendChild(script);

      return () => {
        script.remove();
      };
    }

    // 2️⃣ Crisp
    if (crispId) {
      window.$crisp = [];
      window.CRISP_WEBSITE_ID = crispId;

      const script = document.createElement('script');
      script.src = 'https://client.crisp.chat/l.js';
      script.async = true;
      document.head.appendChild(script);

      window.$crisp.push(['set', 'session:data', [['lang', 'ar']]]);

      return () => {
        script.remove();
      };
    }

    // 3️⃣ Tawk.to
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
  }, [chatwootBaseUrl, chatwootToken, crispId, tawkPropertyId, tawkWidgetId]);

  return null;
}
