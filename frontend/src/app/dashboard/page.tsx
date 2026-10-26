import { redirect } from 'next/navigation';

import { homeFor, type Principal } from '@/lib/api';
import { serverApiFetch } from '@/lib/serverApi';

/**
 * The one address for "my dashboard": the header's button, and the staff
 * bookmarks from when the admin lived here. Asks Django who this is and sends
 * them to their portal, so the header never needs the role and the profile
 * request happens on the click, not on every page view.
 *
 * No refresh on a 401: an expired access cookie lands on the login page, which
 * refreshes the session itself and routes them on. Degraded, not wrong.
 */
export default async function DashboardRedirect() {
  const response = await serverApiFetch('/api/auth/me/');
  if (!response.ok) redirect('/login');
  const principal = (await response.json()) as Principal;
  redirect(homeFor(principal));
}
