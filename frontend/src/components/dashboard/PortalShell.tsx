"use client";

import "./DashboardChrome.css";
import "./admin.css";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { homeFor, type Role } from "@/lib/api";

export interface NavItem {
  href: string;
  label: string;
}

export function PortalShell({
  role,
  label,
  nav,
  homeHref,
  children,
}: {
  role: Role;
  label: string;
  nav: NavItem[];
  homeHref: string;
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    // Wrong portal but signed in — send them to their own, not back through login.
    else if (user.role !== role) router.replace(homeFor(user));
  }, [loading, pathname, role, router, user]);

  if (loading || !user || user.role !== role) return <div className="admin-loading">Loading…</div>;

  return (
    <div className="dashboard-root">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-brand" href={homeHref}>
          free<span>the</span>desk<i>.</i>
        </Link>
        <div className="dashboard-sidebar-label">{label}</div>
        <nav className="dashboard-nav">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={pathname.startsWith(item.href) ? "active" : ""}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="dashboard-account">
          <span>{user.dealer?.business_name || user.seo?.business_name || user.email || user.username}</span>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.replace("/login");
            }}
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
