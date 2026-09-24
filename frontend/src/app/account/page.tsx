import { redirect } from 'next/navigation';

/** The customer dashboard moved to /dashboard/user; early emails and
 * bookmarks still say /account. */
export default function AccountRedirect() {
  redirect('/dashboard/user');
}
