'use client';

import { useState } from 'react';
import { Copy, Wand2, Share2, Check, Loader2 } from 'lucide-react';
import { createShortLink, generateInviteMessage } from '@/app/actions/shareActions';
import { toast } from 'sonner';

interface Props {
    guestName: string;
    eventName: string;
    originalLink: string;
}

export default function ShareInvite({ guestName, eventName, originalLink }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [generatedText, setGeneratedText] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            // اختصار الرابط + توليد النص
            const shortUrl = await createShortLink(originalLink);
            const text = await generateInviteMessage(guestName, eventName, shortUrl);
            setGeneratedText(text);
        } catch (error) {
            toast.error('حدث خطأ، حاول مرة أخرى');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareViaWhatsapp = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(generatedText)}`;
        window.open(url, '_blank');
    };

    return (
        <>
            <button
                onClick={() => { setIsOpen(true); handleGenerate(); }}
                className="flex items-center gap-2 bg-[#C19D65] text-black px-4 py-2 rounded-xl font-bold hover:bg-[#A4824E] transition-all shadow-lg"
            >
                <Share2 size={18} /> مشاركة الدعوة
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#18181B] border border-white/10 w-full max-w-md rounded-3xl p-6 relative animate-in zoom-in duration-300">
                        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">✕</button>

                        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                            <Wand2 className="text-[#C19D65]" size={20} /> دعوة ذكية
                        </h3>
                        <p className="text-white/40 text-sm mb-6">جاري صياغة دعوة خاصة واختصار الرابط...</p>

                        {loading ? (
                            <div className="h-32 flex flex-col items-center justify-center text-[#C19D65]">
                                <Loader2 className="animate-spin mb-2" size={32} />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-white/90 whitespace-pre-line text-sm leading-relaxed" dir="rtl">
                                    {generatedText}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={copyToClipboard} className="flex items-center justify-center gap-2 bg-white/10 text-white py-3 rounded-xl font-bold">
                                        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />} النسخ
                                    </button>
                                    <button onClick={shareViaWhatsapp} className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-bold">
                                        <Share2 size={18} /> واتساب
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}