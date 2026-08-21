import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'အိမ်လွမ်းပြေ',
  description: '那覇で本格ミャンマー料理をデリバリー。Authentic Myanmar flavors, delivered to your table.',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang='ja'><body>{children}</body></html>;
}
