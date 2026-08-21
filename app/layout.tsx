import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const metadata: Metadata = {
  title: 'အိမ်လွမ်းပြေ',
  description: '那覇で本格ミャンマー料理をデリバリー。Authentic Myanmar flavors, delivered to your table.',
  icons: { icon: `${basePath}/favicon.svg`, shortcut: `${basePath}/favicon.svg` },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang='ja'><body>{children}</body></html>;
}
