'use client';
import { useState } from 'react';
import { useData } from '@/lib/DataContext';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import { Edit3, Check, X, Plus, Trash2, Save } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function matchResultClass(r) {
    if (r.ourScore > r.opponentScore) return 'win';
    if (r.ourScore < r.opponentScore) return 'loss';
    return 'draw';
}

function matchResultText(r) {
    if (r.ourScore > r.opponentScore) return 'Thắng';
    if (r.ourScore < r.opponentScore) return 'Thua';
    return 'Hòa';
}

export default function ResultsPage() {
    const { activeMatches, activeResults, players, saveResult, deleteMatch, getResultByMatchId, loading } = useData();
    const { isAdmin } = useAuth();
    const showToast = useToast();
    const [editingMatch, setEditingMatch] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [scorerCount, setScorerCount] = useState(1);
    const [assistCount, setAssistCount] = useState(1);

    if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

    const now = new Date();
    const completedMatches = activeMatches
        .filter(m => m.status === 'completed' || new Date(m.date) < now)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const startEdit = (m) => {
        const r = getResultByMatchId(m.id);
        const data = r || { ourScore: 0, opponentScore: 0, scorers: [], assists: [], mvpPlayerId: '' };
        setEditForm({
            ourScore: data.ourScore,
            opponentScore: data.opponentScore,
            mvpPlayerId: data.mvpPlayerId || '',
            scorers: data.scorers?.length ? [...data.scorers] : [{ playerId: '', minute: '' }],
            assists: data.assists?.length ? [...data.assists] : [{ playerId: '', minute: '' }],
        });
        setScorerCount(data.scorers?.length || 1);
        setAssistCount(data.assists?.length || 1);
        setEditingMatch(m);
        setModalOpen(true);
    };

    const handleSave = async () => {
        const validScorers = editForm.scorers.filter(s => s.playerId);
        const validAssists = editForm.assists.filter(a => a.playerId);
        await saveResult(editingMatch.id, {
            ourScore: parseInt(editForm.ourScore, 10) || 0,
            opponentScore: parseInt(editForm.opponentScore, 10) || 0,
            scorers: validScorers,
            assists: validAssists,
            mvpPlayerId: editForm.mvpPlayerId || null,
        });
        showToast('Đã lưu kết quả trận đấu');
        setModalOpen(false);
    };

    const handleDeleteMatch = async () => {
        if (!editingMatch) return;
        const r = getResultByMatchId(editingMatch.id);
        if (r) {
            showToast('Không thể xóa trận đấu đã có kết quả', 'error');
            return;
        }
        if (!confirm(`Xóa trận đấu vs "${editingMatch.opponent}"?`)) return;
        await deleteMatch(editingMatch.id);
        showToast('Đã xóa trận đấu', 'warning');
        setModalOpen(false);
    };

    const addRow = (type) => {
        setEditForm(prev => ({
            ...prev,
            [type]: [...prev[type], { playerId: '', minute: '' }]
        }));
        if (type === 'scorers') setScorerCount(c => c + 1);
        else setAssistCount(c => c + 1);
    };

    const removeRow = (type, index) => {
        setEditForm(prev => {
            const arr = [...prev[type]];
            arr.splice(index, 1);
            if (arr.length === 0) arr.push({ playerId: '', minute: '' });
            return { ...prev, [type]: arr };
        });
        if (type === 'scorers') setScorerCount(c => Math.max(1, c - 1));
        else setAssistCount(c => Math.max(1, c - 1));
    };

    const updateRow = (type, index, field, value) => {
        setEditForm(prev => {
            const arr = [...prev[type]];
            arr[index] = { ...arr[index], [field]: field === 'minute' ? parseInt(value, 10) || '' : value };
            return { ...prev, [type]: arr };
        });
    };

    return (
        <>
            <header className="app-header">
                <div className="app-header__title">
                    <h1>Kết Quả</h1>
                    <p>Ghi nhận kết quả trận đấu</p>
                </div>
            </header>
            <div className="app-content animate-fade-in">
                <div className="mb-6">
                    <h2 className="text-xl font-bold">Kết Quả Trận Đấu</h2>
                    <p className="text-sm text-[var(--text-muted)]">{completedMatches.length} trận đã hoàn thành</p>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Ngày</th>
                                <th>Đối thủ</th>
                                <th>Tỷ số</th>
                                <th>Kết quả</th>
                                <th>Ghi bàn</th>
                                <th>MVP</th>
                                <th style={{ width: 90 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {completedMatches.map(m => {
                                const r = getResultByMatchId(m.id);
                                const cls = matchResultClass(r || { ourScore: 0, opponentScore: 0 });
                                const scorerNames = r?.scorers?.map(s => {
                                    const p = players.find(pl => pl.id === s.playerId);
                                    return p ? `${p.name}${s.minute ? ` (${s.minute}')` : ''}` : '';
                                }).filter(Boolean).join(', ');
                                const mvp = players.find(p => p.id === r?.mvpPlayerId);

                                return (
                                    <tr key={m.id}>
                                        <td>{formatDate(m.date)}</td>
                                        <td><strong>{m.opponent}</strong><br /><small className="text-[var(--text-muted)]">{m.location}</small></td>
                                        <td>
                                            {r ? <strong className="text-lg">{r.ourScore} - {r.opponentScore}</strong> : '-'}
                                        </td>
                                        <td>
                                            {r ? <span className={`tag tag--${cls === 'win' ? 'green' : cls === 'loss' ? 'red' : 'yellow'}`}>{matchResultText(r)}</span> : <span className="tag tag--yellow">Chưa có</span>}
                                        </td>
                                        <td><small>{scorerNames || '-'}</small></td>
                                        <td>{mvp ? <span className="tag tag--primary">⭐ {mvp.name}</span> : '-'}</td>
                                        <td>
                                            {isAdmin && <button className="btn btn--primary btn--sm" onClick={() => startEdit(m)}>{r ? <Edit3 size={14} /> : 'Ghi kết quả'}</button>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingMatch ? `Kết quả trận vs ${editingMatch.opponent}` : ''}
                footer={<>
                    {editingMatch && !getResultByMatchId(editingMatch.id) && (
                        <button className="btn btn--danger btn--sm" onClick={handleDeleteMatch}><Trash2 size={14} /> Xóa Trận Đấu</button>
                    )}
                    <div className="flex-1" />
                    <button className="btn btn--secondary" onClick={() => setModalOpen(false)}>Hủy</button>
                    <button className="btn btn--primary" onClick={handleSave}><Save size={14} /> Lưu</button>
                </>}
            >
                <div className="flex items-center justify-center gap-4 mb-6 p-4 bg-[var(--bg-input)] rounded-xl border border-[var(--border)]">
                    <div className="flex-1 text-right">
                        <label className="block text-xs font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider">Cứng Rắn FC</label>
                        <input className="form-input text-center text-2xl font-bold h-12 w-20" type="number" min="0" value={editForm.ourScore}
                            onChange={e => setEditForm({ ...editForm, ourScore: e.target.value })} />
                    </div>
                    <div className="font-bold text-xl text-[var(--text-muted)] pt-4">VS</div>
                    <div className="flex-1 text-left">
                        <label className="block text-xs font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider truncate">{editingMatch?.opponent}</label>
                        <input className="form-input text-center text-2xl font-bold h-12 w-20" type="number" min="0" value={editForm.opponentScore}
                            onChange={e => setEditForm({ ...editForm, opponentScore: e.target.value })} />
                    </div>
                </div>

                <div className="form-group mb-6">
                    <label className="form-label">MVP (Cầu thủ xuất sắc nhất)</label>
                    <select className="form-select" value={editForm.mvpPlayerId}
                        onChange={e => setEditForm({ ...editForm, mvpPlayerId: e.target.value })}>
                        <option value="">-- Chọn MVP --</option>
                        {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                <div className="form-group mb-4 border border-[var(--border)] rounded-xl p-4 bg-[var(--bg-main)]">
                    <div className="flex items-center justify-between mb-3">
                        <label className="form-label mb-0 flex items-center gap-2">⚽ Danh sách Ghi bàn</label>
                        <button className="btn btn--secondary btn--sm" onClick={() => addRow('scorers')}><Plus size={14} /> Thêm</button>
                    </div>
                    {editForm.scorers && editForm.scorers.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2">
                            <select className="form-select flex-1 min-w-0" value={s.playerId}
                                onChange={e => updateRow('scorers', i, 'playerId', e.target.value)}>
                                <option value="">-- Chọn cầu thủ --</option>
                                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <input 
                                className="form-input px-1 text-center flex-shrink-0" 
                                style={{ width: '60px' }} 
                                type="number" min="1" max="120" value={s.minute}
                                onChange={e => updateRow('scorers', i, 'minute', e.target.value)} 
                                placeholder="Phút" 
                            />
                            <button className="btn btn--ghost text-[var(--red)] p-1 flex-shrink-0" onClick={() => removeRow('scorers', i)}><X size={18} /></button>
                        </div>
                    ))}
                </div>

                <div className="form-group border border-[var(--border)] rounded-xl p-4 bg-[var(--bg-main)]">
                    <div className="flex items-center justify-between mb-3">
                        <label className="form-label mb-0 flex items-center gap-2">👟 Danh sách Kiến tạo</label>
                        <button className="btn btn--secondary btn--sm" onClick={() => addRow('assists')}><Plus size={14} /> Thêm</button>
                    </div>
                    {editForm.assists && editForm.assists.map((a, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2">
                            <select className="form-select flex-1 min-w-0" value={a.playerId}
                                onChange={e => updateRow('assists', i, 'playerId', e.target.value)}>
                                <option value="">-- Chọn cầu thủ --</option>
                                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <input 
                                className="form-input px-1 text-center flex-shrink-0" 
                                style={{ width: '60px' }} 
                                type="number" min="1" max="120" value={a.minute}
                                onChange={e => updateRow('assists', i, 'minute', e.target.value)} 
                                placeholder="Phút" 
                            />
                            <button className="btn btn--ghost text-[var(--red)] p-1 flex-shrink-0" onClick={() => removeRow('assists', i)}><X size={18} /></button>
                        </div>
                    ))}
                </div>
            </Modal>
        </>
    );
}
