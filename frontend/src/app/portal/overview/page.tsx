"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { useAuth } from "@/context/AuthContext";
import { formatDateTime } from "@/lib/api";
import { getDealerAccount, type DealerAccount } from "@/lib/dealerApi";

const statusCopy: Record<DealerAccount["status"], { heading: string; body: string }> = {
  pending: {
    heading: "We are reviewing your account.",
    body: "Every dealership is checked by hand before we switch an account on — usually within a business day. There is nothing for you to do in the meantime, and we will email you the moment it is done.",
  },
  active: {
    heading: "Your account is active.",
    body: "Setup is the next step: your dealership details, the paperwork we prefill on your behalf and the sale conditions you want to use. We will open that up as each part is ready.",
  },
  suspended: {
    heading: "This account is suspended.",
    body: "You can still sign in, but sales are paused. Get in touch and we will sort out what happened.",
  },
  denied: {
    heading: "We could not approve this account.",
    body: "That is usually something specific and fixable. Reply to our email or contact us and we will explain where it stands.",
  },
};

export default function PortalOverviewPage() {
  const { user } = useAuth();
  const [account, setAccount] = useState<DealerAccount | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDealerAccount()
      .then(setAccount)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Your account could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-page"><p className="admin-empty">Loading your account…</p></div>;
  if (error && !account) return <div className="admin-page"><p className="admin-banner admin-banner-error">{error}</p></div>;
  if (!account) return null;

  const copy = statusCopy[account.status];
  const firstName = account.contact_name.trim().split(/\s+/)[0] || account.contact_name;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">Dealer portal</p>
          <h1>{account.business_name}</h1>
          <p>Signed in as {user?.email}</p>
        </div>
      </header>

      <div className="admin-detail-grid">
        <section className="admin-detail-card admin-status-card">
          <div><p className="admin-card-label">Account status</p><StatusPill status={account.status} /></div>
        </section>

        <section className="admin-detail-card admin-detail-wide">
          <h2>Hello {firstName}.</h2>
          <p className="admin-message-body"><strong>{copy.heading}</strong></p>
          <p className="admin-message-body">{copy.body}</p>
        </section>

        {account.status === "active" && (
          <section className="admin-detail-card admin-detail-wide">
            <h2>What happens next</h2>
            <ol className="portal-steps">
              <li><strong>Dealership setup</strong><span>Your licence details and the information that fills the dealer side of every form, entered once.</span></li>
              <li><strong>Your sale conditions</strong><span>Read and approve each of our default special conditions, remove any that do not fit your dealership and add your own.</span></li>
              <li><strong>Your first sale</strong><span>Enter the vehicle, send the buyer a link, and get back a signed pack ready to lodge.</span></li>
            </ol>
            <p className="admin-muted">We will email you as each step opens. Nothing is lost in the meantime.</p>
          </section>
        )}

        <section className="admin-detail-card">
          <h2>Your details</h2>
          <dl className="admin-detail-list">
            <div><dt>Business</dt><dd>{account.business_name}</dd></div>
            <div><dt>Contact</dt><dd>{account.contact_name}</dd></div>
            <div><dt>Email</dt><dd>{account.email}</dd></div>
            <div><dt>Phone</dt><dd>{account.phone || "Not supplied"}</dd></div>
          </dl>
          <Link className="admin-secondary-button" href="/portal/account">Edit details</Link>
        </section>

        <section className="admin-detail-card">
          <h2>Account</h2>
          <dl className="admin-detail-list">
            <div><dt>Status</dt><dd>{account.status_label}</dd></div>
            <div><dt>Signed up</dt><dd>{formatDateTime(account.created_at)}</dd></div>
            <div><dt>Last updated</dt><dd>{formatDateTime(account.updated_at)}</dd></div>
          </dl>
          <p className="admin-muted">Questions? <a href="mailto:hello@freethedesk.com.au">hello@freethedesk.com.au</a></p>
        </section>
      </div>
    </div>
  );
}
