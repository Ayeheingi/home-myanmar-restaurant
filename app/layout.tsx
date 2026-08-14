import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'THAZIN | Myanmar Kitchen Tokyo',
  description: '東京で本格ミャンマー料理をデリバリー。Authentic Myanmar flavors, delivered to your table.',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang='ja'><body className={geist.variable}>{children}</body></html>;
}
