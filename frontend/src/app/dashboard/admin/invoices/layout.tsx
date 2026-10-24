import type { Metadata } from 'next';

/** The tab title for this section; the area's layout adds the rest. */
export const metadata: Metadata = { title: 'Invoices' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
