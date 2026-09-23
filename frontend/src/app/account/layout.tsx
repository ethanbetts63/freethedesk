import type { Metadata } from 'next';

export const metadata: Metadata = {
  // A customer's own paperwork across dealers: session-gated, never indexed.
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
