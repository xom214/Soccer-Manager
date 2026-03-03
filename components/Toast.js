'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`toast-item toast-item--${t.type} animate-slide-in`}
                    >
                        {t.type === 'success' && <CheckCircle size={18} />}
                        {t.type === 'error' && <XCircle size={18} />}
                        {t.type === 'warning' && <AlertTriangle size={18} />}
                        {t.type === 'info' && <Info size={18} />}
                        <span className="flex-1 text-sm">{t.message}</span>
                        <button onClick={() => removeToast(t.id)} className="opacity-60 hover:opacity-100 transition-opacity">
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
