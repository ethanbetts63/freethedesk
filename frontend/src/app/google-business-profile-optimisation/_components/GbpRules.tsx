import { X } from 'lucide-react';

import { SplitFeatureSection } from '@/components/SplitFeatureSection';

/** What we won't do, each with the Google rule it breaks. */
const NEVER = [
  {
    title: 'Keywords in your business name',
    body: 'The name must be your real-world name. Extras in it can get the profile suspended.',
  },
  {
    title: 'Fake or incentivised reviews',
    body: 'Reviews must come from real customers, unpaid. Google removes the ones that aren’t.',
  },
  {
    title: 'Review gating',
    body: 'Asking only happy customers for a review breaks the same policy.',
  },
  {
    title: 'Link building',
    body: 'Bought or swapped links are link spam, and can drop a site down or out of results.',
  },
] as const;

function NeverList() {
  return (
    <ul className="m-0 grid list-none gap-m rounded-lg border border-border-default bg-surface-page p-l sm:p-xl">
      {NEVER.map((item) => (
        <li key={item.title} className="grid grid-cols-[auto_minmax(0,1fr)] gap-s">
          <X aria-hidden="true" className="mt-4xs size-[18px] text-text-danger" />
          <div>
            <strong className="block text-body font-heavy text-text-primary">{item.title}</strong>
            <span className="mt-2xs block text-body-sm leading-snug text-text-muted">
              {item.body}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function GbpRules({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="rules"
      eyebrow={eyebrow}
      title="What we won't do,"
      accentTitle="because Google penalises it"
      description="Some profile tricks work for a few weeks and then cost you the profile, your reviews or your rankings. We don't do them, at any price."
      visual={<NeverList />}
      textSide="left"
      background="white"
      spacing="joined"
    />
  );
}
