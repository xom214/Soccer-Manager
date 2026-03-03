'use client';
import { useState } from 'react';
import { useData } from '@/lib/DataContext';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import { Plus, Save, Trash2, Calendar, Clock, CheckCircle, Shirt, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export default function MatchesPage() {
    const { matches, uniforms, addMatch, updateMatch, deleteMatch, getUniformById, getResultByMatchId, loading } = useData();
    const { isAdmin } = useAuth();
    const showToast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMatch, setEditingMatch] = useState(null);
    const [form, setForm] = useState({ opponent: '', date: '', location: '', uniformId: '', status: 'upcoming' });

    if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

    const upcoming = matches.filter(m => m.status === 'upcoming').sort((a, b) => new Date(a.date) - new Date(b.date));
    const completed = matches.filter(m => m.status === 'completed').sort((a, b) => new Date(b.date) - new Date(a.date));

    const openAdd = () => {
        setEditingMatch(null);
        setForm({ opponent: '', date: '', location: '', uniformId: '', status: 'upcoming' });
        setModalOpen(true);
    };

    const openEdit = (m) => {
        setEditingMatch(m);
        setForm({ opponent: m.opponent, date: m.date?.slice(0, 16) || '', location: m.location, uniformId: m.uniformId || '', status: m.status });
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.opponent || !form.date) { showToast('Vui lòng điền đối thủ và ngày giờ!', 'error'); return; }
        if (editingMatch) {
            await updateMatch(editingMatch.id, form);
            showToast('Đã cập nhật trận đấu');
        } else {
            await addMatch(form);
            showToast(`Đã tạo trận vs ${form.opponent}`);
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

    const renderCard = (m) => {
        const uniform = getUniformById(m.uniformId);
        const result = getResultByMatchId(m.id);
        return (
            <div
                key={m.id}
                className={`match-card ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={() => isAdmin && openEdit(m)}
            >
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-3">
                    <Calendar size={14} /> {formatDate(m.date)} · {formatTime(m.date)}
                </div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ background: 'var(--primary-muted)' }}>⚽</div>
                        <span className="font-bold text-sm">Cứng Rắn FC</span>
                    </div>
                    <span className="font-bold text-lg text-[var(--primary)]">
                        {result ? `${result.ourScore} - ${result.opponentScore}` : 'VS'}
                    </span>
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-sm">{m.opponent}</span>
                        <div className="w-10 h-10 rounded-lg bg-[var(--bg-input)] flex items-center justify-center text-lg">🏟️</div>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className={`tag ${m.status === 'upcoming' ? 'tag--blue' : 'tag--green'}`}>
                        {m.status === 'upcoming' ? 'Sắp tới' : 'Đã xong'}
                    </span>
                    {uniform && (
                        <span className="text-xs text-[var(--text-muted)] flex items-center gap-1"><Shirt size={12} />{uniform.name}</span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <header className="app-header">
                <div className="app-header__title">
                    <h1>Lịch Thi Đấu</h1>
                    <p>{upcoming.length} trận sắp tới · {completed.length} trận đã đấu</p>
                </div>
            </header>
            <div className="app-content animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Lịch Thi Đấu</h2>
                    {isAdmin && (
                        <button className="btn btn--primary" onClick={openAdd}>
                            <Plus size={16} /> Tạo trận đấu
                        </button>
                    )}
                </div>
                {upcoming.length > 0 && (
                    <>
                        <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-muted)] mb-4"><Clock size={16} /> Sắp tới</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {upcoming.map(renderCard)}
                        </div>
                    </>
                )}
                {completed.length > 0 && (
                    <>
                        <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-muted)] mb-4"><CheckCircle size={16} /> Đã hoàn thành</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {completed.map(renderCard)}
                        </div>
                    </>
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
        </>
    );
}
