import { SplitFeatureSection } from '@/components/SplitFeatureSection';
import { ChecklistCard, LiveDot } from '@/components/visuals/ChecklistCard';

/** Everywhere the code works: the same discount and the same half, wherever it is used. */
const PLACES = [
  { title: 'On air', description: 'Say it in the episode, once or every week.' },
  { title: 'Show notes', description: 'The code and your link, under every episode.' },
  { title: 'Newsletter', description: 'One line to the people who already open your email.' },
  { title: 'Socials', description: 'A post, a pinned comment, a bio link.' },
] as const;

export function AffiliateShare({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="share"
      eyebrow={eyebrow}
      title="One code."
      accentTitle="Say it anywhere."
      description="Your code is a word your listeners type at checkout. It takes 20% off any audit and marks the sale as yours, so it works wherever you put it and whenever they get round to buying. There is nothing to install and no link you have to use."
      visual={
        <ChecklistCard
          mark={<LiveDot />}
          eyebrow="Your code"
          title="Works wherever you say it"
          items={PLACES.map((place) => ({ ...place, tag: 'Tracked' }))}
          ariaLabel="Where an affiliate code can be shared"
        />
      }
      textSide="right"
      background="white"
      spacing="joined"
    />
  );
}
