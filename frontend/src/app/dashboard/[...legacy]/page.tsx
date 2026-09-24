import { redirect } from 'next/navigation';

/**
 * Old staff URLs: every /dashboard/x lived one level up before the admin/user
 * split, so a bookmark like /dashboard/enquiries forwards to
 * /dashboard/admin/enquiries. Static siblings (admin/, user/) win over this
 * catch-all, so only retired paths land here.
 */
export default async function LegacyDashboardRedirect({
  params,
}: {
  params: Promise<{ legacy: string[] }>;
}) {
  const { legacy } = await params;
  redirect(`/dashboard/admin/${legacy.join('/')}`);
}
