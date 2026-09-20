'use client';

import { useActionState, useEffect, useState } from 'react';

import {
  getDealerAccount,
  getDealerOnboarding,
  type DealerAccount,
  type DealerOnboardingProfile,
} from '@/lib/dealerApi';
import { SpecialConditions } from './_components/SpecialConditions';
import { TradingDetails } from './_components/TradingDetails';
import { submitDealerSetup, type DealerSetupState } from './DealerSetup.actions';
import { Button } from '@/components/ui/Button';
import {
  PortalField,
  PortalFieldset,
  portalFieldGridClassName,
  portalFormActionsClassName,
  portalFormClassName,
} from '@/components/dashboard/PortalField';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';

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
  const [account, setAccount] = useState<DealerAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [state, dispatch, saving] = useActionState(submitDealerSetup, initialState);

  useEffect(() => {
    Promise.all([getDealerOnboarding(), getDealerAccount()])
      .then(([profile, dealerAccount]) => {
        setLoadedProfile(profile);
        setAccount(dealerAccount);
      })
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
      <div className={pageClassName}>
        <p className="text-text-subtle">Loading dealership setup…</p>
      </div>
    );
  if (!profileToShow)
    return (
      <div className={pageClassName}>
        <Notice tone="danger">{error}</Notice>
      </div>
    );
  const profile = profileToShow;
  const locked = profile.onboarding_status === 'submitted';

  return (
    <div className={pageClassName}>
      <PageHeader
        kicker="Onboarding"
        title="Dealership setup"
        subtitle="Enter this once. We use it to prefill the dealer side of each workflow."
      />
      <Notice tone="success">
        Setup status: <strong>{profile.onboarding_status_label}</strong>
      </Notice>
      {error && <Notice tone="danger">{error}</Notice>}
      {notice && <Notice tone="success">{notice}</Notice>}

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
          <p className="text-label text-text-subtle">
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
            <Button variant="secondary" type="submit" name="intent" value="draft" disabled={saving}>
              {saving ? 'Saving…' : 'Save draft'}
            </Button>
            <Button type="submit" name="intent" value="submit" disabled={saving}>
              Save and submit for verification
            </Button>
          </div>
        )}
        {locked && (
          <p className="text-label text-text-subtle">
            This profile is locked while it is being reviewed. We will let you know if anything
            needs changing.
          </p>
        )}
      </form>

      <section className="mt-xl">
        <PageHeader
          kicker="Getting paid"
          title="Trading details"
          subtitle="Where your customers send the balance, and how you sign a contract."
        />
        <TradingDetails />
      </section>

      {/* A licensing-only dealer has no Schedule 5 contract, so there is nothing
          here for them to decide. They get the Authority to Lodge, which carries
          the same authority and is not negotiable. */}
      {account && account.plan !== 'licensing' && (
        <section className="mt-xl">
          <PageHeader
            kicker="Your contract"
            title="Special conditions"
            subtitle="The conditions printed on the face of every Vehicle Sale Contract you issue."
          />
          <SpecialConditions />
        </section>
      )}
    </div>
  );
}
