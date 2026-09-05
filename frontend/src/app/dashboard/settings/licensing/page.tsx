"use client";

import { FormEvent, useEffect, useState } from "react";
import { formatDateTime, getLicensingSettings, updateLicensingSettings, type LicensingSettings } from "@/lib/adminApi";

type FormState = { licensing_price: string; contracts_price: string; complete_price: string };

function toForm(settings: LicensingSettings): FormState {
  return {
    licensing_price: settings.licensing_price,
    contracts_price: settings.contracts_price,
    complete_price: settings.complete_price,
  };
}

export default function LicensingSettingsPage() {
  const [settings, setSettings] = useState<LicensingSettings | null>(null);
  const [form, setForm] = useState<FormState>({ licensing_price: "", contracts_price: "", complete_price: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getLicensingSettings()
      .then((result) => { setSettings(result); setForm(toForm(result)); })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Licensing settings could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  const dirty = settings !== null && (
    form.licensing_price !== settings.licensing_price
    || form.contracts_price !== settings.contracts_price
    || form.complete_price !== settings.complete_price
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setError(""); setNotice("");
    try {
      const updated = await updateLicensingSettings(form);
      setSettings(updated);
      setForm(toForm(updated));
      setNotice("Licensing settings have been saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Licensing settings could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="admin-page"><p className="admin-empty">Loading licensing settings…</p></div>;
  if (error && !settings) return <div className="admin-page"><p className="admin-banner admin-banner-error">{error}</p></div>;
  if (!settings) return null;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div><p className="admin-kicker">Site settings</p><h1>Licensing settings</h1></div>
      </header>

      {error && <p className="admin-banner admin-banner-error">{error}</p>}
      {notice && <p className="admin-banner">{notice}</p>}

      <div className="admin-detail-grid">
        <section className="admin-detail-card admin-detail-wide">
          <h2>Subscription prices</h2>
          <p className="admin-muted">
            These are the prices shown on the public licensing page and at checkout. All prices are GST inclusive —
            this is the total a dealer pays each month, with nothing added on top.
          </p>
          <form className="admin-compose-form" onSubmit={submit}>
            <label>
              Online licensing ($ / month, GST inc.)
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.licensing_price}
                onChange={(event) => setForm({ ...form, licensing_price: event.target.value })}
                required
              />
            </label>
            <label>
              Online contracts ($ / month, GST inc.)
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.contracts_price}
                onChange={(event) => setForm({ ...form, contracts_price: event.target.value })}
                required
              />
            </label>
            <label>
              Licensing + contracts ($ / month, GST inc.)
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.complete_price}
                onChange={(event) => setForm({ ...form, complete_price: event.target.value })}
                required
              />
            </label>
            <button className="admin-primary-button" disabled={saving || !dirty}>
              {saving ? "Saving…" : "Save changes"}
            </button>
            <p className="field-hint">Last updated {formatDateTime(settings.updated_at)}.</p>
          </form>
        </section>
      </div>
    </div>
  );
}
