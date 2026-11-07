'use client';

import { Check, Minus } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { CtaButton } from '@/components/CtaButton';
import { MovingColourButton } from '@/components/MovingColourButton';
import { SectionHeader } from '@/components/SectionHeader';
import { trackSelectPlanOnce } from '@/lib/analytics';
import { type PublicSiteSettings } from '@/lib/api';
import { cn } from '@/lib/utils';

import { AUDIT_READS, buildSeoPlans, reads, type SeoPlan, type SeoPlanCode } from '../_lib/plans';
import { SeoSignupDialog } from './SeoSignupDialog';

/**
 * Three ways to lay the audits out, stacked on the page for the owner to choose between
 * (2026-11-07). Each is the same three plans and opens the same form; only the drawing differs.
 * Once one is chosen the others go.
 */
export type PackagesVariant = 'cards' | 'stage' | 'table';

const KICKER = 'Recommendations based on';

/** One audit's button: the recommended one carries the moving colour, the others are dark. */
function ChooseButton({
  plan,
  onChoose,
  light = false,
  short = false,
}: {
  plan: SeoPlan;
  onChoose: (code: SeoPlanCode) => void;
  /** On a dark card: the plain buttons turn light so they read against it. */
  light?: boolean;
  /** "Choose" alone, where the audit's name is already over the button. */
  short?: boolean;
}) {
  const label = short ? 'Choose' : `Choose ${plan.name}`;
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
      appearance={light ? 'light' : 'dark'}
      direction="right"
      fullWidth
    >
      {label}
    </CtaButton>
  );
}

function TickList({ items, onDark = false }: { items: readonly string[]; onDark?: boolean }) {
  return (
    <ul className="m-0 grid list-none gap-xs p-0">
      {items.map((line) => (
        <li
          key={line}
          className={cn(
            'grid grid-cols-[auto_minmax(0,1fr)] gap-xs text-body-sm leading-snug',
            onDark ? 'text-text-on-dark-muted' : 'text-text-muted',
          )}
        >
          <Check
            aria-hidden="true"
            className={cn(
              'mt-4xs size-[14px]',
              onDark ? 'text-accent-on-dark' : 'text-action-primary',
            )}
          />
          {line}
        </li>
      ))}
    </ul>
  );
}

/**
 * A. Three equal cards on the page's white, flat and bordered; the recommended one wears the
 * moving border and says so. Name, a line on who it is for, the price, what it reads, a button.
 */
