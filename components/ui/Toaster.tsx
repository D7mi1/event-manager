'use client';

import { useToasts, removeToast, ToastType } from '@/app/utils/toast-store';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

const icons = {
    success: <CheckCircle2 className="text-green-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
};

const bgColors = {
    success: 'bg-green-500/10 border-green-500/20',
    error: 'bg-red-500/10 border-red-500/20',
    info: 'bg-blue-500/10 border-blue-500/20',
};

export default function Toaster() {
    const { toasts } = useToasts();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-md px-4 pointer-events-none">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`
            pointer-events-auto
            flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl
            animate-in slide-in-from-top-5 fade-in zoom-in duration-300
            ${bgColors[t.type]}
          `}
                >
                    <div className="shrink-0">{icons[t.type]}</div>
                    <p className="text-sm font-bold text-white flex-1">{t.message}</p>
                    <button
                        onClick={() => removeToast(t.id)}
                        className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
}
