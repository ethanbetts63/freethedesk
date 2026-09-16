'use client';

import { useActionState, useEffect, useState } from 'react';

import {
  getSeoOnboarding,
  getSeoAccount,
  type SeoOnboardingChanges,
  type SeoOnboardingProfile,
} from '@/lib/seoApi';
import { submitSeoConnect, type SeoConnectState } from './SeoConnect.actions';

const initialState: SeoConnectState = { status: 'idle' };

const fields: [keyof SeoOnboardingChanges, string, string, 'input' | 'textarea'][] = [
  ['website_url', 'Website URL', 'The site the reporting covers.', 'input'],
  [
    'search_console_property',
    'Search Console property',
    'e.g. sc-domain:example.com or the full URL prefix.',
    'input',
  ],
  [
    'google_business_profile_url',
    'Google Business Profile',
    'Link to the profile, if you have one.',
    'input',
  ],
  ['primary_location', 'Primary location', 'The town or city customers search from.', 'input'],
  [
    'target_keywords',
    'Target searches',
    'One per line — the searches you want to win.',
    'textarea',
  ],
  ['competitors', 'Competitors', 'One per line — who shows up where you want to.', 'textarea'],
  ['notes', 'Anything else', 'Context that would help us focus the report.', 'textarea'],
];

export default function SeoPortalConnectPage() {
  const [loadedProfile, setLoadedProfile] = useState<SeoOnboardingProfile | null>(null);
  const [form, setForm] = useState<SeoOnboardingChanges>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isGbpAudit, setIsGbpAudit] = useState(false);
  const [state, dispatch, saving] = useActionState(submitSeoConnect, initialState);

  useEffect(() => {
    Promise.all([getSeoOnboarding(), getSeoAccount()])
      .then(([result, account]) => {
        setIsGbpAudit(account.report_type === 'gbp');
        setLoadedProfile(result);
        setForm({
          website_url: result.website_url,
          search_console_property: result.search_console_property,
          google_business_profile_url: result.google_business_profile_url,
          primary_location: result.primary_location,
          target_keywords: result.target_keywords,
          competitors: result.competitors,
          notes: result.notes,
        });
      })
      .catch((reason) =>
        setLoadError(reason instanceof Error ? reason.message : 'Setup could not be loaded.'),
      )
      .finally(() => setLoading(false));
  }, []);

  const profile = state.status === 'success' && state.profile ? state.profile : loadedProfile;
  const error = state.status === 'error' ? state.error : loadError;
  const notice =
    state.status === 'success' && !saving
      ? state.intent === 'submit'
        ? `Thanks — your ${isGbpAudit ? 'audit details have' : 'reporting brief has'} been submitted.`
        : 'Draft saved.'
      : '';

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(new FormData(event.currentTarget));
  };

  if (loading)
    return (
      <div className="admin-page">
        <p className="admin-empty">Loading your setup…</p>
      </div>
    );
  if (!profile)
    return (
      <div className="admin-page">
        <p className="admin-banner admin-banner-error">{error}</p>
      </div>
    );
  const locked = profile.onboarding_status === 'submitted';

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">Onboarding</p>
          <h1>{isGbpAudit ? 'Add your profile details' : 'Connect your data'}</h1>
          <p>
            {isGbpAudit
              ? 'Send us the profile and location we should review.'
              : 'Tell us where to look and what matters. We use this to focus every report.'}
          </p>
        </div>
      </header>
      <p className="admin-banner">
        Status: <strong>{profile.onboarding_status_label}</strong>
      </p>
      {error && <p className="admin-banner admin-banner-error">{error}</p>}
      {notice && <p className="admin-banner">{notice}</p>}

      <form className="portal-setup-form" onSubmit={onSubmit}>
        <fieldset disabled={locked || saving}>
          <legend>{isGbpAudit ? 'Audit brief' : 'Reporting brief'}</legend>
          <div className="portal-field-grid">
            {fields.map(([name, label, hint, kind]) => {
              const shown =
                !isGbpAudit ||
                [
                  'website_url',
                  'google_business_profile_url',
                  'primary_location',
                  'notes',
                ].includes(name);
              // Fields hidden for this account type still round-trip their
              // last-saved value via a hidden input, so saving doesn't blank
              // them out just because they aren't shown right now.
              if (!shown)
                return <input key={name} type="hidden" name={name} value={form[name] ?? ''} />;
              return (
                <label key={name}>
                  <span>{label}</span>
                  {kind === 'textarea' ? (
                    <textarea
                      name={name}
                      rows={4}
                      value={form[name] ?? ''}
                      onChange={(event) => setForm({ ...form, [name]: event.target.value })}
                    />
                  ) : (
                    <input
                      name={name}
                      value={form[name] ?? ''}
                      onChange={(event) => setForm({ ...form, [name]: event.target.value })}
                    />
                  )}
                  <small>{hint}</small>
                </label>
              );
            })}
          </div>
        </fieldset>

        {!locked && (
          <div className="portal-form-actions">
            <button
              type="submit"
              name="intent"
              value="draft"
              className="admin-secondary-button"
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save draft'}
            </button>
            <button
              type="submit"
              name="intent"
              value="submit"
              className="admin-primary-button"
              disabled={saving}
            >
              Save and submit
            </button>
          </div>
        )}
        {locked && (
          <p className="admin-muted">
            Your brief is in. We will be in touch if we need anything else.
          </p>
        )}
      </form>
    </div>
  );
}
