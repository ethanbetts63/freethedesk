import type { ReactNode } from 'react';

import { SeoReportVisual } from './SeoReportVisual';
import { SplitFeatureSection } from './SplitFeatureSection';

type SeoReportOverviewProps = {
  eyebrow: string;
  description: ReactNode;
  title?: string;
  accentTitle?: string;
  id?: string;
  className?: string;
  mode?: 'report' | 'improvement';
  spacing?: 'standard' | 'compact' | 'joined';
  textSide?: 'left' | 'right';
  action?: ReactNode;
};

export function SeoReportOverview({
  eyebrow,
  description,
  title = 'One document.',
  accentTitle = 'Four sections.',
  id,
  className = '',
  mode = 'report',
  spacing = 'compact',
  textSide = 'left',
  action,
}: SeoReportOverviewProps) {
  return (
    <SplitFeatureSection
      id={id}
      eyebrow={eyebrow}
      title={title}
      accentTitle={accentTitle}
      description={description}
      visual={<SeoReportVisual mode={mode} />}
      textSide={textSide}
      spacing={spacing}
      className={className}
      action={action}
    />
  );
}
