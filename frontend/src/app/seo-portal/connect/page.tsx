'use client';

import { useActionState, useEffect, useState } from 'react';

import {
  getSeoOnboarding,
  getSeoAccount,
  type SeoOnboardingChanges,
  type SeoOnboardingProfile,
} from '@/lib/seoApi';
import { submitSeoConnect, type SeoConnectState } from './SeoConnect.actions';
import { AdminButton } from '@/components/dashboard/AdminButton';
import {
  PortalField,
  PortalFieldset,
  portalFieldGridClassName,
  portalFormActionsClassName,
  portalFormClassName,
} from '@/components/dashboard/PortalField';
import { AdminNotice } from '@/components/dashboard/AdminNotice';
import { AdminPageHeader } from '@/components/dashboard/AdminPageHeader';
import { adminPageClassName } from '@/components/dashboard/adminLayout';

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
      <div className={adminPageClassName}>
        <p className="text-text-subtle">Loading your setup…</p>
      </div>
    );
  if (!profile)
    return (
      <div className={adminPageClassName}>
        <AdminNotice tone="danger">{error}</AdminNotice>
      </div>
    );
  const locked = profile.onboarding_status === 'submitted';

  return (
    <div className={adminPageClassName}>
      <AdminPageHeader
        kicker="Onboarding"
        title={isGbpAudit ? 'Add your profile details' : 'Connect your data'}
        subtitle={
          isGbpAudit
            ? 'Send us the profile and location we should review.'
            : 'Tell us where to look and what matters. We use this to focus every report.'
        }
      />
      <AdminNotice tone="success">
        Status: <strong>{profile.onboarding_status_label}</strong>
      </AdminNotice>
      {error && <AdminNotice tone="danger">{error}</AdminNotice>}
      {notice && <AdminNotice tone="success">{notice}</AdminNotice>}

      <form className={portalFormClassName} onSubmit={onSubmit}>
        <PortalFieldset
          disabled={locked || saving}
          legend={isGbpAudit ? 'Audit brief' : 'Reporting brief'}
        >
          <div className={portalFieldGridClassName}>
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
              return kind === 'textarea' ? (
                <PortalField
                  key={name}
                  multiline
                  label={label}
                  hint={hint}
                  name={name}
                  rows={4}
                  value={form[name] ?? ''}
                  onChange={(event) => setForm({ ...form, [name]: event.target.value })}
                />
              ) : (
                <PortalField
                  key={name}
                  label={label}
                  hint={hint}
                  name={name}
                  value={form[name] ?? ''}
                  onChange={(event) => setForm({ ...form, [name]: event.target.value })}
                />
              );
            })}
          </div>
        </PortalFieldset>

        {!locked && (
          <div className={portalFormActionsClassName}>
            <AdminButton
              variant="secondary"
              type="submit"
              name="intent"
              value="draft"
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save draft'}
            </AdminButton>
            <AdminButton type="submit" name="intent" value="submit" disabled={saving}>
              Save and submit
            </AdminButton>
          </div>
        )}
        {locked && (
          <p className="text-label text-text-subtle">
            Your brief is in. We will be in touch if we need anything else.
          </p>
        )}
      </form>
    </div>
  );
}
