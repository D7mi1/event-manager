'use client';

import { useState, useRef, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { supabase } from '@/app/utils/supabase/client';
import { Attendee } from '@/types';
import { Loader2, CheckCircle2, XCircle, AlertTriangle, ScanLine } from 'lucide-react';

type ScanStatus = 'idle' | 'processing' | 'success' | 'error' | 'warning';

interface ScanResult {
    status: ScanStatus;
    message: string;
    attendee?: Attendee;
}

export default function ScannerPage() {
    const [result, setResult] = useState<ScanResult>({ status: 'idle', message: 'جاهز للمسح' });
    const [lastScannedId, setLastScannedId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Sound effects (optional, can be added later, just placeholder for now)
    const playSound = (type: 'success' | 'error') => {
        // Implement sound feedback if assets exist
    };

    const handleScan = async (detectedCodes: any[]) => {
        if (detectedCodes.length === 0) return;

        const rawValue = detectedCodes[0].rawValue;
        if (!rawValue || rawValue === lastScannedId || result.status === 'processing') return;

        setLastScannedId(rawValue);
        setResult({ status: 'processing', message: 'جاري التحقق...' });

        try {
            // 1. Fetch Attendee
            const { data: attendee, error } = await supabase
                .from('attendees')
                .select('*, events(*)')
                .eq('id', rawValue)
                .single();

            if (error || !attendee) {
                setResult({ status: 'error', message: 'التذكرة غير موجودة أو غير صالحة' });
                playSound('error');
                return;
            }

            // 2. Check if already attended
            if (attendee.status === 'attended') {
                setResult({
                    status: 'warning',
                    message: 'تم تحضير الضيف مسبقاً!',
                    attendee: attendee as Attendee
                });
                playSound('error');
                return;
            }

            // 3. Mark as attended
            const { error: updateError } = await supabase
                .from('attendees')
                .update({ status: 'attended' })
                .eq('id', rawValue);

            if (updateError) throw updateError;

            setResult({
                status: 'success',
                message: 'تم التحضير بنجاح',
                attendee: attendee as Attendee
            });
            playSound('success');

        } catch (err) {
            console.error(err);
            setResult({ status: 'error', message: 'حدث خطأ في النظام' });
        }
    };

    // Auto-reset idle state after error/warning to allow new scans quickly
    useEffect(() => {
        if (result.status !== 'idle' && result.status !== 'processing') {
            const timer = setTimeout(() => {
                // We don't verify 'success' automatically to let the guard see the name
                if (result.status === 'error' || result.status === 'warning') {
                    // Optional: Auto reset or keep it until manual reset? 
                    // Let's keep it for 3 seconds then allow rescan, but scan logic handles "lastScannedId"
                }
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [result.status]);

    const resetScanner = () => {
        setResult({ status: 'idle', message: 'جاهز للمسح' });
        setLastScannedId(null);
    };

    // Determine UI colors based on status
    const getStatusColor = () => {
        switch (result.status) {
            case 'success': return 'bg-green-500';
            case 'error': return 'bg-red-500';
            case 'warning': return 'bg-yellow-500';
            case 'processing': return 'bg-blue-500';
            default: return 'bg-white/10';
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans" dir="rtl">

            {/* Scanner Area */}
            <div className="flex-1 relative overflow-hidden bg-black">
                <Scanner
                    onScan={handleScan}
                    styles={{
                        container: { height: '100%', width: '100%' },
                        video: { height: '100%', objectFit: 'cover' }
                    }}
                />

                {/* Overlay Guide */}
                <div className="absolute inset-0 border-[30px] border-black/50 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-2 border-white/20 rounded-3xl relative animate-pulse">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-xl"></div>
                    </div>
                </div>

                {/* Top Header */}
                <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2"><ScanLine className="text-blue-500" /> الماسح الضوئي</h1>
                        <p className="text-xs text-white/50">قم بتوجيه الكاميرا نحو رمز QR للتذكرة</p>
                    </div>
                </div>
            </div>

            {/* Results Area - Slide Up Panel */}
            <div className={`
        relative z-20 transition-all duration-500 ease-spring
        ${result.status === 'idle' ? 'h-32 bg-black/90' : 'h-[45vh] bg-[#18181B] rounded-t-[2.5rem]'}
      `}>
                <div className="h-full flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">

                    {/* Status Indicator Bar */}
                    <div className={`absolute top-0 left-0 w-full h-2 transition-colors duration-300 ${getStatusColor()}`}></div>

                    {result.status === 'idle' && (
                        <div className="text-white/40 flex flex-col items-center gap-2 animate-pulse">
                            <ScanLine size={32} />
                            <p>بانتظار المسح...</p>
                        </div>
                    )}

                    {result.status === 'processing' && (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-blue-500" size={48} />
                            <h2 className="text-xl font-bold">جاري التحقق...</h2>
                        </div>
                    )}

                    {result.status === 'success' && result.attendee && (
                        <div className="w-full h-full flex flex-col items-center justify-center animate-in slide-in-from-bottom duration-500">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="text-green-500" size={40} />
                            </div>
                            <h2 className="text-3xl font-black mb-2 text-green-500">أهلاً بك!</h2>
                            <h3 className="text-2xl text-white font-bold mb-1">{result.attendee.name}</h3>
                            <p className="text-white/50 text-sm mb-6">{result.attendee.events?.name}</p>
                            <div className="flex gap-2 text-xs font-mono text-white/30 bg-white/5 px-4 py-2 rounded-full">
                                <span>ID: {result.attendee.id.slice(0, 8)}</span>
                            </div>
                            <button onClick={resetScanner} className="mt-8 bg-white/10 hover:bg-white/20 px-8 py-3 rounded-xl font-bold transition-all">
                                مسح تذكرة أخرى
                            </button>
                        </div>
                    )}

                    {result.status === 'warning' && result.attendee && (
                        <div className="w-full h-full flex flex-col items-center justify-center animate-in slide-in-from-bottom duration-500">
                            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="text-yellow-500" size={40} />
                            </div>
                            <h2 className="text-2xl font-black mb-2 text-yellow-500">نتبه! تم التحضير مسبقاً</h2>
                            <h3 className="text-xl text-white font-bold mb-6">{result.attendee.name}</h3>
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-xs text-yellow-200 w-full max-w-xs">
                                هذه التذكرة تم مسحها سابقاً، يرجى التأكد من هوية الحامل.
                            </div>
                            <button onClick={resetScanner} className="mt-8 bg-white/10 hover:bg-white/20 px-8 py-3 rounded-xl font-bold transition-all">
                                متابعة
                            </button>
                        </div>
                    )}

                    {result.status === 'error' && (
                        <div className="w-full h-full flex flex-col items-center justify-center animate-in slide-in-from-bottom duration-500">
                            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                                <XCircle className="text-red-500" size={40} />
                            </div>
                            <h2 className="text-2xl font-black mb-2 text-red-500">خطأ في التذكرة</h2>
                            <p className="text-white/60 mb-8">{result.message}</p>
                            <button onClick={resetScanner} className="mt-auto bg-white/10 hover:bg-white/20 px-8 py-3 rounded-xl font-bold transition-all">
                                المحاولة مرة أخرى
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}