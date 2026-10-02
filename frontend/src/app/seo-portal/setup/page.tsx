'use client';

import { useEffect, useState } from 'react';

import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';
import {
  checkSeoSetupStep,
  getSeoOnboarding,
  getSeoSetup,
  markSeoSetupStep,
  type SeoOnboardingProfile,
  type SeoSetup,
  type SeoSetupCheckResult,
  type SeoSetupKey,
} from '@/lib/seoApi';
import { SetupBrief } from './_components/SetupBrief';
import { SetupStepCard } from './_components/SetupStepCard';

const sectionHeadingClassName = 'm-0 text-lead';
const stepListClassName = 'grid gap-m';

export default function SeoPortalSetupPage() {
  const [setup, setSetup] = useState<SeoSetup | null>(null);
  const [profile, setProfile] = useState<SeoOnboardingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyKey, setBusyKey] = useState<SeoSetupKey | null>(null);
  const [checkResults, setCheckResults] = useState<
    Partial<Record<SeoSetupKey, SeoSetupCheckResult>>
  >({});

  useEffect(() => {
    Promise.all([getSeoSetup(), getSeoOnboarding()])
      .then(([loadedSetup, loadedProfile]) => {
        setSetup(loadedSetup);
        setProfile(loadedProfile);
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Your setup could not be loaded.'),
      )
      .finally(() => setLoading(false));
  }, []);

  const act = async (key: SeoSetupKey, run: () => Promise<SeoSetup>) => {
    setBusyKey(key);
    setError('');
    try {
      setSetup(await run());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'That could not be saved. Try again.');
    } finally {
      setBusyKey(null);
    }
  };

  const mark = (key: SeoSetupKey, done: boolean) => act(key, () => markSeoSetupStep(key, done));
  const check = (key: SeoSetupKey) =>
    act(key, async () => {
      const { result, ...updated } = await checkSeoSetupStep(key);
      setCheckResults((current) => ({ ...current, [key]: result }));
      return updated;
    });

  if (loading)
    return (
      <div className={pageClassName}>
        <p className="text-text-subtle">Loading your setup…</p>
      </div>
    );
  if (!setup || !profile)
    return (
      <div className={pageClassName}>
        <Notice tone="danger">{error}</Notice>
      </div>
    );

  const required = setup.steps.filter((step) => step.required);
  const optional = setup.steps.filter((step) => !step.required);
  const card = (step: SeoSetup['steps'][number]) => (
    <SetupStepCard
      key={step.key}
      step={step}
      busy={busyKey === step.key}
      checkResult={checkResults[step.key]}
      onMark={(done) => mark(step.key, done)}
      onCheck={() => check(step.key)}
    />
  );

  return (
    <div className={pageClassName}>
      <PageHeader
        kicker="SEO portal"
        title="Setup"
        subtitle="Give us read-only access to your tools. Search Console is all we need to start; the rest make the report better."
      />

      {error && <Notice tone="danger">{error}</Notice>}
      {setup.complete ? (
        <Notice tone="success">
          Search Console is connected, so reporting has started. Anything else you add below goes
          into the next report.
        </Notice>
      ) : (
        <Notice tone="warning">Reporting starts once Search Console is connected.</Notice>
      )}

      <h2 className={sectionHeadingClassName}>Required</h2>
      <div className={stepListClassName}>{required.map(card)}</div>

      <h2 className={sectionHeadingClassName}>Optional</h2>
      <p className="m-0 text-body-sm text-text-muted">
        Skip any you don&apos;t use. Every role is read-only, except the Business Profile, which has
        none; we don&apos;t change your listing.
      </p>
      <div className={stepListClassName}>{optional.map(card)}</div>

      <SetupBrief profile={profile} />

      <p className="m-0 text-label text-text-subtle">
        We also browse your site as a customer would. We fill in forms with test values but never
        send them, and never reach a payment page.
      </p>
    </div>
  );
}
