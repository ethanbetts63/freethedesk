import { redirect } from 'next/navigation';

/** The staff dashboard moved under /dashboard/admin when /dashboard/user
 * arrived; staff bookmarks still say /dashboard. */
export default function DashboardRedirect() {
  redirect('/dashboard/admin');
}
