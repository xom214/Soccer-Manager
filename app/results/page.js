'use client';
import { useState } from 'react';
import { useData } from '@/lib/DataContext';
import { useToast } from '@/components/Toast';
import { Edit3, Check, X, Plus, ShieldAlert } from 'lucide-react';
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
    const { matches, results, players, saveResult, getResultByMatchId, loading } = useData();
    const { isAdmin } = useAuth();
    const showToast = useToast();
    const [editingMatchId, setEditingMatchId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [scorerCount, setScorerCount] = useState(1);
    const [assistCount, setAssistCount] = useState(1);

    if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

    const completedMatches = matches
        .filter(m => m.status === 'completed')
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
        setEditingMatchId(m.id);
    };

    const cancelEdit = () => { setEditingMatchId(null); };

    const handleSave = async () => {
        const validScorers = editForm.scorers.filter(s => s.playerId && s.minute);
        const validAssists = editForm.assists.filter(a => a.playerId && a.minute);
        await saveResult(editingMatchId, {
            ourScore: parseInt(editForm.ourScore, 10) || 0,
            opponentScore: parseInt(editForm.opponentScore, 10) || 0,
            scorers: validScorers,
            assists: validAssists,
            mvpPlayerId: editForm.mvpPlayerId || null,
        });
        showToast('Đã lưu kết quả trận đấu');
        setEditingMatchId(null);
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
                                const isEditing = editingMatchId === m.id;

                                if (isEditing) {
                                    return (
                                        <tr key={m.id} className="editing">
                                            <td>{formatDate(m.date)}</td>
                                            <td><strong>{m.opponent}</strong></td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <input className="inline-input inline-input--score" type="number" min="0" value={editForm.ourScore}
                                                        onChange={e => setEditForm({ ...editForm, ourScore: e.target.value })} />
                                                    <span className="font-bold text-[var(--text-muted)]">-</span>
                                                    <input className="inline-input inline-input--score" type="number" min="0" value={editForm.opponentScore}
                                                        onChange={e => setEditForm({ ...editForm, opponentScore: e.target.value })} />
                                                </div>
                                            </td>
                                            <td>
                                                <select className="inline-select" value={editForm.mvpPlayerId}
                                                    onChange={e => setEditForm({ ...editForm, mvpPlayerId: e.target.value })}>
                                                    <option value="">--</option>
                                                    {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
                                                <div className="text-[0.65rem] text-[var(--text-muted)] mt-1">MVP</div>
                                            </td>
                                            <td>
                                                <div className="inline-scorers-list">
                                                    <div className="flex items-center justify-between text-[0.65rem] text-[var(--text-muted)] mb-1">
                                                        <span>⚽ Ghi bàn</span>
                                                        <button className="btn btn--ghost btn--sm" onClick={() => addRow('scorers')}
                                                            style={{ padding: '1px 5px', minWidth: 'auto', color: 'var(--primary)' }}><Plus size={12} /></button>
                                                    </div>
                                                    {editForm.scorers.map((s, i) => (
                                                        <div key={i} className="inline-scorer-row">
                                                            <select className="inline-select" value={s.playerId}
                                                                onChange={e => updateRow('scorers', i, 'playerId', e.target.value)}>
                                                                <option value="">--</option>
                                                                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                            </select>
                                                            <input className="inline-input" type="number" min="1" max="120" value={s.minute}
                                                                onChange={e => updateRow('scorers', i, 'minute', e.target.value)} placeholder="'" style={{ width: 50 }} />
                                                            <button className="btn btn--ghost btn--sm" onClick={() => removeRow('scorers', i)}
                                                                style={{ padding: '2px 4px', minWidth: 'auto' }}><X size={12} className="text-[var(--red)]" /></button>
                                                        </div>
                                                    ))}
                                                    <div className="flex items-center justify-between text-[0.65rem] text-[var(--text-muted)] mt-2 mb-1">
                                                        <span>👟 Kiến tạo</span>
                                                        <button className="btn btn--ghost btn--sm" onClick={() => addRow('assists')}
                                                            style={{ padding: '1px 5px', minWidth: 'auto', color: 'var(--primary)' }}><Plus size={12} /></button>
                                                    </div>
                                                    {editForm.assists.map((a, i) => (
                                                        <div key={i} className="inline-scorer-row">
                                                            <select className="inline-select" value={a.playerId}
                                                                onChange={e => updateRow('assists', i, 'playerId', e.target.value)}>
                                                                <option value="">--</option>
                                                                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                            </select>
                                                            <input className="inline-input" type="number" min="1" max="120" value={a.minute}
                                                                onChange={e => updateRow('assists', i, 'minute', e.target.value)} placeholder="'" style={{ width: 50 }} />
                                                            <button className="btn btn--ghost btn--sm" onClick={() => removeRow('assists', i)}
                                                                style={{ padding: '2px 4px', minWidth: 'auto' }}><X size={12} className="text-[var(--red)]" /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td></td>
                                            <td>
                                                <div className="flex flex-col gap-1">
                                                    <button className="btn btn--primary btn--sm" onClick={handleSave}><Check size={14} /></button>
                                                    <button className="btn btn--ghost btn--sm" onClick={cancelEdit}><X size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }

                                // Normal display
                                if (!r) {
                                    return (
                                        <tr key={m.id}>
                                            <td>{formatDate(m.date)}</td>
                                            <td><strong>{m.opponent}</strong></td>
                                            <td>-</td>
                                            <td><span className="tag tag--yellow">Chưa có</span></td>
                                            <td>-</td>
                                            <td>-</td>
                                            <td>
                                                {isAdmin && <button className="btn btn--primary btn--sm" onClick={() => startEdit(m)}>Ghi kết quả</button>}
                                            </td>
                                        </tr>
                                    );
                                }

                                const cls = matchResultClass(r);
                                const scorerNames = r.scorers?.map(s => {
                                    const p = players.find(pl => pl.id === s.playerId);
                                    return p ? `${p.name} (${s.minute}')` : '';
                                }).filter(Boolean).join(', ');
                                const mvp = players.find(p => p.id === r.mvpPlayerId);

                                return (
                                    <tr key={m.id}>
                                        <td>{formatDate(m.date)}</td>
                                        <td><strong>{m.opponent}</strong><br /><small className="text-[var(--text-muted)]">{m.location}</small></td>
                                        <td><strong className="text-lg">{r.ourScore} - {r.opponentScore}</strong></td>
                                        <td><span className={`tag tag--${cls === 'win' ? 'green' : cls === 'loss' ? 'red' : 'yellow'}`}>{matchResultText(r)}</span></td>
                                        <td><small>{scorerNames || '-'}</small></td>
                                        <td>{mvp ? <span className="tag tag--primary">⭐ {mvp.name}</span> : '-'}</td>
                                        <td>
                                            {isAdmin && <button className="btn btn--ghost btn--sm" onClick={() => startEdit(m)}><Edit3 size={14} /></button>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
