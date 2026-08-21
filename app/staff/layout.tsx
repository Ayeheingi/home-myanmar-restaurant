import type { Metadata } from 'next';
import './staff.css';
import './staff-login.css';

export const metadata: Metadata = {
  title: '店舗管理 | အိမ်လွမ်းပြေ',
  description: 'အိမ်လွမ်းပြေ Myanmar Restaurant 店舗管理画面',
};

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return children;
}
