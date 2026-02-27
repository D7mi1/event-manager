import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
const listeners: Set<Listener> = new Set();

const notify = () => {
    listeners.forEach((listener) => listener([...toasts]));
};

export const toast = {
    success: (message: string) => addToast(message, 'success'),
    error: (message: string) => addToast(message, 'error'),
    info: (message: string) => addToast(message, 'info'),
};

const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type };
    toasts = [...toasts, newToast];
    notify();

    // Auto remove after 3 seconds
    setTimeout(() => {
        removeToast(id);
    }, 4000);
};

export const removeToast = (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
};

export const useToasts = () => {
    const [activeToasts, setActiveToasts] = useState<Toast[]>(toasts);

    useEffect(() => {
        listeners.add(setActiveToasts);
        return () => {
            listeners.delete(setActiveToasts);
        };
    }, []);

    return { toasts: activeToasts, removeToast };
};
