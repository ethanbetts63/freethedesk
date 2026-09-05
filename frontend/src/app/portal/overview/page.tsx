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

  const copy = account.payment_status === "active" && account.status === "pending"
    ? { heading: "Payment confirmed. Set up your dealership.", body: "Add the licence, business and authorised-officer details we need to verify the dealership. Your account can be used for live transactions once that review is complete." }
    : account.payment_status === "payment_pending"
      ? { heading: "Your account is saved.", body: "Your selected subscription has not been paid yet. Continue when you are ready; you will not need to enter these signup details again." }
      : account.payment_status === "demo"
        ? { heading: "Your demo account is open.", body: "You can explore the portal without completing payment or dealership verification." }
        : statusCopy[account.status];
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

        {account.payment_status === "payment_pending" && (
          <section className="admin-detail-card admin-detail-wide">
            <h2>Finish secure payment</h2>
            <p className="admin-message-body">Your account is saved. Complete payment to unlock dealership setup and verification.</p>
            <Link className="admin-primary-button" href="/licensing/payment">Continue to payment →</Link>
          </section>
        )}

        {account.payment_status === "demo" && (
          <section className="admin-detail-card admin-detail-wide">
            <h2>Your demo is ready</h2>
            <p className="admin-message-body">Explore the journey without entering payment details. Live licensing and contract transactions stay off until you choose a paid plan.</p>
            <Link className="admin-primary-button" href="/licensing#signup">Compare plans →</Link>
          </section>
        )}

        <section className="admin-detail-card admin-detail-wide">
          <h2>Hello {firstName}.</h2>
          <p className="admin-message-body"><strong>{copy.heading}</strong></p>
          <p className="admin-message-body">{copy.body}</p>
        </section>

        {account.payment_status === "active" && (
          <section className="admin-detail-card admin-detail-wide">
            <h2>What happens next</h2>
            <ol className="portal-steps">
              <li><strong>Dealership setup</strong><span>Your licence details and the information that fills the dealer side of every form, entered once.</span></li>
              <li><strong>Your sale conditions</strong><span>Read and approve each of our default special conditions, remove any that do not fit your dealership and add your own.</span></li>
              <li><strong>Your first sale</strong><span>Enter the vehicle, send the buyer a link, and get back a signed pack ready to lodge.</span></li>
            </ol>
            <Link className="admin-primary-button" href="/portal/setup">Start dealership setup →</Link>
          </section>
        )}

        <section className="admin-detail-card">
          <h2>Your details</h2>
          <dl className="admin-detail-list">
            <div><dt>Business</dt><dd>{account.business_name}</dd></div>
            <div><dt>Contact</dt><dd>{account.contact_name}</dd></div>
            <div><dt>Email</dt><dd>{account.email}</dd></div>
            <div><dt>Phone</dt><dd>{account.phone || "Not supplied"}</dd></div>
            <div><dt>State</dt><dd>{account.state_label}</dd></div>
          </dl>
          <Link className="admin-secondary-button" href="/portal/account">Edit details</Link>
        </section>

        <section className="admin-detail-card">
          <h2>Account</h2>
          <dl className="admin-detail-list">
            <div><dt>Plan</dt><dd>{account.plan_label}</dd></div>
            <div><dt>Payment</dt><dd>{account.payment_status_label}</dd></div>
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
