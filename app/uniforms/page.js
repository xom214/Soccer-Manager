'use client';
import { useState } from 'react';
import { useData } from '@/lib/DataContext';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import { Plus, Save, Trash2, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function UniformsPage() {
    const { uniforms, addUniform, updateUniform, deleteUniform, loading } = useData();
    const { isAdmin } = useAuth();
    const showToast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUniform, setEditingUniform] = useState(null);
    const [form, setForm] = useState({ name: '', primaryColor: '#F5C518', secondaryColor: '#0D0F12', notes: '' });

    if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

    const openAdd = () => {
        setEditingUniform(null);
        setForm({ name: '', primaryColor: '#F5C518', secondaryColor: '#0D0F12', notes: '' });
        setModalOpen(true);
    };

    const openEdit = (u) => {
        setEditingUniform(u);
        setForm({ name: u.name, primaryColor: u.primaryColor, secondaryColor: u.secondaryColor, notes: u.notes || '' });
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.name) { showToast('Vui lòng nhập tên trang phục!', 'error'); return; }
        if (editingUniform) {
            await updateUniform(editingUniform.id, form);
            showToast(`Đã cập nhật ${form.name}`);
        } else {
            await addUniform(form);
            showToast(`Đã thêm ${form.name}`);
        }
        setModalOpen(false);
    };

    const handleDelete = async () => {
        if (!editingUniform) return;
        if (!confirm(`Xóa trang phục "${editingUniform.name}"?`)) return;
        await deleteUniform(editingUniform.id);
        showToast(`Đã xóa ${editingUniform.name}`, 'warning');
        setModalOpen(false);
    };

    return (
        <>
            <header className="app-header">
                <div className="app-header__title">
                    <h1>Trang Phục</h1>
                    <p>Quản lý bộ trang phục thi đấu</p>
                </div>
            </header>
            <div className="app-content animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold">Trang Phục</h2>
                        <p className="text-sm text-[var(--text-muted)]">{uniforms.length} bộ trang phục</p>
                    </div>
                    {isAdmin && (
                        <button className="btn btn--primary" onClick={openAdd}>
                            <Plus size={16} /> Thêm trang phục
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {uniforms.map(u => (
                        <div
                            key={u.id}
                            className={`uniform-card ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
                            onClick={() => isAdmin && openEdit(u)}
                        >
                            <div className="h-24 flex items-center justify-center text-4xl" style={{ background: `linear-gradient(135deg, ${u.primaryColor}22, ${u.secondaryColor}22)` }}>
                                👕
                            </div>
                            <div className="p-4">
                                <div className="font-bold text-sm mb-2">{u.name}</div>
                                <div className="flex gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-full border border-white/20" style={{ background: u.primaryColor }} />
                                    <div className="w-6 h-6 rounded-full border border-white/20" style={{ background: u.secondaryColor }} />
                                </div>
                                {u.notes && <div className="text-xs text-[var(--text-muted)]">{u.notes}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingUniform ? 'Chỉnh Sửa Trang Phục' : 'Thêm Trang Phục Mới'}
                footer={<>
                    {editingUniform && <button className="btn btn--danger btn--sm" onClick={handleDelete}><Trash2 size={14} /> Xóa</button>}
                    <div className="flex-1" />
                    <button className="btn btn--secondary" onClick={() => setModalOpen(false)}>Hủy</button>
                    <button className="btn btn--primary" onClick={handleSave}><Save size={14} /> Lưu</button>
                </>}
            >
                <div className="form-group">
                    <label className="form-label">Tên bộ đồ *</label>
                    <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VD: Sân nhà - Vàng đen" />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Màu chính</label>
                        <div className="flex items-center gap-3">
                            <input type="color" value={form.primaryColor} onChange={e => setForm({ ...form, primaryColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer" />
                            <span className="text-sm text-[var(--text-muted)]">{form.primaryColor}</span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Màu phụ</label>
                        <div className="flex items-center gap-3">
                            <input type="color" value={form.secondaryColor} onChange={e => setForm({ ...form, secondaryColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer" />
                            <span className="text-sm text-[var(--text-muted)]">{form.secondaryColor}</span>
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Ghi chú</label>
                    <textarea className="form-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Mô tả sử dụng..." />
                </div>
            </Modal>
        </>
    );
}
