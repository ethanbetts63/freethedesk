import type { Metadata } from 'next';

export const metadata: Metadata = {
  // Never indexed, and never crawled: robots.txt disallows /sale as well. These
  // pages show a customer's date of birth and driver's licence number.
  robots: { index: false, follow: false },
};

export default function SaleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
