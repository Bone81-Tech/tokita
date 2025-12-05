import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Katalog Produk TOKITA - Belanja Hemat & Lengkap',
  description: 'Katalog Produk TOKITA - Temukan berbagai kebutuhan pokok, sembako, dan jajanan hemat di sini.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
