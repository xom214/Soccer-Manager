'use client';
import { useState } from 'react';
import { useData } from '@/lib/DataContext';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import { Plus, Save, Trash2, Layers, CheckCircle, Circle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function SeasonsPage() {
    const { seasons, addSeason, updateSeason, deleteSeason, loading, setSelectedSeasonId } = useData();
    const { isAdmin } = useAuth();
    const showToast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSeason, setEditingSeason] = useState(null);
    const [form, setForm] = useState({ name: '', startDate: '', endDate: '', isCurrent: false });

    if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

    const openAdd = () => {
        setEditingSeason(null);
        setForm({ name: '', startDate: '', endDate: '', isCurrent: false });
        setModalOpen(true);
    };

    const openEdit = (s) => {
        setEditingSeason(s);
        setForm({ name: s.name, startDate: s.startDate || '', endDate: s.endDate || '', isCurrent: s.isCurrent || false });
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.name) { showToast('Vui lòng nhập tên mùa giải!', 'error'); return; }
        
        let savedId;
        if (editingSeason) {
            await updateSeason(editingSeason.id, form);
            showToast(`Đã cập nhật ${form.name}`);
            savedId = editingSeason.id;
        } else {
            savedId = await addSeason(form);
            showToast(`Đã thêm ${form.name}`);
        }
        
        // If it's set to current, update others to not current
        if (form.isCurrent) {
            for (let s of seasons) {
                if (s.id !== savedId && s.isCurrent) {
                    await updateSeason(s.id, { ...s, isCurrent: false });
                }
            }
            setSelectedSeasonId(savedId);
        }
        
        setModalOpen(false);
    };

    const handleDelete = async () => {
        if (!editingSeason) return;
        if (!confirm(`Xóa mùa giải "${editingSeason.name}"?`)) return;
        await deleteSeason(editingSeason.id);
        showToast(`Đã xóa ${editingSeason.name}`, 'warning');
        setModalOpen(false);
    };

    return (
        <>
            <header className="app-header">
                <div className="app-header__title">
                    <h1>Mùa Giải</h1>
                    <p>Quản lý các mùa giải của đội bóng</p>
                </div>
            </header>
            <div className="app-content animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold">Danh sách mùa giải</h2>
                        <p className="text-sm text-[var(--text-muted)]">{seasons.length} mùa giải</p>
                    </div>
                    {isAdmin && (
                        <button className="btn btn--primary" onClick={openAdd}>
                            <Plus size={16} /> Thêm mùa giải
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {seasons.map(s => (
                        <div
                            key={s.id}
                            className={`uniform-card ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
                            onClick={() => isAdmin && openEdit(s)}
                            style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
                        >
                            <div className="flex justify-between items-center">
                                <div className="font-bold text-lg flex items-center gap-2">
                                    <Layers className="text-[var(--primary)]" size={20} />
                                    {s.name}
                                </div>
                                {s.isCurrent ? (
                                    <span className="text-xs px-2 py-1 rounded-full bg-[var(--primary)] text-[var(--bg-main)] font-bold flex items-center gap-1">
                                        <CheckCircle size={12} /> Hiện tại
                                    </span>
                                ) : null}
                            </div>
                            <div className="text-sm text-[var(--text-muted)]">
                                <div>Bắt đầu: {s.startDate ? new Date(s.startDate).toLocaleDateString('vi-VN') : '---'}</div>
                                <div>Kết thúc: {s.endDate ? new Date(s.endDate).toLocaleDateString('vi-VN') : '---'}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingSeason ? 'Chỉnh Sửa Mùa Giải' : 'Thêm Mùa Giải Mới'}
                footer={<>
                    {editingSeason && <button className="btn btn--danger btn--sm" onClick={handleDelete}><Trash2 size={14} /> Xóa</button>}
                    <div className="flex-1" />
                    <button className="btn btn--secondary" onClick={() => setModalOpen(false)}>Hủy</button>
                    <button className="btn btn--primary" onClick={handleSave}><Save size={14} /> Lưu</button>
                </>}
            >
                <div className="form-group">
                    <label className="form-label">Tên mùa giải *</label>
                    <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VD: Mùa giải 2025" />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Ngày bắt đầu</label>
                        <input type="date" className="form-input" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Ngày kết thúc</label>
                        <input type="date" className="form-input" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                    </div>
                </div>
                <div className="form-group mt-4" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setForm({ ...form, isCurrent: !form.isCurrent })}>
                    {form.isCurrent ? <CheckCircle className="text-[var(--primary)]" size={20} /> : <Circle className="text-gray-400" size={20} />}
                    <span className="font-medium text-sm">Đặt làm mùa giải hiện tại</span>
                </div>
            </Modal>
        </>
    );
}
