import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './ClientLayout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://nextradepro.top'),
  title: 'NextradePro.Top — Professional Crypto Trading Platform',
  description:
    'Trade Bitcoin, Ethereum, and 20+ cryptocurrencies with advanced tools, low fees, and institutional-grade security on NextradePro.Top',
  keywords: [
    'crypto trading',
    'bitcoin',
    'ethereum',
    'cryptocurrency exchange',
    'USDT',
    'spot trading',
    'futures trading',
    'NextradePro',
  ],
  openGraph: {
    title: 'NextradePro.Top — Professional Crypto Trading Platform',
    description:
      'Trade Bitcoin, Ethereum, and 20+ cryptocurrencies with advanced tools, low fees, and institutional-grade security on NextradePro.Top',
    url: 'https://nextradepro.top',
    siteName: 'NextradePro.Top',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="m-0 p-0">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}