// Local mock data - used as fallback when Firestore is not configured
// This mirrors the prototype data.js but with string IDs

export const MOCK_PLAYERS = [
    { id: 'p1', name: 'Nguyễn Văn Hùng', position: 'Thủ môn', number: 1, phone: '0901234567', email: 'hung.nv@email.com', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 'p2', name: 'Trần Đức Mạnh', position: 'Hậu vệ', number: 3, phone: '0912345678', email: 'manh.td@email.com', avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: 'p3', name: 'Lê Quang Hải', position: 'Hậu vệ', number: 4, phone: '0923456789', email: 'hai.lq@email.com', avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: 'p4', name: 'Phạm Tuấn Anh', position: 'Hậu vệ', number: 5, phone: '0934567890', email: 'anh.pt@email.com', avatar: 'https://i.pravatar.cc/150?img=7' },
    { id: 'p5', name: 'Hoàng Minh Đức', position: 'Hậu vệ', number: 2, phone: '0945678901', email: 'duc.hm@email.com', avatar: 'https://i.pravatar.cc/150?img=8' },
    { id: 'p6', name: 'Ngô Thanh Bình', position: 'Tiền vệ', number: 6, phone: '0956789012', email: 'binh.nt@email.com', avatar: 'https://i.pravatar.cc/150?img=11' },
    { id: 'p7', name: 'Vũ Đình Trọng', position: 'Tiền vệ', number: 8, phone: '0967890123', email: 'trong.vd@email.com', avatar: 'https://i.pravatar.cc/150?img=12' },
    { id: 'p8', name: 'Đỗ Hùng Dũng', position: 'Tiền vệ', number: 10, phone: '0978901234', email: 'dung.dh@email.com', avatar: 'https://i.pravatar.cc/150?img=13' },
    { id: 'p9', name: 'Bùi Tiến Dũng', position: 'Tiền vệ', number: 14, phone: '0989012345', email: 'dung.bt@email.com', avatar: 'https://i.pravatar.cc/150?img=14' },
    { id: 'p10', name: 'Nguyễn Công Phượng', position: 'Tiền đạo', number: 9, phone: '0990123456', email: 'phuong.nc@email.com', avatar: 'https://i.pravatar.cc/150?img=15' },
    { id: 'p11', name: 'Phan Văn Đức', position: 'Tiền đạo', number: 11, phone: '0911234567', email: 'duc.pv@email.com', avatar: 'https://i.pravatar.cc/150?img=16' },
    { id: 'p12', name: 'Hà Đức Chinh', position: 'Tiền đạo', number: 7, phone: '0922345678', email: 'chinh.hd@email.com', avatar: 'https://i.pravatar.cc/150?img=17' },
];

export const MOCK_UNIFORMS = [
    { id: 'u1', name: 'Sân nhà - Vàng đen', primaryColor: '#F5C518', secondaryColor: '#0D0F12', notes: 'Bộ đồ chính thức thi đấu sân nhà' },
    { id: 'u2', name: 'Sân khách - Trắng', primaryColor: '#FFFFFF', secondaryColor: '#1A1F2E', notes: 'Bộ đồ thi đấu sân khách' },
    { id: 'u3', name: 'Đặc biệt - Đen vàng', primaryColor: '#1A1F2E', secondaryColor: '#FFD700', notes: 'Bộ đồ cho các trận giao hữu đặc biệt' },
    { id: 'u4', name: 'Tập luyện - Xám', primaryColor: '#6B7280', secondaryColor: '#F5C518', notes: 'Bộ đồ tập luyện hàng tuần' },
];

export const MOCK_MATCHES = [
    { id: 'm1', opponent: 'Sấm Sét FC', date: '2026-03-08T15:00', location: 'Sân Mỹ Đình', uniformId: 'u1', status: 'upcoming' },
    { id: 'm2', opponent: 'Bão Lửa United', date: '2026-03-15T17:30', location: 'Sân Thống Nhất', uniformId: 'u2', status: 'upcoming' },
    { id: 'm3', opponent: 'Hổ Vằn FC', date: '2026-02-22T15:00', location: 'Sân Mỹ Đình', uniformId: 'u1', status: 'completed' },
    { id: 'm4', opponent: 'Rồng Xanh SC', date: '2026-02-15T16:00', location: 'Sân Hàng Đẫy', uniformId: 'u2', status: 'completed' },
    { id: 'm5', opponent: 'Phượng Hoàng FC', date: '2026-02-08T15:00', location: 'Sân Mỹ Đình', uniformId: 'u1', status: 'completed' },
    { id: 'm6', opponent: 'Kỳ Lân Stars', date: '2026-02-01T14:00', location: 'Sân Chi Lăng', uniformId: 'u3', status: 'completed' },
    { id: 'm7', opponent: 'Đại Bàng SC', date: '2026-01-25T15:30', location: 'Sân Mỹ Đình', uniformId: 'u1', status: 'completed' },
];

export const MOCK_RESULTS = [
    {
        id: 'r1', matchId: 'm3', ourScore: 3, opponentScore: 1,
        scorers: [{ playerId: 'p10', minute: 23 }, { playerId: 'p11', minute: 56 }, { playerId: 'p8', minute: 78 }],
        assists: [{ playerId: 'p8', minute: 23 }, { playerId: 'p9', minute: 56 }, { playerId: 'p11', minute: 78 }],
        mvpPlayerId: 'p10'
    },
    {
        id: 'r2', matchId: 'm4', ourScore: 2, opponentScore: 2,
        scorers: [{ playerId: 'p12', minute: 34 }, { playerId: 'p10', minute: 67 }],
        assists: [{ playerId: 'p7', minute: 34 }, { playerId: 'p12', minute: 67 }],
        mvpPlayerId: 'p12'
    },
    {
        id: 'r3', matchId: 'm5', ourScore: 4, opponentScore: 0,
        scorers: [{ playerId: 'p10', minute: 12 }, { playerId: 'p10', minute: 45 }, { playerId: 'p11', minute: 58 }, { playerId: 'p12', minute: 80 }],
        assists: [{ playerId: 'p8', minute: 12 }, { playerId: 'p11', minute: 45 }, { playerId: 'p9', minute: 58 }, { playerId: 'p8', minute: 80 }],
        mvpPlayerId: 'p10'
    },
    {
        id: 'r4', matchId: 'm6', ourScore: 1, opponentScore: 2,
        scorers: [{ playerId: 'p11', minute: 72 }],
        assists: [{ playerId: 'p10', minute: 72 }],
        mvpPlayerId: 'p11'
    },
    {
        id: 'r5', matchId: 'm7', ourScore: 2, opponentScore: 1,
        scorers: [{ playerId: 'p12', minute: 15 }, { playerId: 'p8', minute: 88 }],
        assists: [{ playerId: 'p6', minute: 15 }, { playerId: 'p10', minute: 88 }],
        mvpPlayerId: 'p8'
    },
];
