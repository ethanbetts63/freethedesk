"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSeoAccount, setSeoPassword, updateSeoAccount, type SeoAccount } from "@/lib/seoApi";

export default function SeoPortalAccountPage() {
  const router = useRouter();
  const [account, setAccount] = useState<SeoAccount | null>(null);
  const [form, setForm] = useState({ business_name: "", contact_name: "", phone: "", website: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  useEffect(() => {
    getSeoAccount()
      .then((result) => {
        setAccount(result);
        setForm({
          business_name: result.business_name,
          contact_name: result.contact_name,
          phone: result.phone,
          website: result.website,
        });
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Your account could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  const dirty =
    account !== null &&
    (form.business_name !== account.business_name ||
      form.contact_name !== account.contact_name ||
      form.phone !== account.phone ||
      form.website !== account.website ||
      (!account.has_usable_password && password.length > 0));

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!account) return;
    setSaving(true);
    setError("");
    setNotice("");
    if (!account?.has_usable_password && password !== passwordConfirmation) {
      setError("The passwords do not match.");
      setSaving(false);
      return;
    }
    try {
      const updated = await updateSeoAccount(form);
      if (!account.has_usable_password) await setSeoPassword(password);
      const completed = { ...updated, has_usable_password: true };
      setAccount(completed);
      setForm({
        business_name: updated.business_name,
        contact_name: updated.contact_name,
        phone: updated.phone,
        website: updated.website,
      });
      setPassword("");
      setPasswordConfirmation("");
      setNotice("Your details have been saved.");
      if (!account.has_usable_password) router.push("/seo-portal/overview");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Your details could not be saved.");
    } finally {
      setSaving(false);
    }
  }

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

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">SEO portal</p>
          <h1>{account.has_usable_password ? "Account details" : "Complete your account"}</h1>
          {!account.has_usable_password && <p>Add your details and choose the password you&apos;ll use next time.</p>}
        </div>
      </header>

      {error && <p className="admin-banner admin-banner-error">{error}</p>}
      {notice && <p className="admin-banner">{notice}</p>}

      <div className="admin-detail-grid">
        <section className="admin-detail-card admin-detail-wide">
          <h2>Your business</h2>
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
              Website
              <input
                type="url"
                placeholder="https://"
                value={form.website}
                onChange={(event) => setForm({ ...form, website: event.target.value })}
              />
            </label>
            <label>
              Email
              <input value={account.email} disabled />
              <small className="field-hint">
                This is your sign-in address. To change it, email hello@freethedesk.com.au and we will move it across.
              </small>
            </label>
            {!account.has_usable_password && (
              <>
                <label>
                  Choose a password
                  <input
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </label>
                <label>
                  Confirm password
                  <input
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={passwordConfirmation}
                    onChange={(event) => setPasswordConfirmation(event.target.value)}
                    required
                  />
                </label>
              </>
            )}
            <button type="submit" className="admin-primary-button" disabled={saving || !dirty}>
              {saving ? "Saving…" : account.has_usable_password ? "Save changes" : "Complete account setup"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
