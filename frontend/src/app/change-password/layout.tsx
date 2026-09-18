import type { Metadata } from 'next';

import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Change password',
  description: 'Change the password on your freethedesk account.',
  robots: { index: false, follow: false },
};

export default function ChangePasswordLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
