"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  getDealerOnboarding,
  submitDealerOnboarding,
  updateDealerOnboarding,
  type DealerOnboardingProfile,
} from "@/lib/dealerApi";

const textFields = [
  ["legal_name", "Legal business name", "Exactly as registered."],
  ["dealer_licence_number", "Dealer licence (MD)", "Printed on licensing and contract forms."],
  ["repairer_licence_number", "Repairer licence (MRB)", "Leave blank if it does not apply."],
  ["organisation_code", "DoT organisation code", "Organisation code or premises number."],
  ["abn", "ABN", "11 digits."],
  ["acn", "ACN", "Leave blank if it does not apply."],
] as const;

const addressFields = [
  ["address_line1", "Street address"], ["suburb", "Suburb"], ["postcode", "Postcode"],
] as const;

const officerFields = [
  ["authorised_officer_name", "Authorised officer", "The person who signs the Seller's Declaration."],
  ["authorised_officer_licence_number", "Officer licence number", "As shown on their licence."],
  ["declared_at", "Declared at", "The suburb declarations are signed in."],
] as const;

function cleanForm(form: HTMLFormElement) {
  const data = new FormData(form);
  for (const [key, value] of data.entries()) {
    if (value instanceof File && !value.name) data.delete(key);
  }
  return data;
}

export default function DealerSetupPage() {
  const [profile, setProfile] = useState<DealerOnboardingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    getDealerOnboarding()
      .then(setProfile)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Setup could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  async function save(form: HTMLFormElement, submitForReview = false) {
    setSaving(true); setError(""); setNotice("");
    try {
      const updated = await updateDealerOnboarding(cleanForm(form));
      const finalProfile = submitForReview ? await submitDealerOnboarding() : updated;
      setProfile(finalProfile);
      setNotice(submitForReview ? "Your dealership details have been submitted for verification." : "Draft saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Your setup could not be saved.");
    } finally { setSaving(false); }
  }

  if (loading) return <div className="admin-page"><p className="admin-empty">Loading dealership setup…</p></div>;
  if (!profile) return <div className="admin-page"><p className="admin-banner admin-banner-error">{error}</p></div>;
  const locked = profile.verification_status === "submitted" || profile.verification_status === "verified";

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div><p className="admin-kicker">Onboarding</p><h1>Dealership setup</h1><p>Enter this once. We use it to prefill the dealer side of each workflow.</p></div>
      </header>
      <p className="admin-banner">Verification status: <strong>{profile.verification_status_label}</strong></p>
      {error && <p className="admin-banner admin-banner-error">{error}</p>}
      {notice && <p className="admin-banner">{notice}</p>}

      <form className="portal-setup-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); save(event.currentTarget, false); }}>
        <fieldset disabled={locked || saving}>
          <legend>Business and licence details</legend>
          <p>These details identify the licensed dealership and prefill supplier and licensing forms.</p>
          <div className="portal-field-grid">
            {textFields.map(([name, label, hint]) => <label key={name}><span>{label}</span><input name={name} defaultValue={profile[name] ?? ""} /><small>{hint}</small></label>)}
          </div>
        </fieldset>

        <fieldset disabled={locked || saving}>
          <legend>Dealership contact</legend>
          <p>Trading name, state, phone and email come from your account so they are maintained in one place.</p>
          <p className="admin-muted">{profile.trading_name} · {profile.state} · {profile.phone || "Phone required before submission"} · {profile.email}</p>
          <div className="portal-field-grid">
            {addressFields.map(([name, label]) => <label key={name}><span>{label}</span><input name={name} type="text" defaultValue={profile[name] ?? ""} /></label>)}
          </div>
        </fieldset>

        <fieldset disabled={locked || saving}>
          <legend>Authorised officer</legend>
          <p>The authorised person responsible for the Dealer&apos;s declarations.</p>
          <div className="portal-field-grid">
            {officerFields.map(([name, label, hint]) => <label key={name}><span>{label}</span><input name={name} defaultValue={profile[name] ?? ""} /><small>{hint}</small></label>)}
            <label><span>Officer date of birth</span><input name="authorised_officer_date_of_birth" type="date" defaultValue={profile.authorised_officer_date_of_birth ?? ""} /></label>
          </div>
        </fieldset>

        <fieldset disabled={locked || saving}>
          <legend>Verification documents</legend>
          <p>PDF, JPG, PNG or WebP. Maximum 10 MB per file.</p>
          <div className="portal-field-grid portal-file-grid">
            <label><span>Dealer licence</span><input name="dealer_licence_document" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" /><small>{profile.dealer_licence_document_uploaded ? "Already uploaded — choose a file only to replace it." : "Required before submission."}</small></label>
            <label><span>Authorised officer ID</span><input name="authorised_officer_identity_document" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" /><small>{profile.authorised_officer_identity_document_uploaded ? "Already uploaded — choose a file only to replace it." : "Required before submission."}</small></label>
            <label><span>Business evidence</span><input name="business_evidence_document" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" /><small>{profile.business_evidence_document_uploaded ? "Already uploaded — choose a file only to replace it." : "Required before submission."}</small></label>
          </div>
        </fieldset>

        {!locked && <div className="portal-form-actions"><button className="admin-secondary-button" disabled={saving}>{saving ? "Saving…" : "Save draft"}</button><button className="admin-primary-button" type="button" disabled={saving} onClick={(event) => { const form = event.currentTarget.form; if (form) save(form, true); }}>Save and submit for verification</button></div>}
        {locked && <p className="admin-muted">This profile is locked while it is being reviewed. We will let you know if anything needs changing.</p>}
      </form>
    </div>
  );
}
