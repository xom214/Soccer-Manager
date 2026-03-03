// Seed script - Push mock data to Firestore
// Run: node seed.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD41A_pA9h8e5vAnG3R2CtMsrd-TA-YEvs",
    authDomain: "crfc-a.firebaseapp.com",
    projectId: "crfc-a",
    storageBucket: "crfc-a.firebasestorage.app",
    messagingSenderId: "278682006586",
    appId: "1:278682006586:web:2fee95112d32950755f103",
};

console.log('🔥 Firebase Config:', { projectId: firebaseConfig.projectId });

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================
// Mock Data
// ============================================
const PLAYERS = [
    { name: 'Nguyễn Văn Hùng', position: 'Thủ môn', number: 1, phone: '0901234567', email: 'hung.nv@email.com', avatar: 'https://i.pravatar.cc/150?img=1' },
    { name: 'Trần Đức Mạnh', position: 'Hậu vệ', number: 3, phone: '0912345678', email: 'manh.td@email.com', avatar: 'https://i.pravatar.cc/150?img=3' },
    { name: 'Lê Quang Hải', position: 'Hậu vệ', number: 4, phone: '0923456789', email: 'hai.lq@email.com', avatar: 'https://i.pravatar.cc/150?img=5' },
    { name: 'Phạm Tuấn Anh', position: 'Hậu vệ', number: 5, phone: '0934567890', email: 'anh.pt@email.com', avatar: 'https://i.pravatar.cc/150?img=7' },
    { name: 'Hoàng Minh Đức', position: 'Hậu vệ', number: 2, phone: '0945678901', email: 'duc.hm@email.com', avatar: 'https://i.pravatar.cc/150?img=8' },
    { name: 'Ngô Thanh Bình', position: 'Tiền vệ', number: 6, phone: '0956789012', email: 'binh.nt@email.com', avatar: 'https://i.pravatar.cc/150?img=11' },
    { name: 'Vũ Đình Trọng', position: 'Tiền vệ', number: 8, phone: '0967890123', email: 'trong.vd@email.com', avatar: 'https://i.pravatar.cc/150?img=12' },
    { name: 'Đỗ Hùng Dũng', position: 'Tiền vệ', number: 10, phone: '0978901234', email: 'dung.dh@email.com', avatar: 'https://i.pravatar.cc/150?img=13' },
    { name: 'Bùi Tiến Dũng', position: 'Tiền vệ', number: 14, phone: '0989012345', email: 'dung.bt@email.com', avatar: 'https://i.pravatar.cc/150?img=14' },
    { name: 'Nguyễn Công Phượng', position: 'Tiền đạo', number: 9, phone: '0990123456', email: 'phuong.nc@email.com', avatar: 'https://i.pravatar.cc/150?img=15' },
    { name: 'Phan Văn Đức', position: 'Tiền đạo', number: 11, phone: '0911234567', email: 'duc.pv@email.com', avatar: 'https://i.pravatar.cc/150?img=16' },
    { name: 'Hà Đức Chinh', position: 'Tiền đạo', number: 7, phone: '0922345678', email: 'chinh.hd@email.com', avatar: 'https://i.pravatar.cc/150?img=17' },
];

const UNIFORMS = [
    { name: 'Sân nhà - Vàng đen', primaryColor: '#F5C518', secondaryColor: '#0D0F12', notes: 'Bộ đồ chính thức thi đấu sân nhà' },
    { name: 'Sân khách - Trắng', primaryColor: '#FFFFFF', secondaryColor: '#1A1F2E', notes: 'Bộ đồ thi đấu sân khách' },
    { name: 'Đặc biệt - Đen vàng', primaryColor: '#1A1F2E', secondaryColor: '#FFD700', notes: 'Bộ đồ cho các trận giao hữu đặc biệt' },
    { name: 'Tập luyện - Xám', primaryColor: '#6B7280', secondaryColor: '#F5C518', notes: 'Bộ đồ tập luyện hàng tuần' },
];

const MATCHES = [
    { opponent: 'Sấm Sét FC', date: '2026-03-08T15:00', location: 'Sân Mỹ Đình', status: 'upcoming' },
    { opponent: 'Bão Lửa United', date: '2026-03-15T17:30', location: 'Sân Thống Nhất', status: 'upcoming' },
    { opponent: 'Hổ Vằn FC', date: '2026-02-22T15:00', location: 'Sân Mỹ Đình', status: 'completed' },
    { opponent: 'Rồng Xanh SC', date: '2026-02-15T16:00', location: 'Sân Hàng Đẫy', status: 'completed' },
    { opponent: 'Phượng Hoàng FC', date: '2026-02-08T15:00', location: 'Sân Mỹ Đình', status: 'completed' },
    { opponent: 'Kỳ Lân Stars', date: '2026-02-01T14:00', location: 'Sân Chi Lăng', status: 'completed' },
    { opponent: 'Đại Bàng SC', date: '2026-01-25T15:30', location: 'Sân Mỹ Đình', status: 'completed' },
];

