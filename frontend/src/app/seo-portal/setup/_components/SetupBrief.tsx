'use client';

import { useActionState, useState } from 'react';

import {
  PortalField,
  PortalFieldset,
  portalFieldGridClassName,
  portalFormActionsClassName,
  portalFormClassName,
} from '@/components/dashboard/PortalField';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import type { SeoOnboardingChanges, SeoOnboardingProfile } from '@/lib/seoApi';
import { submitSetupBrief, type SetupBriefState } from './SetupBrief.actions';

const initialState: SetupBriefState = { status: 'idle' };

const fields: [keyof SeoOnboardingChanges, string, string, 'input' | 'textarea'][] = [
  ['website_url', 'Website URL', 'The site the audit covers.', 'input'],
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
  ['notes', 'Anything else', 'Context that would help us focus the work.', 'textarea'],
];

/** The optional brief: what the customer tells us about the business. Saved, never submitted. */
export function SetupBrief({ profile }: { profile: SeoOnboardingProfile }) {
  const [form, setForm] = useState<SeoOnboardingChanges>(() =>
    Object.fromEntries(fields.map(([name]) => [name, profile[name]])),
  );
  const [state, formAction, saving] = useActionState(submitSetupBrief, initialState);

  return (
    <form className={portalFormClassName} action={formAction}>
      {state.status === 'error' && <Notice tone="danger">{state.error}</Notice>}
      {state.status === 'success' && !saving && <Notice tone="success">Saved.</Notice>}
      <PortalFieldset disabled={saving} legend="About your business (optional)">
        <div className={portalFieldGridClassName}>
          {fields.map(([name, label, hint, kind]) =>
            kind === 'textarea' ? (
              <PortalField
                key={name}
                multiline
                rows={4}
                label={label}
                hint={hint}
                name={name}
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
            ),
          )}
        </div>
      </PortalFieldset>
      <div className={portalFormActionsClassName}>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
