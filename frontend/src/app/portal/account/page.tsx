"use client";

import { FormEvent, useEffect, useState } from "react";
import { getDealerAccount, updateDealerAccount, type DealerAccount } from "@/lib/dealerApi";

export default function PortalAccountPage() {
  const [account, setAccount] = useState<DealerAccount | null>(null);
  const [form, setForm] = useState({ business_name: "", contact_name: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getDealerAccount()
      .then((result) => {
        setAccount(result);
        setForm({ business_name: result.business_name, contact_name: result.contact_name, phone: result.phone });
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Your account could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  const dirty = account !== null && (
    form.business_name !== account.business_name
    || form.contact_name !== account.contact_name
    || form.phone !== account.phone
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setError(""); setNotice("");
    try {
      const updated = await updateDealerAccount(form);
      setAccount(updated);
      setForm({ business_name: updated.business_name, contact_name: updated.contact_name, phone: updated.phone });
      setNotice("Your details have been saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Your details could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="admin-page"><p className="admin-empty">Loading your account…</p></div>;
  if (error && !account) return <div className="admin-page"><p className="admin-banner admin-banner-error">{error}</p></div>;
  if (!account) return null;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div><p className="admin-kicker">Dealer portal</p><h1>Account details</h1></div>
      </header>

      {error && <p className="admin-banner admin-banner-error">{error}</p>}
      {notice && <p className="admin-banner">{notice}</p>}

      <div className="admin-detail-grid">
        <section className="admin-detail-card admin-detail-wide">
          <h2>Your dealership</h2>
          <form className="admin-compose-form" onSubmit={submit}>
            <label>
              Business name
              <input
                value={form.business_name}
                onChange={(event) => setForm({ ...form, business_name: event.target.value })}
                required
              />
            </label>
            <label>
              Contact name
              <input
                value={form.contact_name}
                onChange={(event) => setForm({ ...form, contact_name: event.target.value })}
                required
              />
            </label>
            <label>
              Phone
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </label>
            <label>
              Email
              <input value={account.email} disabled />
              <small className="field-hint">
                This is your sign-in address. To change it, email hello@freethedesk.com.au and we will move it across.
              </small>
            </label>
            <button className="admin-primary-button" disabled={saving || !dirty}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