// ============================================
// Seed function
// ============================================
async function clearCollection(name) {
    const snap = await getDocs(collection(db, name));
    const deletes = snap.docs.map(d => deleteDoc(doc(db, name, d.id)));
    await Promise.all(deletes);
    console.log(`  🗑️  Cleared ${snap.docs.length} docs from "${name}"`);
}

async function seedCollection(name, items) {
    const ids = [];
    for (const item of items) {
        const ref = await addDoc(collection(db, name), { ...item, createdAt: new Date() });
        ids.push(ref.id);
    }
    console.log(`  ✅ Seeded ${items.length} docs into "${name}"`);
    return ids;
}

async function main() {
    console.log('\n🌱 Starting seed...\n');

    // Clear existing data
    console.log('📋 Clearing collections...');
    await clearCollection('players');
    await clearCollection('uniforms');
    await clearCollection('matches');
    await clearCollection('results');

    // Seed players
    console.log('\n👥 Seeding players...');
    const playerIds = await seedCollection('players', PLAYERS);

    // Seed uniforms
    console.log('👕 Seeding uniforms...');
    const uniformIds = await seedCollection('uniforms', UNIFORMS);

    // Seed matches (link to uniform IDs)
    console.log('📅 Seeding matches...');
    const matchesWithUniforms = MATCHES.map((m, i) => ({
        ...m,
        uniformId: i < 2 ? uniformIds[i] : uniformIds[i % uniformIds.length],
    }));
    const matchIds = await seedCollection('matches', matchesWithUniforms);

    // Seed results for completed matches
    console.log('🏆 Seeding results...');
    const RESULTS = [
        {
            matchId: matchIds[2], ourScore: 3, opponentScore: 1,
            scorers: [
                { playerId: playerIds[9], minute: 23 },
                { playerId: playerIds[10], minute: 56 },
                { playerId: playerIds[7], minute: 78 },
            ],
            assists: [
                { playerId: playerIds[7], minute: 23 },
                { playerId: playerIds[8], minute: 56 },
                { playerId: playerIds[10], minute: 78 },
            ],
            mvpPlayerId: playerIds[9],
        },
        {
            matchId: matchIds[3], ourScore: 2, opponentScore: 2,
            scorers: [
                { playerId: playerIds[11], minute: 34 },
                { playerId: playerIds[9], minute: 67 },
            ],
            assists: [
                { playerId: playerIds[6], minute: 34 },
                { playerId: playerIds[11], minute: 67 },
            ],
            mvpPlayerId: playerIds[11],
        },
        {
            matchId: matchIds[4], ourScore: 4, opponentScore: 0,
            scorers: [
                { playerId: playerIds[9], minute: 12 },
                { playerId: playerIds[9], minute: 45 },
                { playerId: playerIds[10], minute: 58 },
                { playerId: playerIds[11], minute: 80 },
            ],
            assists: [
                { playerId: playerIds[7], minute: 12 },
                { playerId: playerIds[10], minute: 45 },
                { playerId: playerIds[8], minute: 58 },
                { playerId: playerIds[7], minute: 80 },
            ],
            mvpPlayerId: playerIds[9],
        },
        {
            matchId: matchIds[5], ourScore: 1, opponentScore: 2,
            scorers: [{ playerId: playerIds[10], minute: 72 }],
            assists: [{ playerId: playerIds[9], minute: 72 }],
            mvpPlayerId: playerIds[10],
        },
        {
            matchId: matchIds[6], ourScore: 2, opponentScore: 1,
            scorers: [
                { playerId: playerIds[11], minute: 15 },
                { playerId: playerIds[7], minute: 88 },
            ],
            assists: [
                { playerId: playerIds[5], minute: 15 },
                { playerId: playerIds[9], minute: 88 },
            ],
            mvpPlayerId: playerIds[7],
        },
    ];
    await seedCollection('results', RESULTS);

    console.log('\n✅ Seed complete! Your Firestore is ready.\n');
    process.exit(0);
}

main().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
