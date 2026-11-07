'use client';

import { Check } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { CtaButton } from '@/components/CtaButton';
import { MovingColourButton } from '@/components/MovingColourButton';
import { SectionHeader } from '@/components/SectionHeader';
import { trackSelectPlanOnce } from '@/lib/analytics';
import { type PublicSiteSettings } from '@/lib/api';
import { cn } from '@/lib/utils';

import { buildSeoPlans, type SeoPlan, type SeoPlanCode } from '../_lib/plans';
import { SeoSignupDialog } from './SeoSignupDialog';

const KICKER = 'Recommendations based on';

/** One audit's button: the recommended one carries the moving colour, the others are dark. */
function ChooseButton({
  plan,
  onChoose,
}: {
  plan: SeoPlan;
  onChoose: (code: SeoPlanCode) => void;
}) {
  const label = `Choose ${plan.name}`;
  if (plan.recommended) {
    return (
      <MovingColourButton
        type="button"
        onClick={() => onChoose(plan.code)}
        direction="right"
        fullWidth
      >
        {label}
      </MovingColourButton>
    );
  }
  return (
    <CtaButton
      type="button"
      onClick={() => onChoose(plan.code)}
      appearance="dark"
      direction="right"
      fullWidth
    >
      {label}
    </CtaButton>
  );
}

/**
 * One audit: its name, a line on who it suits, the price, what it reads, a button. Three equal
 * white cards with a hairline border; the recommended one wears the moving border and says so
 * (owner, 2026-11-07, chosen over a filled card and a joined frame).
 */
function Card({ plan, onChoose }: { plan: SeoPlan; onChoose: (code: SeoPlanCode) => void }) {
  return (
    <li
      className={cn(
        'flex flex-col bg-surface-page p-xl',
        plan.recommended ? 'moving-colour-border' : 'border border-border-default',
      )}
    >
      <div className="flex items-baseline justify-between gap-s">
        <h3 className="m-0 text-lead leading-tight font-heavy tracking-[-0.025em] text-text-primary">
          {plan.name}
        </h3>
        {plan.recommended && (
          <span className="text-label font-heavy tracking-label text-text-action uppercase">
            Recommended
          </span>
        )}
      </div>
      <p className="mt-xs mb-0 min-h-[2lh] text-body-sm leading-snug text-text-muted">
        {plan.summary}
      </p>
      <p className="mt-l mb-0 flex items-baseline gap-xs">
        <span className="text-title leading-none font-heavy tracking-[-0.05em] text-text-primary">
          {plan.price}
        </span>
        <span className="text-body-sm text-text-muted">{plan.cadence}</span>
      </p>
      <div className="mt-l mb-xl border-t border-border-subtle pt-l">
        <span className="mb-s block text-label font-heavy tracking-label text-text-action uppercase">
          {KICKER}
        </span>
        <ul className="m-0 grid list-none gap-xs p-0">
          {plan.features.map((line) => (
            <li
              key={line}
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-xs text-body-sm leading-snug text-text-muted"
            >
              <Check aria-hidden="true" className="mt-4xs size-[14px] text-action-primary" />
              {line}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto">
        <ChooseButton plan={plan} onChoose={onChoose} />
      </div>
    </li>
  );
}

/**
 * The audits a customer can buy, each with a button that opens the order form over the page
 * (SeoSignupDialog). The form keeps the choice and lets it change. `id="signup"` is where the
 * hero's button lands.
 */
export function SeoPackages({ settings }: { settings: PublicSiteSettings }) {
  const plans = useMemo(() => buildSeoPlans(settings), [settings]);
  const [selectedCode, setSelectedCode] = useState<SeoPlanCode>(
    (plans.find((plan) => plan.recommended) ?? plans[0]).code,
  );
  const dialogRef = useRef<HTMLDialogElement>(null);

  const choose = (code: SeoPlanCode) => {
    setSelectedCode(code);
    trackSelectPlanOnce('seo', code);
  };
  const open = (code: SeoPlanCode) => {
    choose(code);
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  };

  return (
    <section id="signup" aria-label="Audits" className="bg-surface-page py-section">
      <div className="site-shell">
        <div className="mb-xl max-w-measure-tight">
          <SectionHeader
            eyebrow="Audits"
            title="Choose your"
            accentTitle="audit."
            size="display-sm"
          />
          <p className="mt-m mb-0 text-lead leading-relaxed text-text-muted">
            One written report of your site, paid once. The three differ in what they read.
          </p>
        </div>
        <ul className="m-0 grid list-none grid-cols-1 gap-m p-0 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.code} plan={plan} onChoose={open} />
          ))}
        </ul>
      </div>
      <SeoSignupDialog
        dialogRef={dialogRef}
        plans={plans}
        selectedCode={selectedCode}
        onChoose={choose}
        settings={settings}
      />
    </section>
  );
}
