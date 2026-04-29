'use client';
import { useState } from 'react';
import { useData } from '@/lib/DataContext';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import { Plus, Save, Trash2, ChevronLeft, ChevronRight, Shirt } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS_VI = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

function formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

export default function MatchesPage() {
    const { activeMatches, uniforms, addMatch, updateMatch, deleteMatch, getUniformById, getResultByMatchId, loading, selectedSeasonId } = useData();
    const { isAdmin } = useAuth();
    const showToast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMatch, setEditingMatch] = useState(null);
    const [form, setForm] = useState({ opponent: '', date: '', location: '', uniformId: '', status: 'upcoming' });

    const now = new Date();
    const [calendarDate, setCalendarDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));

    if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

    // --- Calendar grid helpers ---
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCalendarDate(new Date(year, month + 1, 1));
    const goToday = () => setCalendarDate(new Date(now.getFullYear(), now.getMonth(), 1));

    // Build calendar cells: leading empty days + actual days
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    // Matches indexed by day of month for current view
    const matchesThisMonth = activeMatches.filter(m => {
        const d = new Date(m.date);
        return d.getFullYear() === year && d.getMonth() === month;
    });

    function getMatchesForDay(day) {
        if (!day) return [];
        const target = new Date(year, month, day);
        return matchesThisMonth.filter(m => isSameDay(new Date(m.date), target));
    }

    // --- CRUD ---
    const openAdd = (day) => {
        setEditingMatch(null);
        const defaultDate = day
            ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T08:00`
            : '';
        setForm({ opponent: '', date: defaultDate, location: '', uniformId: '', status: 'upcoming' });
        setModalOpen(true);
    };

    const openEdit = (m) => {
        setEditingMatch(m);
        setForm({ opponent: m.opponent, date: m.date?.slice(0, 16) || '', location: m.location, uniformId: m.uniformId || '', status: m.status });
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.opponent || !form.date) { showToast('Vui lòng điền đối thủ và ngày giờ!', 'error'); return; }
        const matchData = { ...form };
        if (selectedSeasonId && selectedSeasonId !== 'all') matchData.seasonId = selectedSeasonId;
        if (editingMatch) {
            await updateMatch(editingMatch.id, matchData);
            showToast('Đã cập nhật thông tin trận đấu');
        } else {
            await addMatch(matchData);
            showToast(`Đã tạo trận đấu với ${form.opponent}`);
        }
        setModalOpen(false);
    };

    const handleDelete = async () => {
        if (!editingMatch) return;
        if (!confirm(`Xóa trận đấu vs "${editingMatch.opponent}"?`)) return;
        await deleteMatch(editingMatch.id);
        showToast('Đã xóa trận đấu', 'warning');
        setModalOpen(false);
    };

    const getStatusColor = (m) => {
        if (m.status === 'completed') return 'var(--green)';
        if (new Date(m.date) < now) return 'var(--yellow)';
        return 'var(--blue)';
    };

    const getStatusBg = (m) => {
        if (m.status === 'completed') return '#22C55E22';
        if (new Date(m.date) < now) return '#F5C51822';
        return '#3B82F622';
    };

    return (
        <>
            <header className="app-header">
                <div className="app-header__title">
                    <h1>Lịch Thi Đấu</h1>
                    <p>{activeMatches.length} trận đấu</p>
                </div>
            </header>

            <div className="app-content animate-fade-in">
                {/* Calendar Header Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button className="btn btn--ghost p-1 sm:p-2" onClick={prevMonth}>
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)] whitespace-nowrap px-2 text-center">
                            {MONTHS_VI[month]} năm {year}
                        </h2>
                        <button className="btn btn--ghost p-1 sm:p-2" onClick={nextMonth}>
                            <ChevronRight size={20} />
                        </button>
                        <button className="btn btn--secondary btn--sm" onClick={goToday}>Hôm nay</button>
                    </div>
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                        {/* Legend */}
                        <div className="hidden lg:flex items-center gap-3 text-xs text-[var(--text-muted)]">
                            <span className="flex items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', display: 'inline-block' }} /> Sắp tới</span>
                            <span className="flex items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--yellow)', display: 'inline-block' }} /> Chờ KQ</span>
                            <span className="flex items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} /> Đã xong</span>
                        </div>
                        {isAdmin && (
                            <button className="btn btn--primary flex-1 sm:flex-none justify-center" onClick={() => openAdd(null)}>
                                <Plus size={16} /> Tạo trận
                            </button>
                        )}
                    </div>
                </div>

                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    overflowX: 'auto',
                    boxShadow: 'var(--shadow-md)',
                }}>
                    <div style={{ minWidth: '700px' }}>
                        {/* Weekday headers */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            borderBottom: '1px solid var(--border)',
                        }}>
                            {WEEKDAYS.map(d => (
                                <div key={d} style={{
                                    padding: '10px 4px',
                                    textAlign: 'center',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    color: d === 'CN' || d === 'T7' ? 'var(--primary)' : 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                }}>
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Day cells */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                        }}>
                            {cells.map((day, idx) => {
                                const dayMatches = getMatchesForDay(day);
                                const isToday = day && isSameDay(new Date(year, month, day), now);
                                const isWeekend = (idx % 7 === 0 || idx % 7 === 6);
                                const colIndex = idx % 7;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => day && isAdmin && openAdd(day)}
                                        style={{
                                            minHeight: '110px',
                                            padding: '8px',
                                            borderRight: colIndex < 6 ? '1px solid var(--border)' : 'none',
                                            borderBottom: idx < cells.length - 7 ? '1px solid var(--border)' : 'none',
                                            background: day ? (isToday ? 'rgba(245,197,24,0.04)' : 'transparent') : 'rgba(0,0,0,0.15)',
                                            cursor: day && isAdmin ? 'pointer' : 'default',
                                            transition: 'background 0.2s',
                                            position: 'relative',
                                        }}
                                        onMouseEnter={e => { if (day && isAdmin) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                        onMouseLeave={e => { if (day && isAdmin) e.currentTarget.style.background = day ? (isToday ? 'rgba(245,197,24,0.04)' : 'transparent') : 'rgba(0,0,0,0.15)'; }}
                                    >
                                        {/* Day number */}
                                        {day && (
                                            <div style={{
                                                width: '26px',
                                                height: '26px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.8rem',
                                                fontWeight: isToday ? 800 : 500,
                                                color: isToday ? '#0D0F12' : (isWeekend ? 'var(--primary)' : 'var(--text-secondary)'),
                                                background: isToday ? 'var(--primary)' : 'transparent',
                                                marginBottom: '4px',
                                            }}>
                                                {day}
                                            </div>
                                        )}

                                        {/* Match chips */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                            {dayMatches.map(m => {
                                                const result = getResultByMatchId(m.id);
                                                return (
                                                    <div
                                                        key={m.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (isAdmin) openEdit(m);
                                                        }}
                                                        style={{
                                                            background: getStatusBg(m),
                                                            border: `1px solid ${getStatusColor(m)}44`,
                                                            borderLeft: `3px solid ${getStatusColor(m)}`,
                                                            borderRadius: '6px',
                                                            padding: '4px 6px',
                                                            fontSize: '0.65rem',
                                                            cursor: isAdmin ? 'pointer' : 'default',
                                                            transition: 'all 0.15s',
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                                                        title={`vs ${m.opponent} | ${formatTime(m.date)} | ${m.location}`}
                                                    >
                                                        <div style={{ fontWeight: 700, color: getStatusColor(m), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {result ? `${result.ourScore}-${result.opponentScore}` : formatTime(m.date)}
                                                        </div>
                                                        <div style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            vs {m.opponent}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom: upcoming matches list */}
                    {activeMatches.filter(m => m.status === 'upcoming' && new Date(m.date) >= now).length > 0 && (
                        <div style={{ marginTop: '28px' }}>
                            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                                🕐 Trận sắp tới
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {activeMatches
                                    .filter(m => m.status === 'upcoming' && new Date(m.date) >= now)
                                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                                    .map(m => {
                                        const uniform = getUniformById(m.uniformId);
                                        const d = new Date(m.date);
                                        const days = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
                                        return (
                                            <div key={m.id}
                                                onClick={() => isAdmin && openEdit(m)}
                                                style={{
                                                    background: 'var(--bg-card)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '12px',
                                                    padding: '12px 16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '16px',
                                                    cursor: isAdmin ? 'pointer' : 'default',
                                                    transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={e => { if (isAdmin) e.currentTarget.style.borderColor = 'var(--primary)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                                            >
                                                <div style={{
                                                    minWidth: '52px', height: '52px',
                                                    borderRadius: '10px',
                                                    background: 'var(--primary-muted)',
                                                    display: 'flex', flexDirection: 'column',
                                                    alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>{days <= 0 ? 'Hôm nay' : days}</span>
                                                    {days > 0 && <span style={{ fontSize: '0.5rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>ngày nữa</span>}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Cứng Rắn FC vs {m.opponent}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                        {d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} · {formatTime(m.date)}
                                                        {m.location && ` · ${m.location}`}
                                                    </div>
                                                </div>
                                                {uniform && (
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                                        <Shirt size={12} /> {uniform.name}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    )}
                </div>

                <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingMatch ? 'Chỉnh Sửa Trận Đấu' : 'Tạo Trận Đấu Mới'}
                    footer={<>
                        {editingMatch && <button className="btn btn--danger btn--sm" onClick={handleDelete}><Trash2 size={14} /> Xóa</button>}
                        <div className="flex-1" />
                        <button className="btn btn--secondary" onClick={() => setModalOpen(false)}>Hủy</button>
                        <button className="btn btn--primary" onClick={handleSave}><Save size={14} /> Lưu</button>
                    </>}
                >
                    <div className="form-group">
                        <label className="form-label">Đối thủ *</label>
                        <input className="form-input" value={form.opponent} onChange={e => setForm({ ...form, opponent: e.target.value })} placeholder="Tên đội đối thủ" />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Ngày giờ *</label>
                            <input className="form-input" type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Địa điểm</label>
                            <input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Tên sân" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Trang phục</label>
                            <select className="form-select" value={form.uniformId} onChange={e => setForm({ ...form, uniformId: e.target.value })}>
                                <option value="">-- Chọn trang phục --</option>
                                {uniforms.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Trạng thái</label>
                            <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                <option value="upcoming">Sắp tới</option>
                                <option value="completed">Đã hoàn thành</option>
                            </select>
                        </div>
                    </div>
                </Modal>
            </div>
        </>
    );
}
