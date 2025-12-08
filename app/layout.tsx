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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