function Cards({ plans, onChoose }: { plans: SeoPlan[]; onChoose: (code: SeoPlanCode) => void }) {
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-m p-0 lg:grid-cols-3">
      {plans.map((plan) => (
        <li
          key={plan.code}
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
            <TickList items={plan.features} />
          </div>
          <div className="mt-auto">
            <ChooseButton plan={plan} onChoose={onChoose} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * B. A dark stage: the section is navy, the cards white and raised, and the recommended card
 * stands taller than its neighbours with the accent across its top.
 */
function Stage({ plans, onChoose }: { plans: SeoPlan[]; onChoose: (code: SeoPlanCode) => void }) {
  return (
    <ul className="m-0 grid list-none grid-cols-1 items-center gap-m p-0 lg:grid-cols-3 lg:gap-l">
      {plans.map((plan) => (
        <li
          key={plan.code}
          className={cn(
            'relative flex flex-col overflow-hidden rounded-md bg-surface-page p-xl shadow-block-l',
            plan.recommended && 'lg:py-2xl',
          )}
        >
          {plan.recommended && (
            <>
              <span
                aria-hidden="true"
                className="moving-colour-button absolute inset-x-0 top-0 h-[6px]"
              />
              <span className="mb-s inline-flex w-fit bg-surface-tint-strong px-xs py-2xs text-label font-heavy tracking-label text-text-action uppercase">
                Most chosen
              </span>
            </>
          )}
          <h3 className="m-0 text-lead leading-tight font-heavy tracking-[-0.025em] text-text-primary">
            {plan.name}
          </h3>
          <p className="mt-xs mb-0 min-h-[2lh] text-body-sm leading-snug text-text-muted">
            {plan.summary}
          </p>
          <p className="mt-l mb-0">
            <span className="block text-display leading-none font-heavy tracking-[-0.05em] text-text-primary">
              {plan.price}
            </span>
            <span className="mt-2xs block text-body-sm text-text-muted">{plan.cadence}</span>
          </p>
          <div className="my-l">
            <ChooseButton plan={plan} onChoose={onChoose} />
          </div>
          <div className="border-t border-border-subtle pt-l">
            <span className="mb-s block text-label font-heavy tracking-label text-text-action uppercase">
              {KICKER}
            </span>
            <TickList items={plan.features} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * C. One table: every source an audit reads down the side, the three audits across the top, a tick
 * where an audit reads it. The recommended column is tinted. It answers "what exactly do I get"
 * in one look, and shows the breadth the Analyse section used to try to.
 */
function Table({ plans, onChoose }: { plans: SeoPlan[]; onChoose: (code: SeoPlanCode) => void }) {
  const column = (plan: SeoPlan) => cn('px-m lg:px-l', plan.recommended && 'bg-surface-tint');
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="align-top">
            <th scope="col" className="w-1/3 pt-xl pr-m pb-l align-bottom">
              <span className="block text-label font-heavy tracking-label text-text-action uppercase">
                What each audit reads
              </span>
            </th>
            {plans.map((plan) => (
              <th
                key={plan.code}
                scope="col"
                className={cn(column(plan), 'pt-xl pb-l font-normal')}
              >
                <span className="block text-lead leading-tight font-heavy tracking-[-0.025em] text-text-primary">
                  {plan.name}
                </span>
                <span className="mt-s block text-title leading-none font-heavy tracking-[-0.05em] text-text-primary">
                  {plan.price}
                </span>
                <span className="mt-2xs block text-body-sm text-text-muted">{plan.cadence}</span>
                <div className="mt-m">
                  <ChooseButton plan={plan} onChoose={onChoose} short />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {AUDIT_READS.map((row) => (
            <tr key={row.label} className="border-t border-border-subtle">
              <th
                scope="row"
                className="py-s pr-m text-body-sm leading-snug font-normal text-text-secondary"
              >
                {row.label}
              </th>
              {plans.map((plan) => (
                <td key={plan.code} className={cn(column(plan), 'py-s')}>
                  {reads(plan.code, row.from) ? (
                    <Check aria-label="Included" className="size-[18px] text-action-primary" />
                  ) : (
                    <Minus aria-label="Not included" className="size-[18px] text-text-subtle" />
                  )}
                </td>
              ))}
            </tr>
          ))}
          <tr className="border-t border-border-subtle">
            <td className="pt-l" />
            {plans.map((plan) => (
              <td key={plan.code} className={cn(column(plan), 'pt-l pb-xl')}>
                <ChooseButton plan={plan} onChoose={onChoose} short />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const LAYOUTS: Record<PackagesVariant, typeof Cards> = { cards: Cards, stage: Stage, table: Table };

/**
 * The audits a customer can buy, each with a button that opens the order form over the page. The
 * form keeps the choice and lets it change. `id="signup"` is where the hero's button lands.
 */
export function SeoPackages({
  settings,
  variant,
  id,
  /** The owner's label while the three are compared; gone once one is chosen. */
  optionLabel,
}: {
  settings: PublicSiteSettings;
  variant: PackagesVariant;
  id?: string;
  optionLabel?: string;
}) {
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

  const Layout = LAYOUTS[variant];
  const dark = variant === 'stage';

  return (
    <section
      id={id}
      aria-label="Audits"
      className={cn('py-section', dark ? 'bg-surface-dark text-text-on-dark' : 'bg-surface-page')}
    >
      <div className="site-shell">
        {optionLabel && (
          <p
            className={cn(
              'm-0 mb-xl inline-block border px-s py-2xs text-label font-heavy tracking-label uppercase',
              dark
                ? 'border-border-on-dark text-text-on-dark-muted'
                : 'border-border-danger text-text-danger',
            )}
          >
            {optionLabel}
          </p>
        )}
        <div className="mb-xl max-w-measure-tight">
          <SectionHeader
            eyebrow="Audits"
            title="Choose your"
            accentTitle="audit."
            size="display-sm"
            onDark={dark}
            titleClassName={dark ? 'text-text-on-dark' : undefined}
          />
          <p
            className={cn(
              'mt-m mb-0 text-lead leading-relaxed',
              dark ? 'text-text-on-dark-muted' : 'text-text-muted',
            )}
          >
            One written report of your site, paid once. The three differ in what they read.
          </p>
        </div>
        <Layout plans={plans} onChoose={open} />
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
