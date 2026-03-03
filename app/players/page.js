'use client';
import { useState } from 'react';
import { useData } from '@/lib/DataContext';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import { Plus, Save, Trash2, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

function PlayerAvatar({ player }) {
    if (player?.avatar) {
        return <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />;
    }
    return <span>{player?.name?.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()}</span>;
}

export default function PlayersPage() {
    const { players, addPlayer, updatePlayer, deletePlayer, getPlayerStats, loading } = useData();
    const { isAdmin } = useAuth();
    const showToast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState(null);
    const [form, setForm] = useState({ name: '', position: 'Tiền vệ', number: '', phone: '', email: '', avatar: '' });

    if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

    const openAdd = () => {
        setEditingPlayer(null);
        setForm({ name: '', position: 'Tiền vệ', number: '', phone: '', email: '', avatar: '' });
        setModalOpen(true);
    };

    const openEdit = (p) => {
        setEditingPlayer(p);
        setForm({ name: p.name, position: p.position, number: p.number, phone: p.phone || '', email: p.email || '', avatar: p.avatar || '' });
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.number) {
            showToast('Vui lòng điền đầy đủ thông tin!', 'error');
            return;
        }
        const data = { ...form, number: parseInt(form.number, 10) };
        if (editingPlayer) {
            await updatePlayer(editingPlayer.id, data);
            showToast(`Đã cập nhật ${form.name}`);
        } else {
            await addPlayer(data);
            showToast(`Đã thêm ${form.name}`);
        }
        setModalOpen(false);
    };

    const handleDelete = async () => {
        if (!editingPlayer) return;
        if (!confirm(`Xóa cầu thủ "${editingPlayer.name}"?`)) return;
        await deletePlayer(editingPlayer.id);
        showToast(`Đã xóa ${editingPlayer.name}`, 'warning');
        setModalOpen(false);
    };

    return (
        <>
            <header className="app-header">
                <div className="app-header__title">
                    <h1>Đội Hình</h1>
                    <p>Quản lý thành viên</p>
                </div>
            </header>
            <div className="app-content animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold">Đội Hình</h2>
                        <p className="text-sm text-[var(--text-muted)]">{players.length} cầu thủ đang hoạt động</p>
                    </div>
                    {isAdmin && (
                        <button className="btn btn--primary" onClick={openAdd}>
                            <Plus size={16} /> Thêm cầu thủ
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {players.map(p => {
                        const stats = getPlayerStats(p.id);
                        return (
                            <div
                                key={p.id}
                                className={`player-card ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
                                onClick={() => isAdmin && openEdit(p)}
                            >
                                <div className="player-card__banner">
                                    <div className="player-card__number">{p.number}</div>
                                </div>
                                <div className="player-card__avatar"><PlayerAvatar player={p} /></div>
                                <div className="player-card__info">
                                    <div className="player-card__name">{p.name}</div>
                                    <div className="player-card__position">{p.position}</div>
                                    <div className="player-card__stats">
                                        <div className="text-center">
                                            <div className="player-card__stat-value">{stats.goals}</div>
                                            <div className="player-card__stat-label">Bàn thắng</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="player-card__stat-value">{stats.assists}</div>
                                            <div className="player-card__stat-label">Kiến tạo</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="player-card__stat-value">{stats.matchesPlayed}</div>
                                            <div className="player-card__stat-label">Trận</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingPlayer ? 'Chỉnh Sửa Cầu Thủ' : 'Thêm Cầu Thủ Mới'}
                footer={
                    <>
                        {editingPlayer && (
                            <button className="btn btn--danger btn--sm" onClick={handleDelete}><Trash2 size={14} /> Xóa</button>
                        )}
                        <div className="flex-1" />
                        <button className="btn btn--secondary" onClick={() => setModalOpen(false)}>Hủy</button>
                        <button className="btn btn--primary" onClick={handleSave}><Save size={14} /> Lưu</button>
                    </>
                }
            >
                <div className="form-group">
                    <label className="form-label">Họ và tên *</label>
                    <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nhập tên cầu thủ" />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Vị trí *</label>
                        <select className="form-select" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}>
                            <option value="Thủ môn">Thủ môn</option>
                            <option value="Hậu vệ">Hậu vệ</option>
                            <option value="Tiền vệ">Tiền vệ</option>
                            <option value="Tiền đạo">Tiền đạo</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Số áo *</label>
                        <input className="form-input" type="number" min="1" max="99" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} placeholder="1-99" />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Link ảnh đại diện</label>
                    <input className="form-input" value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} placeholder="https://example.com/photo.jpg" />
                </div>
                <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0901234567" />
                </div>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="player@email.com" />
                </div>
            </Modal>
        </>
    );
}
