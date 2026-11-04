import type { Metadata } from 'next';

import { GuideHero } from '@/components/marketing/GuideHero';

import { GuideCta } from './_components/GuideCta';
import { GuideIndex } from '@/components/guides/GuideIndex';
import { GuideTrail } from '@/components/guides/GuideTrail';
import { PageSchema } from '@/components/PageSchema';
import { guideCards } from '@/lib/guideView';
import { metadataFor, STATIC_PAGES } from '@/lib/pages';

export const metadata: Metadata = metadataFor('/guides');

export default function GuidesPage() {
  return (
    <main>
      <PageSchema path="/guides" />
      <GuideHero
        title="SEO and website development guides"
        description={STATIC_PAGES['/guides'].description}
      />

      <section className="bg-surface-page py-section-half" aria-label="All guides">
        <div className="site-shell">
          <div>
            <GuideTrail trail={[{ href: '/', label: 'Home' }, { label: 'Guides' }]} />
            <GuideIndex guides={guideCards()} />
          </div>
        </div>
      </section>

      <GuideCta kind="seo" />
    </main>
  );
}
