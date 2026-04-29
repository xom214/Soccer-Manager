'use client';
import { useData } from '@/lib/DataContext';
import Link from 'next/link';
import { Users, Calendar, Trophy, Target, TrendingUp, MapPin, Shirt, Clock, CheckCircle } from 'lucide-react';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return { day: d.getDate(), month: d.toLocaleDateString('vi-VN', { month: 'short' }) };
}

function getDaysUntil(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}

function matchResultClass(r) {
  if (r.ourScore > r.opponentScore) return 'win';
  if (r.ourScore < r.opponentScore) return 'loss';
  return 'draw';
}

function PlayerAvatar({ player, size = 36 }) {
  if (player?.avatar) {
    return <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />;
  }
  return (
    <span>{player?.name?.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()}</span>
  );
}

export default function DashboardPage() {
  const { players, activeMatches, teamStats, topScorers, getUniformById, getResultByMatchId, loading } = useData();

  if (loading) {
    return <div className="loading-screen"><div className="loading-spinner" /><p className="text-sm text-[var(--text-muted)]">Đang tải dữ liệu...</p></div>;
  }

  const now = new Date();
  const recentMatches = activeMatches
    .filter(m => m.status === 'completed' || new Date(m.date) < now)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const upcomingMatches = activeMatches
    .filter(m => m.status === 'upcoming' && new Date(m.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <>
      <header className="app-header">
        <div className="app-header__title">
          <h1>Dashboard</h1>
          <p>Tổng quan đội bóng</p>
        </div>
      </header>
      <div className="app-content animate-fade-in">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="stat-card__icon stat-card__icon--green"><Users size={20} /></div>
              <span className="tag tag--green flex items-center gap-1"><TrendingUp size={12} /> Active</span>
            </div>
            <div className="stat-card__value">{teamStats.totalMatches > 0 ? players.length : players.length}</div>
            <div className="stat-card__label">Cầu thủ</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="stat-card__icon stat-card__icon--blue"><Calendar size={20} /></div>
              <span className="tag tag--blue flex items-center gap-1"><TrendingUp size={12} /> {teamStats.upcomingMatches} sắp tới</span>
            </div>
            <div className="stat-card__value">{teamStats.totalMatches}</div>
            <div className="stat-card__label">Trận đã đấu</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="stat-card__icon stat-card__icon--yellow"><Trophy size={20} /></div>
            </div>
            <div className="stat-card__value">{teamStats.winRate}%</div>
            <div className="stat-card__label">Tỷ lệ thắng ({teamStats.wins}W {teamStats.draws}D {teamStats.losses}L)</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="stat-card__icon stat-card__icon--red"><Target size={20} /></div>
            </div>
            <div className="stat-card__value">{teamStats.goalsFor}</div>
            <div className="stat-card__label">Bàn thắng ({teamStats.goalsAgainst} bàn thua)</div>
          </div>
        </div>

        {/* Upcoming Matches */}
        {upcomingMatches.length > 0 && (
          <div className="upcoming-section">
            <div className="section-header">
              <span className="section-header__title">📅 Trận đấu sắp tới</span>
              <Link href="/matches" className="section-header__action">Xem tất cả →</Link>
            </div>
            {upcomingMatches.map(m => {
              const days = getDaysUntil(m.date);
              const uniform = getUniformById(m.uniformId);
              return (
                <div key={m.id} className="upcoming-match-item">
                  <div className="upcoming-match-item__countdown">
                    <div className="upcoming-match-item__countdown-value">{days <= 0 ? 'Hôm nay' : days}</div>
                    {days > 0 && <div className="upcoming-match-item__countdown-label">ngày nữa</div>}
                  </div>
                  <div className="upcoming-match-item__info">
                    <div className="upcoming-match-item__teams">Cứng Rắn FC vs {m.opponent}</div>
                    <div className="upcoming-match-item__meta">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {m.location}</span>
                      <span>·</span>
                      <span>{formatDate(m.date)} · {formatTime(m.date)}</span>
                    </div>
                  </div>
                  {uniform && (
                    <span className="upcoming-match-item__uniform">
                      <Shirt size={12} /> {uniform.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Recent Matches + Top Scorers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <div className="section-header">
              <span className="section-header__title">Trận đấu gần đây</span>
              <Link href="/results" className="section-header__action">Xem tất cả →</Link>
            </div>
            {recentMatches.map(m => {
              const r = getResultByMatchId(m.id);
              const ds = formatDateShort(m.date);
              const cls = r ? matchResultClass(r) : '';
              const txt = r ? `${r.ourScore} - ${r.opponentScore}` : '-';
              return (
                <div key={m.id} className="match-list-item">
                  <div className="match-list-item__date">
                    <div className="match-list-item__date-day">{ds.day}</div>
                    <div className="match-list-item__date-month">{ds.month}</div>
                  </div>
                  <div className="match-list-item__details">
                    <div className="match-list-item__teams">Cứng Rắn FC vs {m.opponent}</div>
                    <div className="match-list-item__meta">{m.location} · {formatTime(m.date)}</div>
                  </div>
                  <div className={`match-list-item__result match-list-item__result--${cls}`}>{txt}</div>
                </div>
              );
            })}
          </div>
          <div className="card">
            <div className="section-header">
              <span className="section-header__title">Vua phá lưới</span>
              <Link href="/performance" className="section-header__action">Chi tiết →</Link>
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
          </div>
        </div>
      </div>
    </>
  );
}
