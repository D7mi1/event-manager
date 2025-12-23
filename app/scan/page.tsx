'use client';

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '@/utils/supabase';
import { CheckCircle, XCircle, RefreshCcw, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<any>(null); // لحفظ نتيجة الفحص
  const [message, setMessage] = useState(''); // رسالة النجاح أو الفشل
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    // إعدادات الماسح
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    // دالة تعمل عند اكتشاف كود
    async function onScanSuccess(decodedText: string) {
      scanner.clear(); // إيقاف الكاميرا مؤقتاً
      setIsScanning(false);
      setMessage('جاري التحقق...');

      // 1. البحث عن التذكرة في قاعدة البيانات
      const { data: ticket, error } = await supabase
        .from('attendees')
        .select('*, events(name)')
        .eq('id', decodedText)
        .single();

      if (error || !ticket) {
        setScanResult({ success: false, text: 'تذكرة غير موجودة أو مزيفة' });
        return;
      }

      // 2. التحقق هل تم استخدامها سابقاً؟
      if (ticket.status === 'confirmed') {
        setScanResult({ 
          success: false, 
          text: 'تم استخدام هذه التذكرة سابقاً!',
          guest: ticket.name 
        });
        return;
      }

      // 3. تسجيل الحضور (تحديث الحالة)
      await supabase
        .from('attendees')
        .update({ status: 'confirmed' })
        .eq('id', decodedText);

      setScanResult({ 
        success: true, 
        text: 'أهلاً بك! تم تسجيل الدخول بنجاح',
        guest: ticket.name,
        event: ticket.events?.name
      });
    }

    function onScanFailure(error: any) {
      // لا نفعل شيئاً عند الفشل المستمر (لأن الكاميرا تبحث دائماً)
    }

    // تشغيل الماسح
    scanner.render(onScanSuccess, onScanFailure);

    // تنظيف عند الخروج من الصفحة
    return () => {
      scanner.clear().catch(error => console.error('Failed to clear scanner. ', error));
    };
  }, []);

  // دالة لإعادة تشغيل المسح لضيف جديد
  function resetScanner() {
    window.location.reload(); // أسهل طريقة لإعادة تهيئة الكاميرا
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center">
      
      {/* رأس الصفحة */}
      <div className="w-full flex justify-between items-center mb-6 max-w-md">
        <h1 className="text-xl font-bold">ماسح التذاكر 📸</h1>
        <Link href="/" className="bg-gray-800 p-2 rounded-full">
          <ArrowRight size={20} />
        </Link>
      </div>

      {/* منطقة الكاميرا */}
      {isScanning && (
        <div className="w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
          <div id="reader" className="w-full"></div>
          <p className="text-center text-gray-400 py-4 text-sm">وجّه الكاميرا نحو رمز QR</p>
        </div>
      )}

      {/* منطقة النتيجة (تظهر بعد المسح) */}
      {!isScanning && scanResult && (
        <div className={`w-full max-w-md p-8 rounded-2xl text-center shadow-2xl ${
          scanResult.success ? 'bg-green-600' : 'bg-red-600'
        }`}>
          
          <div className="flex justify-center mb-4">
            {scanResult.success ? (
              <CheckCircle size={64} className="text-white" />
            ) : (
              <XCircle size={64} className="text-white" />
            )}
          </div>

          <h2 className="text-2xl font-bold mb-2">
            {scanResult.success ? 'مسموح بالدخول' : 'مرفوض'}
          </h2>
          
          <p className="text-white/90 text-lg mb-6 font-medium">
            {scanResult.text}
          </p>

          {scanResult.guest && (
            <div className="bg-white/20 p-4 rounded-xl mb-6 backdrop-blur-sm">
              <p className="text-xs text-white/70">الضيف</p>
              <p className="text-xl font-bold">{scanResult.guest}</p>
              {scanResult.event && <p className="text-sm mt-1">{scanResult.event}</p>}
            </div>
          )}

          <button 
            onClick={resetScanner}
            className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center justify-center gap-2 w-full hover:bg-gray-100 transition"
          >
            <RefreshCcw size={20} />
            فحص تذكرة أخرى
          </button>
        </div>
      )}

    </div>
  );
}