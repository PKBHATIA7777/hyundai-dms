import { useState, useCallback, useRef } from 'react';

let toastHandlerRef = null;

export const toast = {
    success: (message, duration = 4000) => toastHandlerRef?.add('success', message, duration),
    error:   (message, duration = 5000) => toastHandlerRef?.add('error',   message, duration),
    info:    (message, duration = 4000) => toastHandlerRef?.add('info',    message, duration),
    warning: (message, duration = 4000) => toastHandlerRef?.add('warning', message, duration),
};

const STYLES = {
    success: { background: '#E8F5E9', border: '1px solid #A5D6A7', color: '#1B5E20', icon: '✓' },
    error:   { background: '#FFEBEE', border: '1px solid #EF9A9A', color: '#B71C1C', icon: '✕' },
    info:    { background: '#E3F2FD', border: '1px solid #90CAF9', color: '#0D47A1', icon: 'ℹ' },
    warning: { background: '#FFF8E1', border: '1px solid #FFE082', color: '#E65100', icon: '⚠' },
};

export const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);
    const counterRef = useRef(0);

    const add = useCallback((type, message, duration) => {
        const id = ++counterRef.current;
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    toastHandlerRef = { add };

    return (
        <div style={{
            position: 'fixed', top: '20px', right: '20px',
            zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px',
            maxWidth: '360px', width: '100%'
        }}>
            {toasts.map(t => {
                const s = STYLES[t.type] || STYLES.info;
                return (
                    <div key={t.id} style={{
                        background: s.background, border: s.border, color: s.color,
                        borderRadius: '8px', padding: '14px 16px',
                        display: 'flex', alignItems: 'flex-start', gap: '10px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        animation: 'slideInRight 0.3s ease',
                        fontSize: '14px', fontWeight: 500, lineHeight: 1.4
                    }}>
                        <span style={{ fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>{s.icon}</span>
                        <span style={{ flex: 1 }}>{t.message}</span>
                        <button
                            onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                            style={{ background: 'none', border: 'none', color: s.color, cursor: 'pointer', fontSize: '16px', padding: '0', lineHeight: 1, opacity: 0.6, flexShrink: 0 }}
                        >
                            ✕
                        </button>
                    </div>
                );
            })}
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
            `}</style>
        </div>
    );
};