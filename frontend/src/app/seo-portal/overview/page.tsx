"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { useAuth } from "@/context/AuthContext";
import { formatDateTime } from "@/lib/api";
import { getSeoAccount, type SeoAccount } from "@/lib/seoApi";

const statusCopy: Record<SeoAccount["status"], { heading: string; body: string }> = {
  pending: {
    heading: "We are getting your account ready.",
    body: "We check every new account by hand before switching it on — usually within a business day. There is nothing for you to do in the meantime, and we will email you the moment it is done.",
  },
  active: {
    heading: "Your account is active.",
    body: "Connect your Search Console data and tell us what to focus the reporting on. Your first report follows once that is in.",
  },
  suspended: {
    heading: "This account is suspended.",
    body: "You can still sign in, but reporting is paused. Get in touch and we will sort out what happened.",
  },
  denied: {
    heading: "We could not approve this account.",
    body: "That is usually something specific and fixable. Reply to our email or contact us and we will explain where it stands.",
  },
};

export default function SeoPortalOverviewPage() {
  const { user } = useAuth();
  const [account, setAccount] = useState<SeoAccount | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSeoAccount()
      .then(setAccount)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Your account could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="admin-page">
        <p className="admin-empty">Loading your account…</p>
      </div>
    );
  if (error && !account)
    return (
      <div className="admin-page">
        <p className="admin-banner admin-banner-error">{error}</p>
      </div>
    );
  if (!account) return null;

  const hasPaid = account.payment_status === "active" || account.payment_status === "paid";
  const copy =
    account.payment_status === "payment_pending"
      ? {
          heading: "Your account is saved.",
          body: "Your selected plan has not been paid yet. Continue when you are ready; you will not need to enter these signup details again.",
        }
      : hasPaid && account.status === "pending"
        ? {
            heading: "Payment confirmed. Connect your data.",
            body: "Add your Search Console property and tell us what to focus on. Your first report follows once we have reviewed the account.",
          }
        : statusCopy[account.status];
  const firstName = account.contact_name.trim().split(/\s+/)[0] || account.contact_name;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">SEO portal</p>
          <h1>{account.business_name}</h1>
          <p>Signed in as {user?.email}</p>
        </div>
      </header>

      <div className="admin-detail-grid">
        <section className="admin-detail-card admin-status-card">
          <div>
            <p className="admin-card-label">Account status</p>
            <StatusPill status={account.status} />
          </div>
        </section>

        {account.payment_status === "payment_pending" && (
          <section className="admin-detail-card admin-detail-wide">
            <h2>Finish secure payment</h2>
            <p className="admin-message-body">
              Your account is saved. Complete payment to unlock your reporting setup.
            </p>
            <Link className="admin-primary-button" href="/seo/payment">
              Continue to payment →
            </Link>
          </section>
        )}

        <section className="admin-detail-card admin-detail-wide">
          <h2>Hello {firstName}.</h2>
          <p className="admin-message-body">
            <strong>{copy.heading}</strong>
          </p>
          <p className="admin-message-body">{copy.body}</p>
        </section>

        {hasPaid && (
          <section className="admin-detail-card admin-detail-wide">
            <h2>What happens next</h2>
            <ol className="portal-steps">
              <li>
                <strong>Connect your data</strong>
                <span>
                  Grant access to Search Console and, if relevant, Analytics and your Google Business Profile.
                </span>
              </li>
              <li>
                <strong>Tell us the focus</strong>
                <span>Target locations, the searches you care about and who you compete with.</span>
              </li>
              <li>
                <strong>Your first report</strong>
                <span>A plain-English, ranked action list lands in your inbox.</span>
              </li>
            </ol>
            <Link className="admin-primary-button" href="/seo-portal/connect">
              Connect your data →
            </Link>
          </section>
        )}

        <section className="admin-detail-card">
          <h2>Your details</h2>
          <dl className="admin-detail-list">
            <div>
              <dt>Business</dt>
              <dd>{account.business_name}</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>{account.contact_name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{account.email}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{account.phone || "Not supplied"}</dd>
            </div>
            <div>
              <dt>Website</dt>
              <dd>{account.website || "Not supplied"}</dd>
            </div>
          </dl>
          <Link className="admin-secondary-button" href="/seo-portal/account">
            Edit details
          </Link>
        </section>

        <section className="admin-detail-card">
          <h2>Account</h2>
          <dl className="admin-detail-list">
            <div>
              <dt>Plan</dt>
              <dd>{account.plan_label}</dd>
            </div>
            <div>
              <dt>Payment</dt>
              <dd>{account.payment_status_label}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{account.status_label}</dd>
            </div>
            <div>
              <dt>Signed up</dt>
              <dd>{formatDateTime(account.created_at)}</dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>{formatDateTime(account.updated_at)}</dd>
            </div>
          </dl>
          <p className="admin-muted">
            Questions? <a href="mailto:hello@freethedesk.com.au">hello@freethedesk.com.au</a>
          </p>
        </section>
      </div>
    </div>
  );
}
