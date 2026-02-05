import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/nav/Navbar';
import { Footer } from '@/components/nav/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bespoke Car Preservation | Premium Vehicle Care',
  description: 'Elite mobile detailing service for luxury vehicles. Silent, waterless preservation using advanced polymer technology.',
  keywords: ['car detailing', 'luxury car care', 'mobile detailing', 'waterless wash', 'paint protection'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`} style={{ background: '#07070A', color: '#F0F0F3' }}>
        <Navbar />
        <main className="min-h-screen pt-20 pb-32 w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
