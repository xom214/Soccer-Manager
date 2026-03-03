'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Shirt, CalendarDays, Trophy, BarChart3 } from 'lucide-react';
import { useData } from '@/lib/DataContext';

const navItems = [
    {
        group: 'TỔNG QUAN', items: [
            { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        ]
    },
    {
        group: 'QUẢN LÝ', items: [
            { href: '/players', label: 'Đội hình', icon: Users, badge: 'players' },
            { href: '/uniforms', label: 'Trang phục', icon: Shirt },
            { href: '/matches', label: 'Lịch thi đấu', icon: CalendarDays },
            { href: '/results', label: 'Kết quả', icon: Trophy },
        ]
    },
    {
        group: 'PHÂN TÍCH', items: [
            { href: '/performance', label: 'Hiệu suất', icon: BarChart3 },
        ]
    },
];

export default function Sidebar({ onNavClick }) {
    const pathname = usePathname();
    const { players } = useData();

    return (
        <aside className="sidebar">
            {/* Brand */}
            <div className="sidebar-brand">
                <div className="sidebar-brand__logo">⚽</div>
                <div>
                    <div className="sidebar-brand__name">Cứng Rắn FC</div>
                    <div className="sidebar-brand__role">MANAGER</div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map(group => (
                    <div key={group.group} className="sidebar-group">
                        <div className="sidebar-group__label">{group.group}</div>
                        {group.items.map(item => {
                            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
                                    onClick={onNavClick}
                                >
                                    <Icon size={18} />
                                    <span>{item.label}</span>
                                    {item.badge === 'players' && (
                                        <span className="sidebar-badge">{players.length}</span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>
        </aside>
    );
}
