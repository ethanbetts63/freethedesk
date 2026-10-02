import { FlowCardVisual } from '@/components/visuals/FlowCardVisual';

export function SeoImprovementVisual() {
  return (
    <FlowCardVisual
      browserLabel="experiment"
      inputs={[
        {
          label: 'This cycle',
          title: 'A ranked recommendation',
          description: 'With a hypothesis and a target',
        },
      ]}
      steps={[
        { title: 'Ship', description: 'You, your IT person or we make the change' },
        { title: 'Measure', description: 'Fresh data against the baseline' },
        { title: 'Judge', description: 'Kept and built on, or dropped' },
      ]}
      result={{
        label: 'Next cycle',
        title: 'Proven, not assumed',
        description: 'Every change tracked as an experiment',
      }}
      ariaLabel="How a recommendation becomes an experiment"
    />
  );
}
