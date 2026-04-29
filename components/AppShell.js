'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useData } from '@/lib/DataContext';
import Sidebar from '@/components/Sidebar';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut, User, Shield, LayoutDashboard, Users, Calendar, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function AppShell({ children }) {
    const { user, loading: authLoading, signOut, authEnabled, isAdmin } = useAuth();
    const { seasons, selectedSeasonId, setSelectedSeasonId, loading: dataLoading } = useData();
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const loading = authLoading || dataLoading;

    // Redirect logic
    useEffect(() => {
        if (!loading) {
            if (!user && authEnabled && pathname !== '/login') {
                router.push('/login');
            } else if (user && pathname === '/login') {
                router.push('/');
            }
        }
    }, [user, loading, authEnabled, pathname, router]);

    // Don't show shell on login page
    if (pathname === '/login') {
        return children;
    }

    // Loading state or redirecting state
    if (loading || (!user && authEnabled)) {
        return (
            <div className="loading-screen" style={{ minHeight: '100vh' }}>
                <div className="loading-spinner" />
                <p className="text-sm text-[var(--text-muted)]">
                    {loading ? 'Đang tải...' : 'Chuyển hướng...'}
                </p>
            </div>
        );
    }

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <div className="app-layout">
            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'sidebar-overlay--visible' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <div className={`sidebar-wrapper ${sidebarOpen ? 'sidebar-wrapper--open' : ''}`}>
                <Sidebar onNavClick={() => setSidebarOpen(false)} />
            </div>

            <main className="app-main">
                {/* Mobile Top Header */}
                <div className="mobile-header">
                    <button className="mobile-header__menu" onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <div className="mobile-header__logo">⚽ Cứng Rắn FC</div>
                    <div className="flex-1 px-2">
                        {seasons && seasons.length > 0 && (
                            <select
                                className="w-full bg-transparent text-sm font-semibold border-b border-[var(--primary)] text-[var(--text-main)] focus:outline-none"
                                value={selectedSeasonId || ''}
                                onChange={(e) => setSelectedSeasonId(e.target.value)}
                            >
                                <option value="all">Tất cả mùa giải</option>
                                {seasons.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className="mobile-header__user">
                        <div className={`app-topbar__user-avatar ${isAdmin ? 'bg-[var(--primary)]' : 'bg-gray-500'} mr-2`}>
                            {isAdmin ? <Shield size={16} /> : <User size={16} />}
                        </div>
                        <button
                            className="app-topbar__logout"
                            onClick={handleSignOut}
                            title="Thoát"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* Desktop Topbar */}
                <div className="desktop-topbar flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {seasons && seasons.length > 0 && (
                            <select
                                className="form-select bg-white border border-gray-200 rounded-md py-1 px-3 text-sm font-semibold focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                                value={selectedSeasonId || ''}
                                onChange={(e) => setSelectedSeasonId(e.target.value)}
                            >
                                <option value="all">Tất cả mùa giải</option>
                                {seasons.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className="app-topbar__spacer" />
                    <div className="app-topbar__user">
                        {user && (
                            <>
                                <div className={`app-topbar__user-avatar ${isAdmin ? 'bg-[var(--primary)]' : 'bg-gray-500'}`}>
                                    {isAdmin ? <Shield size={16} /> : <User size={16} />}
                                </div>
                                <div className="flex flex-col ml-2 mr-4">
                                    <span className="app-topbar__user-name leading-none">
                                        {isAdmin ? 'Quản trị viên' : 'Người xem'}
                                    </span>
                                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                                        {isAdmin ? 'Quyền chỉnh sửa' : 'Chỉ xem'}
                                    </span>
                                </div>
                                <button
                                    className="app-topbar__logout"
                                    onClick={handleSignOut}
                                    title="Thoát"
                                >
                                    <LogOut size={16} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="app-scroll-area">
                    {children}
                </div>

                {/* Mobile Bottom Navigation */}
                <nav className="mobile-nav">
                    <Link href="/" className={`mobile-nav__item ${pathname === '/' ? 'mobile-nav__item--active' : ''}`}>
                        <LayoutDashboard size={20} />
                        <span>Tổng quan</span>
                    </Link>
                    <Link href="/players" className={`mobile-nav__item ${pathname === '/players' ? 'mobile-nav__item--active' : ''}`}>
                        <Users size={20} />
                        <span>Đội hình</span>
                    </Link>
                    <Link href="/matches" className={`mobile-nav__item ${pathname === '/matches' ? 'mobile-nav__item--active' : ''}`}>
                        <Calendar size={20} />
                        <span>Lịch đấu</span>
                    </Link>
                    <Link href="/results" className={`mobile-nav__item ${pathname === '/results' ? 'mobile-nav__item--active' : ''}`}>
                        <Trophy size={20} />
                        <span>Kết quả</span>
                    </Link>
                </nav>
            </main>
        </div>
    );
}
