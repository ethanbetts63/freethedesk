import { SplitFeatureSection } from '@/components/SplitFeatureSection';
import { FlowCardVisual, type FlowCardNode } from '@/components/visuals/FlowCardVisual';

export type JourneyContent = {
  title: string;
  accentTitle: string;
  description: string;
  bullets: readonly string[];
  flow: {
    browserLabel: string;
    start: FlowCardNode;
    steps: readonly Omit<FlowCardNode, 'label'>[];
    end: FlowCardNode;
    ariaLabel: string;
  };
};

/**
 * A customer's path from first click to finished task: copy on the right, a
 * flow card on the left. The section id is what each service page's
 * introduction scrolls to, so it is fixed here.
 */
export function JourneySection({ eyebrow, content }: { eyebrow: string; content: JourneyContent }) {
  const { flow } = content;
  return (
    <SplitFeatureSection
      id="customer-journeys"
      eyebrow={eyebrow}
      title={content.title}
      accentTitle={content.accentTitle}
      titleBreak="desktop"
      description={content.description}
      bullets={content.bullets}
      visual={
        <FlowCardVisual
          browserLabel={flow.browserLabel}
          inputs={[flow.start]}
          steps={flow.steps}
          result={flow.end}
          ariaLabel={flow.ariaLabel}
        />
      }
      textSide="right"
      spacing="joined"
    />
  );
}
