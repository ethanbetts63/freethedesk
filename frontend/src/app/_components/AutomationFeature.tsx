import { CtaButton } from '@/components/CtaButton';
import { SplitFeatureSection } from '@/components/SplitFeatureSection';

import { AutomationFeatureVisual } from './AutomationFeatureVisual';

export function AutomationFeature() {
  return (
    <SplitFeatureSection
      id="automation"
      eyebrow="Business automation Perth"
      title="Automation built"
      accentTitle="around your business."
      description="We connect the systems you already use and build the missing pieces, so information moves without your team moving it by hand."
      action={
        <CtaButton href="/automation" size="compact">
          Explore business automation
        </CtaButton>
      }
      visual={<AutomationFeatureVisual />}
      textSide="right"
    />
  );
}
