'use client';
import { useData } from '@/lib/DataContext';
import { computeTopAssisters } from '@/lib/firestore';

function PlayerAvatar({ player }) {
    if (player?.avatar) {
        return <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />;
    }
    return <span>{player?.name?.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()}</span>;
}

export default function PerformancePage() {
    const { matches, results, players, teamStats, topScorers, loading } = useData();

    if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

    const topAssisters = computeTopAssisters(results, players, 5);

    const completedMatches = matches
        .filter(m => m.status === 'completed')
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const chartData = completedMatches.map(m => {
        const r = results.find(res => res.matchId === m.id);
        return { label: m.opponent.split(' ')[0], value: r ? r.ourScore : 0 };
    });

    const maxGoals = Math.max(...chartData.map(d => d.value), 1);

    return (
        <>
            <header className="app-header">
                <div className="app-header__title">
                    <h1>Hiệu Suất Đội Bóng</h1>
                    <p>Phân tích chi tiết qua {teamStats.totalMatches} trận đấu</p>
                </div>
            </header>
            <div className="app-content animate-fade-in">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="perf-stat">
                        <div className="perf-stat__value">{teamStats.goalsFor}</div>
                        <div className="perf-stat__label">Tổng bàn thắng</div>
                    </div>
                    <div className="perf-stat">
                        <div className="perf-stat__value">{teamStats.goalsAgainst}</div>
                        <div className="perf-stat__label">Tổng bàn thua</div>
                    </div>
                    <div className="perf-stat">
                        <div className="perf-stat__value">{teamStats.goalsFor - teamStats.goalsAgainst}</div>
                        <div className="perf-stat__label">Hiệu số</div>
                    </div>
                    <div className="perf-stat">
                        <div className="perf-stat__value">{teamStats.totalMatches > 0 ? (teamStats.goalsFor / teamStats.totalMatches).toFixed(1) : '0'}</div>
                        <div className="perf-stat__label">TB bàn/trận</div>
                    </div>
                </div>

                {/* Chart */}
                <div className="card mb-8">
                    <div className="section-header">
                        <span className="section-header__title">📊 Bàn thắng theo trận</span>
                    </div>
                    <div className="chart-container pt-4">
                        {chartData.map((d, i) => (
                            <div key={i} className="chart-bar">
                                <div className="chart-bar__value">{d.value}</div>
                                <div className="chart-bar__fill" style={{ height: `${(d.value / maxGoals) * 140}px` }} />
                                <div className="chart-bar__label">{d.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Scorers & Assisters */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card">
                        <div className="section-header">
                            <span className="section-header__title">⚽ Vua phá lưới</span>
                        </div>
                        {topScorers.map((s, i) => (
                            <div key={s.player.id} className="scorer-item">
                                <div className={`scorer-item__rank ${i < 3 ? `scorer-item__rank--${i + 1}` : ''}`}>{i + 1}</div>
                                <div className="scorer-item__avatar"><PlayerAvatar player={s.player} /></div>
                                <div>
                                    <div className="scorer-item__name">{s.player.name}</div>
                                    <div className="scorer-item__position">{s.player.position} · #{s.player.number}</div>
                                </div>
                                <div className="scorer-item__goals">{s.goals}</div>
                            </div>
                        ))}
                        {topScorers.length === 0 && <p className="text-sm text-[var(--text-muted)] py-4">Chưa có dữ liệu</p>}
                    </div>
                    <div className="card">
                        <div className="section-header">
                            <span className="section-header__title">👟 Vua kiến tạo</span>
                        </div>
                        {topAssisters.map((a, i) => (
                            <div key={a.player.id} className="scorer-item">
                                <div className={`scorer-item__rank ${i < 3 ? `scorer-item__rank--${i + 1}` : ''}`}>{i + 1}</div>
                                <div className="scorer-item__avatar"><PlayerAvatar player={a.player} /></div>
                                <div>
                                    <div className="scorer-item__name">{a.player.name}</div>
                                    <div className="scorer-item__position">{a.player.position} · #{a.player.number}</div>
                                </div>
                                <div className="scorer-item__goals">{a.assists}</div>
                            </div>
                        ))}
                        {topAssisters.length === 0 && <p className="text-sm text-[var(--text-muted)] py-4">Chưa có dữ liệu</p>}
                    </div>
                </div>
            </div>
        </>
    );
}
