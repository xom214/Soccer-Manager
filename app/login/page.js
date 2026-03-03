'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { KeyRound, Shield, Eye, ArrowRight, Loader2, Lock } from 'lucide-react';

export default function LoginPage() {
    const { loginWithPIN, loginAsGuest } = useAuth();
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePINSubmit = async (e) => {
        e.preventDefault();
        if (!pin.trim()) return;
        setLoading(true);
        setError('');
        try {
            await loginWithPIN(pin.trim());
            // Auth state change will redirect automatically via AppShell
        } catch (err) {
            setError(err.message || 'Mã PIN không chính xác');
        }
        setLoading(false);
    };

    const handleGuestEntry = async () => {
        setLoading(true);
        try {
            await loginAsGuest();
        } catch (err) {
            setError('Không thể truy cập vào chế độ xem');
        }
        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-card animate-scale-in">
                {/* Logo */}
                <div className="login-logo">
                    <div className="login-logo__icon">⚽</div>
                    <h1 className="login-logo__title">Cứng Rắn FC</h1>
                    <p className="login-logo__sub">Quản Lý Đội Bóng</p>
                </div>

                <div className="login-form">
                    <div className="login-form__desc">
                        Nhập mã PIN để quản lý đội bóng hoặc truy cập quyền Xem.
                    </div>

                    <form onSubmit={handlePINSubmit}>
                        <div className="form-group">
                            <label className="form-label">Mã PIN Đội Bóng</label>
                            <div className="relative">
                                <input
                                    className="form-input text-center text-2xl tracking-[1em] font-bold"
                                    type="password"
                                    maxLength={4}
                                    value={pin}
                                    onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                                    placeholder="****"
                                    autoFocus
                                    required
                                />
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                            </div>
                        </div>

                        {error && <div className="login-error text-center mb-4">{error}</div>}

                        <button
                            className="btn btn--primary w-full"
                            type="submit"
                            disabled={loading || pin.length < 4}
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                            {loading ? 'Đang xác nhận...' : 'Đăng nhập Quản trị'}
                        </button>
                    </form>

                    <div className="login-divider">
                        <span>HOẶC</span>
                    </div>

                    <button
                        className="btn btn--ghost w-full"
                        onClick={handleGuestEntry}
                        disabled={loading}
                    >
                        <Eye size={16} /> Chỉ xem (Read-only)
                    </button>
                </div>

                {/* Footer */}
                <div className="login-footer">
                    <Shield size={12} />
                    Hệ thống quản lý nội bộ Cứng Rắn FC
                </div>
            </div>
        </div>
    );
}
