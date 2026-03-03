import './globals.css';
import { DataProvider } from '@/lib/DataContext';
import { AuthProvider } from '@/lib/AuthContext';
import { ToastProvider } from '@/components/Toast';
import AppShell from '@/components/AppShell';

export const metadata = {
  title: 'Cứng Rắn FC - Quản Lý Đội Bóng',
  description: 'Ứng dụng quản lý đội bóng, lịch thi đấu, và hiệu suất cầu thủ cho Cứng Rắn FC',
  manifest: '/manifest.json',
  themeColor: '#F5C518',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cứng Rắn FC',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <DataProvider>
            <ToastProvider>
              <AppShell>
                {children}
              </AppShell>
            </ToastProvider>
          </DataProvider>
        </AuthProvider>
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `
        }} />
      </body>
    </html>
  );
}
