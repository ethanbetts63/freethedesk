'use client';

import { type ReactNode, useEffect, useState } from 'react';

import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';
import { getSeoSetup, markSeoSetupStep, type SeoSetup, type SeoSetupKey } from '@/lib/seoApi';
import { SetupStepCard } from './SetupStepCard';

const stepListClassName = 'grid gap-m';

/**
 * The setup checklist a subscriber works through: each tool, how to grant access, and where it
 * stands. The SEO portal's setup page is this with its own words; so is the affiliate
 * portal's free-audit page, because an affiliate's audit is an SEO account on the same login.
 */
export function SetupChecklist({
  kicker,
  title,
  subtitle,
  intro,
}: {
  kicker?: string;
  title: string;
  subtitle: string;
  /** Anything to say between the status notice and the steps. */
  intro?: ReactNode;
}) {
  const [setup, setSetup] = useState<SeoSetup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyKey, setBusyKey] = useState<SeoSetupKey | null>(null);

  useEffect(() => {
    getSeoSetup()
      .then(setSetup)
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

  if (loading)
    return (
      <div className={pageClassName}>
        <p className="text-text-subtle">Loading your setup…</p>
      </div>
    );
  if (!setup)
    return (
      <div className={pageClassName}>
        <Notice tone="danger">{error}</Notice>
      </div>
    );

  // Required first; each card says which it is.
  const steps = [...setup.steps].sort((a, b) => Number(b.required) - Number(a.required));
  const card = (step: SeoSetup['steps'][number]) => (
    <SetupStepCard
      key={step.key}
      step={step}
      busy={busyKey === step.key}
      onMark={(done) => mark(step.key, done)}
    />
  );

  return (
    <div className={pageClassName}>
      <PageHeader kicker={kicker} title={title} subtitle={subtitle} />

      {error && <Notice tone="danger">{error}</Notice>}
      {setup.complete && (
        <Notice tone="success">
          Search Console is connected, so your audit is under way. Anything else you add below goes
          into it.
        </Notice>
      )}

      {intro}

      <div className={stepListClassName}>{steps.map(card)}</div>
    </div>
  );
}
