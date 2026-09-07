"use client";

import { FormEvent, useEffect, useState } from "react";
import { formatDateTime, getSiteSettings, updateSiteSettings, type SiteSettings } from "@/lib/adminApi";

type PriceField = Exclude<keyof SiteSettings, "updated_at">;
type FormState = Record<PriceField, string>;

const LICENSING_FIELDS: { field: PriceField; label: string }[] = [
  { field: "licensing_price", label: "Online licensing ($ / month, GST inc.)" },
  { field: "contracts_price", label: "Online contracts ($ / month, GST inc.)" },
  { field: "complete_price", label: "Licensing + contracts ($ / month, GST inc.)" },
];

const SEO_FIELDS: { field: PriceField; label: string }[] = [
  { field: "seo_monthly_price", label: "SEO report — monthly ($ / report, GST inc.)" },
  { field: "seo_quarterly_price", label: "SEO report — quarterly ($ / report, GST inc.)" },
  { field: "seo_biannual_price", label: "SEO report — bi-annual ($ / report, GST inc.)" },
  { field: "seo_oneoff_price", label: "SEO report — one-off ($ once, GST inc.)" },
  { field: "gbp_audit_price", label: "Google Business Profile audit ($ once, GST inc.)" },
];

const ALL_FIELDS = [...LICENSING_FIELDS, ...SEO_FIELDS];

function toForm(settings: SiteSettings): FormState {
  return Object.fromEntries(ALL_FIELDS.map(({ field }) => [field, settings[field]])) as FormState;
}

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getSiteSettings()
      .then((result) => { setSettings(result); setForm(toForm(result)); })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Site settings could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  const dirty = settings !== null && form !== null
    && ALL_FIELDS.some(({ field }) => form[field] !== settings[field]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const updated = await updateSiteSettings(form);
      setSettings(updated);
      setForm(toForm(updated));
      setNotice("Site settings have been saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Site settings could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="admin-page"><p className="admin-empty">Loading site settings…</p></div>;
  if (error && !settings) return <div className="admin-page"><p className="admin-banner admin-banner-error">{error}</p></div>;
  if (!settings || !form) return null;

  const renderField = ({ field, label }: { field: PriceField; label: string }) => (
    <label key={field}>
      {label}
      <input
        type="number"
        min="0"
        step="0.01"
        value={form[field]}
        onChange={(event) => setForm({ ...form, [field]: event.target.value })}
        required
      />
    </label>
  );

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div><p className="admin-kicker">Site settings</p><h1>Site settings</h1></div>
      </header>

      {error && <p className="admin-banner admin-banner-error">{error}</p>}
      {notice && <p className="admin-banner">{notice}</p>}

      <form className="admin-detail-grid" onSubmit={submit}>
        <section className="admin-detail-card admin-detail-wide">
          <h2>Licensing subscription prices</h2>
          <p className="admin-muted">
            These are the prices shown on the public licensing page and at checkout. All prices are GST inclusive —
            this is the total a dealer pays each month, with nothing added on top.
          </p>
          <div className="admin-compose-form">
            {LICENSING_FIELDS.map(renderField)}
          </div>
        </section>

        <section className="admin-detail-card admin-detail-wide">
          <h2>SEO report prices</h2>
          <p className="admin-muted">
            Prices shown on the public SEO page. Each subscription price is what a customer pays per report at that
            cadence. The Google Business Profile audit is a one-off and comes free with every report plan.
          </p>
          <div className="admin-compose-form">
            {SEO_FIELDS.map(renderField)}
            <button className="admin-primary-button" disabled={saving || !dirty}>
              {saving ? "Saving…" : "Save changes"}
            </button>
            <p className="field-hint">Last updated {formatDateTime(settings.updated_at)}.</p>
          </div>
        </section>
      </form>
    </div>
  );
}
