'use client';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, footer }) {
    const overlayRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
            <div className="modal-content animate-scale-in w-full max-w-lg mx-4">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                {/* Body */}
                <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
                    {children}
                </div>
                {/* Footer */}
                {footer && (
                    <div className="flex items-center gap-3 px-6 py-4 border-t border-white/10">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
