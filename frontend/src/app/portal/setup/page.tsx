'use client';

import { useActionState, useEffect, useState } from 'react';

import { getDealerOnboarding, type DealerOnboardingProfile } from '@/lib/dealerApi';
import { submitDealerSetup, type DealerSetupState } from './DealerSetup.actions';
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

const initialState: DealerSetupState = { status: 'idle' };

const textFields = [
  ['legal_name', 'Legal business name', 'Exactly as registered.'],
  ['dealer_licence_number', 'Dealer licence (MD)', 'Printed on licensing and contract forms.'],
  ['repairer_licence_number', 'Repairer licence (MRB)', 'Leave blank if it does not apply.'],
  ['organisation_code', 'DoT organisation code', 'Organisation code or premises number.'],
  ['abn', 'ABN', '11 digits.'],
  ['acn', 'ACN', 'Leave blank if it does not apply.'],
] as const;

const addressFields = [
  ['address_line1', 'Street address'],
  ['suburb', 'Suburb'],
  ['postcode', 'Postcode'],
] as const;

const officerFields = [
  [
    'authorised_officer_name',
    'Authorised officer',
    "The person who signs the Seller's Declaration.",
  ],
  ['authorised_officer_licence_number', 'Officer licence number', 'As shown on their licence.'],
  ['declared_at', 'Declared at', 'The suburb declarations are signed in.'],
] as const;

export default function DealerSetupPage() {
  const [loadedProfile, setLoadedProfile] = useState<DealerOnboardingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [state, dispatch, saving] = useActionState(submitDealerSetup, initialState);

  useEffect(() => {
    getDealerOnboarding()
      .then(setLoadedProfile)
      .catch((reason) =>
        setLoadError(reason instanceof Error ? reason.message : 'Setup could not be loaded.'),
      )
      .finally(() => setLoading(false));
  }, []);

  const profileToShow = state.status === 'success' && state.profile ? state.profile : loadedProfile;
  const error = state.status === 'error' ? state.error : loadError;
  const notice = state.status === 'success' ? state.notice : undefined;

  if (loading)
    return (
      <div className={adminPageClassName}>
        <p className="text-text-subtle">Loading dealership setup…</p>
      </div>
    );
  if (!profileToShow)
    return (
      <div className={adminPageClassName}>
        <AdminNotice tone="danger">{error}</AdminNotice>
      </div>
    );
  const profile = profileToShow;
  const locked = profile.onboarding_status === 'submitted';

  return (
    <div className={adminPageClassName}>
      <AdminPageHeader
        kicker="Onboarding"
        title="Dealership setup"
        subtitle="Enter this once. We use it to prefill the dealer side of each workflow."
      />
      <AdminNotice tone="success">
        Setup status: <strong>{profile.onboarding_status_label}</strong>
      </AdminNotice>
      {error && <AdminNotice tone="danger">{error}</AdminNotice>}
      {notice && <AdminNotice tone="success">{notice}</AdminNotice>}

      <form className={portalFormClassName} action={dispatch}>
        <PortalFieldset
          disabled={locked || saving}
          legend="Business and licence details"
          description="These details identify the licensed dealership and prefill supplier and licensing forms."
        >
          <div className={portalFieldGridClassName}>
            {textFields.map(([name, label, hint]) => (
              <PortalField
                key={name}
                label={label}
                hint={hint}
                name={name}
                defaultValue={profile[name] ?? ''}
              />
            ))}
          </div>
        </PortalFieldset>

        <PortalFieldset
          disabled={locked || saving}
          legend="Dealership contact"
          description="Trading name, state, phone and email come from your account so they are maintained in one place."
        >
          <p className="text-ui text-text-subtle">
            {profile.trading_name} · {profile.state} ·{' '}
            {profile.phone || 'Phone required before submission'} · {profile.email}
          </p>
          <div className={portalFieldGridClassName}>
            {addressFields.map(([name, label]) => (
              <PortalField
                key={name}
                label={label}
                name={name}
                type="text"
                defaultValue={profile[name] ?? ''}
              />
            ))}
          </div>
        </PortalFieldset>

        <PortalFieldset
          disabled={locked || saving}
          legend="Authorised officer"
          description="The authorised person responsible for the Dealer's declarations."
        >
          <div className={portalFieldGridClassName}>
            {officerFields.map(([name, label, hint]) => (
              <PortalField
                key={name}
                label={label}
                hint={hint}
                name={name}
                defaultValue={profile[name] ?? ''}
              />
            ))}
            <PortalField
              label="Officer date of birth"
              name="authorised_officer_date_of_birth"
              type="date"
              defaultValue={profile.authorised_officer_date_of_birth ?? ''}
            />
          </div>
        </PortalFieldset>

        <PortalFieldset
          disabled={locked || saving}
          legend="Verification documents"
          description="PDF, JPG, PNG or WebP. Maximum 10 MB per file."
        >
          <div className={portalFieldGridClassName}>
            <PortalField
              label="Dealer licence"
              name="dealer_licence_document"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              hint={
                profile.dealer_licence_document_uploaded
                  ? 'Already uploaded — choose a file only to replace it.'
                  : 'Required before submission.'
              }
            />
            <PortalField
              label="Authorised officer ID"
              name="authorised_officer_identity_document"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              hint={
                profile.authorised_officer_identity_document_uploaded
                  ? 'Already uploaded — choose a file only to replace it.'
                  : 'Required before submission.'
              }
            />
            <PortalField
              label="Business evidence"
              name="business_evidence_document"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              hint={
                profile.business_evidence_document_uploaded
                  ? 'Already uploaded — choose a file only to replace it.'
                  : 'Required before submission.'
              }
            />
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
              Save and submit for verification
            </AdminButton>
          </div>
        )}
        {locked && (
          <p className="text-ui text-text-subtle">
            This profile is locked while it is being reviewed. We will let you know if anything
            needs changing.
          </p>
        )}
      </form>
    </div>
  );
}
