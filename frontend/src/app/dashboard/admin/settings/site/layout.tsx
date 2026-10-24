import type { Metadata } from 'next';

/** The tab title for this section; the area's layout adds the rest. */
export const metadata: Metadata = { title: 'Site settings' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
