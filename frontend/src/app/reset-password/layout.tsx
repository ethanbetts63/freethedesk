import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset password',
  description: 'Reset the password on your freethedesk account.',
  robots: { index: false, follow: false },
};

// No AuthProvider: resetting a password is what somebody does when they cannot
// sign in, so nothing here reads a session.
export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
