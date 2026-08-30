"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const nav = [
  { href: "/dashboard/enquiries", label: "Enquiries" },
  { href: "/dashboard/messages", label: "Messages" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, pathname, router, user]);

  if (loading || !user) return <div className="admin-loading">Loading dashboard…</div>;

  return (
    <div className="dashboard-root">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-brand" href="/dashboard/enquiries">free<span>the</span>desk<i>.</i></Link>
        <div className="dashboard-sidebar-label">Admin dashboard</div>
        <nav className="dashboard-nav">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={pathname.startsWith(item.href) ? "active" : ""}>{item.label}</Link>
          ))}
        </nav>
        <div className="dashboard-account">
          <span>{user.email || user.username}</span>
          <button onClick={async () => { await logout(); router.replace("/login"); }}>Log out</button>
        </div>
      </aside>
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
