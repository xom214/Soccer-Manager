'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export default function MigratePage() {
    const { user } = useAuth();
    const [status, setStatus] = useState('Sẵn sàng');
    const [loading, setLoading] = useState(false);

    const runMigration = async () => {
        if (!user) {
            setStatus('Lỗi: Bạn cần đăng nhập để thực hiện thao tác này.');
            return;
        }

        setLoading(true);
        setStatus('Đang lấy danh sách các trận đấu...');

        try {
            const snap = await getDocs(collection(db, 'matches'));
            setStatus(`Tìm thấy ${snap.docs.length} trận đấu. Đang cập nhật...`);

            let count = 0;
            for (const d of snap.docs) {
                await updateDoc(doc(db, 'matches', d.id), {
                    seasonId: 'haL4BZhVklJ0zrdu3j5B'
                });
                count++;
            }

            setStatus(`✅ Cập nhật thành công ${count} trận đấu vào mùa giải: haL4BZhVklJ0zrdu3j5B!`);
        } catch (e) {
            setStatus(`❌ Lỗi: ${e.message}`);
        }

        setLoading(false);
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h1 className="text-2xl font-bold mb-4">Công cụ cập nhật dữ liệu</h1>
            <p className="mb-4 text-[var(--text-muted)]">
                Công cụ này sẽ cập nhật TẤT CẢ các trận đấu (và kết quả tương ứng) vào mùa giải có ID: <strong>haL4BZhVklJ0zrdu3j5B</strong>.
            </p>

            <div className="p-4 bg-gray-100 rounded-lg mb-6 dark:bg-gray-800">
                <strong>Trạng thái: </strong> {status}
            </div>

            <button
                onClick={runMigration}
                className="btn btn--primary w-full"
                disabled={loading}
            >
                {loading ? 'Đang xử lý...' : 'Chạy cập nhật'}
            </button>
        </div>
    );
}
