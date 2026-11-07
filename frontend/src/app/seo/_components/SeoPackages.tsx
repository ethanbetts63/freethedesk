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

/**
 * Three drawings of the same layout, stacked on the page for the owner to choose between
 * (2026-11-07): three equal cards, name, a line on who it suits, the price, what it reads, a button.
 * They differ only in how the recommended card is marked and what the three sit on. Once one is
 * chosen the others go.
 *
 * - `outline`: white cards with a hairline border on the page's white; the recommended one wears the
 *   moving border.
 * - `filled`: the recommended card is filled navy, as a chosen card is across the site's forms; the
 *   others stay white.
 * - `joined`: one frame on a tinted band, the cards divided by rules rather than gaps; the recommended
 *   one carries the moving colour across its top.
 */
export type PackagesVariant = 'outline' | 'filled' | 'joined';

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

/** The recommended card's word, in the card's top right. */
function RecommendedTag({ onDark = false, pill = false }: { onDark?: boolean; pill?: boolean }) {
  return (
    <span
      className={cn(
        'text-label font-heavy tracking-label uppercase',
        onDark ? 'text-accent-on-dark' : 'text-text-action',
        pill && 'bg-surface-tint-strong px-xs py-2xs',
      )}
    >
      Recommended
    </span>
  );
}

function Card({
  plan,
  variant,
  onChoose,
}: {
  plan: SeoPlan;
  variant: PackagesVariant;
  onChoose: (code: SeoPlanCode) => void;
}) {
  const dark = variant === 'filled' && Boolean(plan.recommended);
  return (
    <li
      className={cn(
        'relative flex flex-col p-xl',
        variant === 'outline' &&
          (plan.recommended
            ? 'moving-colour-border bg-surface-page'
            : 'border border-border-default bg-surface-page'),
        variant === 'filled' &&
          (dark
            ? 'bg-surface-dark text-text-on-dark'
            : 'border border-border-default bg-surface-page'),
        variant === 'joined' && 'bg-surface-page lg:pt-2xl',
      )}
    >
      {variant === 'joined' && plan.recommended && (
        <span
          aria-hidden="true"
          // The button class for its gradient and motion alone: its tap-height floor lifted, so the band is its height.
          className="moving-colour-button absolute inset-x-0 top-0 h-[5px] min-h-0"
        />
      )}
      <div className="flex items-baseline justify-between gap-s">
        <h3
          className={cn(
            'm-0 text-lead leading-tight font-heavy tracking-[-0.025em]',
            dark ? 'text-text-on-dark' : 'text-text-primary',
          )}
        >
          {plan.name}
        </h3>
        {plan.recommended && <RecommendedTag onDark={dark} pill={variant === 'joined'} />}
      </div>
      <p
        className={cn(
          'mt-xs mb-0 min-h-[2lh] text-body-sm leading-snug',
          dark ? 'text-text-on-dark-muted' : 'text-text-muted',
        )}
      >
        {plan.summary}
      </p>
      <p className="mt-l mb-0 flex items-baseline gap-xs">
        <span
          className={cn(
            'text-title leading-none font-heavy tracking-[-0.05em]',
            dark ? 'text-text-on-dark' : 'text-text-primary',
          )}
        >
          {plan.price}
        </span>
        <span className={cn('text-body-sm', dark ? 'text-text-on-dark-muted' : 'text-text-muted')}>
          {plan.cadence}
        </span>
      </p>
      <div
        className={cn(
          'mt-l mb-xl border-t pt-l',
          dark ? 'border-border-on-dark' : 'border-border-subtle',
        )}
      >
        <span
          className={cn(
            'mb-s block text-label font-heavy tracking-label uppercase',
            dark ? 'text-accent-on-dark' : 'text-text-action',
          )}
        >
          {KICKER}
        </span>
        <TickList items={plan.features} onDark={dark} />
      </div>
      <div className="mt-auto">
        <ChooseButton plan={plan} onChoose={onChoose} />
      </div>
    </li>
  );
}

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

  const joined = variant === 'joined';

  return (
    <section
      id={id}
      aria-label="Audits"
      className={cn('py-section', joined ? 'bg-surface-tint' : 'bg-surface-page')}
    >
      <div className="site-shell">
        {optionLabel && (
          <p className="m-0 mb-xl inline-block border border-border-danger px-s py-2xs text-label font-heavy tracking-label text-text-danger uppercase">
            {optionLabel}
          </p>
        )}
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
        <ul
          className={cn(
            'm-0 grid list-none grid-cols-1 p-0 lg:grid-cols-3',
            // The frame: one border round the three, and the gap shows the border colour as the rules between them.
            joined ? 'gap-px border border-border-default bg-border-default' : 'gap-m',
          )}
        >
          {plans.map((plan) => (
            <Card key={plan.code} plan={plan} variant={variant} onChoose={open} />
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
